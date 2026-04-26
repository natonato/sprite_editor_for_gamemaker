import React, { useEffect, useRef, useState, useCallback } from "react";
import "scss/collisionMapPage.scss";

type ShapeType = 
  | "FULL" 
  | "MARGIN_4PX" 
  | "HALF_TOP" | "HALF_BOTTOM" | "HALF_LEFT" | "HALF_RIGHT"
  | "DIAG_TL" | "DIAG_TR" | "DIAG_BL" | "DIAG_BR";

type ToolType = "PENCIL" | "ERASER" | "FILL";

const CollisionMapPage = () => {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [tileSize, setTileSize] = useState(48);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("FULL");
  const [selectedTool, setSelectedTool] = useState<ToolType>("PENCIL");
  const [collisionTiles, setCollisionTiles] = useState<Record<string, ShapeType>>({});
  const [history, setHistory] = useState<Record<string, ShapeType>[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0.8);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const collisionCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);

  const saveHistory = useCallback(() => {
    setHistory(prev => [collisionTiles, ...prev].slice(0, 50));
  }, [collisionTiles]);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const [prev, ...rest] = history;
      setCollisionTiles(prev);
      setHistory(rest);
    }
  }, [history]);

  const downloadCollisionMap = useCallback(async () => {
    if (!bgImage) return;
    const canvas = document.createElement("canvas");
    canvas.width = bgImage.width;
    canvas.height = bgImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    Object.entries(collisionTiles).forEach(([key, shape]) => {
      const [x, y] = key.split(",").map(Number);
      drawShape(ctx, x, y, tileSize, shape);
    });

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
    if (!blob) return;

    const projectData = JSON.stringify({ tileSize, collisionTiles });
    const footer = `\nQM_COLLISION_DATA:${projectData}`;
    const finalBlob = new Blob([blob, footer], { type: "image/png" });

    const link = document.createElement("a");
    link.download = "collision_map.png";
    link.href = URL.createObjectURL(finalBlob);
    link.click();
  }, [bgImage, collisionTiles, tileSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        downloadCollisionMap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, downloadCollisionMap]);

  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: ShapeType) => {
    ctx.beginPath();
    const px = x * size;
    const py = y * size;
    switch (shape) {
      case "FULL": ctx.rect(px, py, size, size); break;
      case "MARGIN_4PX": ctx.rect(px + 4, py + 4, size - 8, size - 8); break;
      case "HALF_TOP": ctx.rect(px, py, size, size / 2); break;
      case "HALF_BOTTOM": ctx.rect(px, py + size / 2, size, size / 2); break;
      case "HALF_LEFT": ctx.rect(px, py, size / 2, size); break;
      case "HALF_RIGHT": ctx.rect(px + size / 2, py, size / 2, size); break;
      case "DIAG_TL": ctx.moveTo(px, py); ctx.lineTo(px + size, py); ctx.lineTo(px, py + size); break;
      case "DIAG_TR": ctx.moveTo(px, py); ctx.lineTo(px + size, py); ctx.lineTo(px + size, py + size); break;
      case "DIAG_BL": ctx.moveTo(px, py); ctx.lineTo(px, py + size); ctx.lineTo(px + size, py + size); break;
      case "DIAG_BR": ctx.moveTo(px + size, py); ctx.lineTo(px + size, py + size); ctx.lineTo(px, py + size); break;
    }
    ctx.fill();
  };

  const processFile = async (file: File) => {
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          if (json.collisionTiles) {
            setCollisionTiles(json.collisionTiles);
            if (json.tileSize) setTileSize(json.tileSize);
          } else if (json.width && json.height) {
            const dummyCanvas = document.createElement("canvas");
            dummyCanvas.width = json.width * tileSize;
            dummyCanvas.height = json.height * tileSize;
            const img = new Image();
            img.src = dummyCanvas.toDataURL();
            img.onload = () => { setBgImage(img); setCollisionTiles({}); };
          }
        } catch (e) { console.error("Invalid JSON"); }
      };
      reader.readAsText(file);
      return;
    }

    if (!file.type.startsWith("image/")) return;

    const buffer = await file.arrayBuffer();
    const view = new Uint8Array(buffer);
    const content = new TextDecoder().decode(view);
    const marker = "QM_COLLISION_DATA:";
    const markerIdx = content.indexOf(marker);

    if (markerIdx !== -1) {
      try {
        const jsonStr = content.substring(markerIdx + marker.length);
        const data = JSON.parse(jsonStr);
        if (data.collisionTiles) {
          setCollisionTiles(data.collisionTiles);
          if (data.tileSize) setTileSize(data.tileSize);
          return; // Keep existing background
        }
      } catch (e) { console.error(e); }
    }

    // If no embedding, treat as new background
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        setBgImage(img);
        setCollisionTiles({});
      };
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!bgImage) return;
    [bgCanvasRef, collisionCanvasRef, gridCanvasRef, interactionCanvasRef].forEach(ref => {
      if (ref.current) { ref.current.width = bgImage.width; ref.current.height = bgImage.height; }
    });
    const bgCtx = bgCanvasRef.current?.getContext("2d");
    if (bgCtx) { bgCtx.clearRect(0, 0, bgImage.width, bgImage.height); bgCtx.drawImage(bgImage, 0, 0); }
    const gridCtx = gridCanvasRef.current?.getContext("2d");
    if (gridCtx) {
      gridCtx.clearRect(0, 0, bgImage.width, bgImage.height);
      gridCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      gridCtx.lineWidth = 1;
      for (let x = 0; x <= bgImage.width; x += tileSize) { gridCtx.beginPath(); gridCtx.moveTo(x, 0); gridCtx.lineTo(x, bgImage.height); gridCtx.stroke(); }
      for (let y = 0; y <= bgImage.height; y += tileSize) { gridCtx.beginPath(); gridCtx.moveTo(0, y); gridCtx.lineTo(bgImage.width, y); gridCtx.stroke(); }
    }
  }, [bgImage, tileSize]);

  const redrawCollisions = useCallback(() => {
    const ctx = collisionCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    Object.entries(collisionTiles).forEach(([key, shape]) => {
      const [x, y] = key.split(",").map(Number);
      drawShape(ctx, x, y, tileSize, shape);
    });
  }, [collisionTiles, tileSize]);

  useEffect(() => { redrawCollisions(); }, [redrawCollisions]);

  const performFill = (startX: number, startY: number) => {
    if (!bgImage) return;
    saveHistory();
    const mapWidth = Math.ceil(bgImage.width / tileSize);
    const mapHeight = Math.ceil(bgImage.height / tileSize);
    const targetKey = `${startX},${startY}`;
    const targetShape = collisionTiles[targetKey];
    if (targetShape === selectedShape) return;
    const newTiles = { ...collisionTiles };
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    visited.add(targetKey);
    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      newTiles[`${x},${y}`] = selectedShape;
      [[x+1, y], [x-1, y], [x, y+1], [x, y-1]].forEach(([nx, ny]) => {
        const nKey = `${nx},${ny}`;
        if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight && !visited.has(nKey) && collisionTiles[nKey] === targetShape) {
          visited.add(nKey); queue.push([nx, ny]);
        }
      });
    }
    setCollisionTiles(newTiles);
  };

  const handleInteraction = (e: React.MouseEvent<HTMLCanvasElement>, isMove: boolean = false) => {
    if (!bgImage) return;
    if (isMove && !isPainting) return;
    const rect = interactionCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    const key = `${x},${y}`;

    if (!isMove) saveHistory();
    if (e.button === 2) { setCollisionTiles(prev => { const next = { ...prev }; delete next[key]; return next; }); return; }
    if (selectedTool === "FILL") { if (!isMove) performFill(x, y); return; }
    if (selectedTool === "ERASER") { setCollisionTiles(prev => { const next = { ...prev }; delete next[key]; return next; }); }
    else { setCollisionTiles(prev => ({ ...prev, [key]: selectedShape })); }
  };

  return (
    <div className={`collisionMapPage ${isDragging ? "dragging" : ""}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}>
      {isDragging && <div className="drop-overlay">Drop Background or Smart PNG</div>}
      <div className="controls">
        <div className="control-group"><b>Load:</b> <input type="file" accept="image/*,.json" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} /></div>
        <div className="control-group"><label>Tile Size:</label><input type="number" value={tileSize} onChange={(e) => setTileSize(Number(e.target.value))} style={{ width: "60px" }} /></div>
        <div className="control-group"><label>BG Opacity:</label><input type="range" min="0" max="1" step="0.1" value={bgOpacity} onChange={(e) => setBgOpacity(Number(e.target.value))} /></div>
        <div className="control-group" style={{ borderLeft: "1px solid #ccc", paddingLeft: "15px" }}>
          <b>Tools:</b>
          <div className="shape-selector">
            <button className={`shape-btn ${selectedTool === "PENCIL" ? "active" : ""}`} onClick={() => setSelectedTool("PENCIL")} title="Pencil (B)"><svg viewBox="0 0 48 48"><path d="M10 34L34 10L38 14L14 38L10 34Z" fill="currentColor" /></svg></button>
            <button className={`shape-btn ${selectedTool === "FILL" ? "active" : ""}`} onClick={() => setSelectedTool("FILL")} title="Paint Bucket (F)">
                <svg viewBox="0 0 48 48">
                    <path d="M12 20L22 10L38 26L28 36L12 20ZM10 22L26 38H40V34L30 24L10 22Z" fill="currentColor" />
                    <path d="M8 40C8 40 12 40 12 36C12 32 8 32 8 32C8 32 4 32 4 36C4 40 8 40 8 40Z" fill="currentColor" />
                </svg>
            </button>
            <button className={`shape-btn ${selectedTool === "ERASER" ? "active" : ""}`} onClick={() => setSelectedTool("ERASER")} title="Eraser (E)"><svg viewBox="0 0 48 48"><path d="M40 10L10 40M10 10L40 40" stroke="currentColor" strokeWidth="4" /></svg></button>
            <button className="shape-btn" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)"><svg viewBox="0 0 48 48"><path d="M12 20H28C34 20 38 24 38 30C38 36 34 40 28 40H12V36H28C32 36 34 34 34 30C34 26 32 24 28 24H12L18 30L15 33L7 25L15 17L18 20L12 26Z" fill="currentColor" /></svg></button>
          </div>
        </div>
        <div className="control-group" style={{ borderLeft: "1px solid #ccc", paddingLeft: "15px" }}>
          <b>Shapes:</b>
          <div className="shape-selector">
            {(["FULL", "MARGIN_4PX", "HALF_TOP", "HALF_BOTTOM", "HALF_LEFT", "HALF_RIGHT", "DIAG_TL", "DIAG_TR", "DIAG_BL", "DIAG_BR"] as ShapeType[]).map(shape => (
              <button key={shape} className={`shape-btn ${selectedShape === shape && selectedTool !== "ERASER" ? "active" : ""}`} onClick={() => { setSelectedShape(shape); if(selectedTool === "ERASER") setSelectedTool("PENCIL"); }} title={shape}>
                <svg viewBox="0 0 48 48">
                  {shape === "FULL" && <rect x="4" y="4" width="40" height="40" fill="currentColor" />}
                  {shape === "MARGIN_4PX" && <rect x="8" y="8" width="32" height="32" fill="currentColor" />}
                  {shape === "HALF_TOP" && <rect x="4" y="4" width="40" height="20" fill="currentColor" />}
                  {shape === "HALF_BOTTOM" && <rect x="4" y="24" width="40" height="20" fill="currentColor" />}
                  {shape === "HALF_LEFT" && <rect x="4" y="4" width="20" height="40" fill="currentColor" />}
                  {shape === "HALF_RIGHT" && <rect x="24" y="4" width="20" height="40" fill="currentColor" />}
                  {shape === "DIAG_TL" && <polygon points="4,4 44,4 4,44" fill="currentColor" />}
                  {shape === "DIAG_TR" && <polygon points="4,4 44,4 44,44" fill="currentColor" />}
                  {shape === "DIAG_BL" && <polygon points="4,4 4,44 44,44" fill="currentColor" />}
                  {shape === "DIAG_BR" && <polygon points="44,4 44,44 4,44" fill="currentColor" />}
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="downloadBtn" onClick={downloadCollisionMap} disabled={!bgImage} style={{ background: "#4b5263", color: "white" }}>Save Smart PNG (Ctrl+S)</button>
      </div>
      <div className="editor-container">
        <div className="canvas-viewport">
          {bgImage ? (
            <div className="canvas-stack" style={{ width: bgImage.width, height: bgImage.height }}>
              <canvas ref={bgCanvasRef} className="bg-canvas" style={{ opacity: bgOpacity }} />
              <canvas ref={collisionCanvasRef} className="collision-canvas" />
              <canvas ref={gridCanvasRef} className="grid-canvas" />
              <canvas ref={interactionCanvasRef} className="interaction-canvas" onMouseDown={(e) => { setIsPainting(true); handleInteraction(e, false); }} onMouseMove={(e) => handleInteraction(e, true)} onMouseUp={() => setIsPainting(false)} onMouseLeave={() => setIsPainting(false)} onContextMenu={(e) => { e.preventDefault(); }} />
            </div>
          ) : <div style={{ padding: "100px", textAlign: "center", color: "#888" }}>Please upload Background Map or Smart PNG.</div>}
        </div>
      </div>
    </div>
  );
};

export default CollisionMapPage;
