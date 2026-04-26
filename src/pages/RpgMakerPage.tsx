import React, { useEffect, useRef, useState, useCallback } from "react";
import "scss/rpgMakerPage.scss";

interface UploadedImage {
  name: string;
  img: HTMLImageElement;
}

const PRESETS = {
  CUSTOM: { name: "Custom", w: 16, h: 16 },
  A1_A2: { name: "A1, A2 (Ground)", w: 16, h: 12 },
  A3: { name: "A3 (Buildings)", w: 16, h: 8 },
  A4: { name: "A4 (Walls)", w: 16, h: 15 },
  A5: { name: "A5 (Normal)", w: 8, h: 16 },
  B_C_D_E: { name: "B, C, D, E (Basic 1x)", w: 16, h: 16 },
  BASIC_MAX: { name: "B-E Max (Basic 4x Long)", w: 16, h: 64 },
};

const RpgMakerPage = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [tileSize, setTileSize] = useState(48);
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [mergedSize, setMergedSize] = useState({ w: 16, h: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState<{ x: number; y: number } | null>(null);

  const [history, setHistory] = useState<string[]>([]);

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceGridCanvasRef = useRef<HTMLCanvasElement>(null);
  const mergedCanvasRef = useRef<HTMLCanvasElement>(null);
  const mergedGridCanvasRef = useRef<HTMLCanvasElement>(null);

  const saveHistory = useCallback(() => {
    const canvas = mergedCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [dataUrl, ...prev].slice(0, 50));
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const [prevDataUrl, ...rest] = history;
    const img = new Image();
    img.src = prevDataUrl;
    img.onload = () => {
      const canvas = mergedCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistory(rest);
      }
    };
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  const processFiles = useCallback((files: File[]) => {
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          setImages((prev) => {
            const newImages = [...prev, { name: file.name, img }];
            setSelectedImageIndex(newImages.length - 1);
            setSelection(null);
            return newImages;
          });
        };
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Removed redundant initial selection useEffect

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const drawSourceGrid = useCallback(() => {
    const canvas = sourceGridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (selection) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selection.x * tileSize,
        selection.y * tileSize,
        selection.w * tileSize,
        selection.h * tileSize
      );
      ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
      ctx.fillRect(
        selection.x * tileSize,
        selection.y * tileSize,
        selection.w * tileSize,
        selection.h * tileSize
      );
    }
  }, [selection, tileSize]);

  useEffect(() => {
    const canvas = sourceCanvasRef.current;
    if (!canvas || selectedImageIndex === -1 || !images[selectedImageIndex]) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[selectedImageIndex].img;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    if (sourceGridCanvasRef.current) {
      sourceGridCanvasRef.current.width = canvas.width;
      sourceGridCanvasRef.current.height = canvas.height;
      drawSourceGrid();
    }
  }, [selectedImageIndex, images, tileSize, drawSourceGrid]);

  const handleSourceMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = sourceGridCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    setSelectStart({ x, y });
    setIsSelecting(true);
    setSelection({ x, y, w: 1, h: 1 });
  };

  const handleSourceMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !selectStart) return;
    const rect = sourceGridCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);

    const x1 = Math.min(selectStart.x, x);
    const y1 = Math.min(selectStart.y, y);
    const x2 = Math.max(selectStart.x, x);
    const y2 = Math.max(selectStart.y, y);

    setSelection({
      x: x1,
      y: y1,
      w: x2 - x1 + 1,
      h: y2 - y1 + 1,
    });
  };

  const handleSourceMouseUp = () => {
    setIsSelecting(false);
    setSelectStart(null);
  };

  const drawMergedGrid = useCallback(() => {
    const canvas = mergedGridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [tileSize]);

  useEffect(() => {
    const canvas = mergedCanvasRef.current;
    const gridCanvas = mergedGridCanvasRef.current;
    if (!canvas || !gridCanvas) return;

    const pixelW = mergedSize.w * tileSize;
    const pixelH = mergedSize.h * tileSize;

    canvas.width = pixelW;
    canvas.height = pixelH;
    gridCanvas.width = pixelW;
    gridCanvas.height = pixelH;

    drawMergedGrid();
  }, [mergedSize, tileSize, drawMergedGrid]);

  const handleMergedMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    saveHistory();
    const isRightClick = e.button === 2;

    const rect = mergedGridCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const targetX = Math.floor((e.clientX - rect.left) / tileSize);
    const targetY = Math.floor((e.clientY - rect.top) / tileSize);

    const ctx = mergedCanvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (isRightClick) {
      const w = selection?.w || 1;
      const h = selection?.h || 1;
      ctx.clearRect(targetX * tileSize, targetY * tileSize, w * tileSize, h * tileSize);
      return;
    }

    if (!selection || selectedImageIndex === -1) return;

    const sourceImg = images[selectedImageIndex].img;

    for (let i = 0; i < selection.w; i++) {
      for (let j = 0; j < selection.h; j++) {
        ctx.drawImage(
          sourceImg,
          (selection.x + i) * tileSize,
          (selection.y + j) * tileSize,
          tileSize,
          tileSize,
          (targetX + i) * tileSize,
          (targetY + j) * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  };

  const downloadMerged = () => {
    const canvas = mergedCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "merged_tileset.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className={`rpgMakerPage ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && <div className="drop-overlay">Drop images here to load</div>}
      <div className="download-section">
        <button className="downloadBtn" onClick={downloadMerged}>
          Download Merged Tileset
        </button>
      </div>

      <div className="editor-container">
        <div className="source-section">
          <div className="upload-controls">
            <b>Source Images</b>
            <input type="file" multiple accept="image/*" onChange={handleFileUpload} />
            <label>Tile Size:</label>
            <input
              type="number"
              value={tileSize}
              onChange={(e) => setTileSize(Number(e.target.value))}
              style={{ width: "50px" }}
            />
          </div>

          <div className="image-tabs">
            {images.map((img, index) => (
              <div
                key={index}
                className={`tab ${selectedImageIndex === index ? "active" : ""}`}
                onClick={() => {
                  setSelectedImageIndex(index);
                  setSelection(null);
                }}
              >
                <span className="tab-number">{index + 1}.</span> {img.name}
              </div>
            ))}
          </div>

          <div className="canvas-container">
            <canvas ref={sourceCanvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
            <canvas
              ref={sourceGridCanvasRef}
              style={{ position: "absolute", top: 0, left: 0 }}
              onMouseDown={handleSourceMouseDown}
              onMouseMove={handleSourceMouseMove}
              onMouseUp={handleSourceMouseUp}
              onMouseLeave={handleSourceMouseUp}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div className="merged-section">
          <div className="merged-controls">
            <b>Merged Image</b>
            <select 
                onChange={(e) => {
                    const preset = (PRESETS as any)[e.target.value];
                    if (preset) {
                        setMergedSize({ w: preset.w, h: preset.h });
                    }
                }}
                defaultValue="B_C_D_E"
            >
                {Object.entries(PRESETS).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                ))}
            </select>
            <label>W (Tiles):</label>
            <input 
                type="number" 
                value={mergedSize.w} 
                onChange={(e) => setMergedSize(prev => ({ ...prev, w: Number(e.target.value) }))}
                style={{ width: "50px" }}
            />
            <label>H (Tiles):</label>
            <input 
                type="number" 
                value={mergedSize.h} 
                onChange={(e) => setMergedSize(prev => ({ ...prev, h: Number(e.target.value) }))}
                style={{ width: "50px" }}
            />
            <button onClick={() => {
                saveHistory();
                const ctx = mergedCanvasRef.current?.getContext("2d");
                ctx?.clearRect(0, 0, mergedSize.w * tileSize, mergedSize.h * tileSize);
            }}>Clear All</button>
            <button onClick={undo} disabled={history.length === 0}>Undo (Ctrl+Z)</button>
          </div>

          <div className="canvas-container">
            <canvas ref={mergedCanvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
            <canvas
              ref={mergedGridCanvasRef}
              style={{ position: "absolute", top: 0, left: 0 }}
              onMouseDown={handleMergedMouseDown}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RpgMakerPage;
