import React, { useEffect, useRef, useState } from "react";
import "scss/mainPage.scss";

const MainPage = () => {
  const [file, setFile] = useState<{
    name: string;
    imageUrl: string;
    img: HTMLImageElement;
  }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [tileSize, setTileSize] = useState({ width: 16, height: 16 });
  const [fileFix, setFileFix] = useState({ preFix: "spr_", sufFix: "" });
  const [isMoveRight, setIsMoveRight] = useState(true);

  useEffect(() => {
    const width = Number(localStorage.getItem("width")) || 16;
    const height = Number(localStorage.getItem("height")) || 16;
    setTileSize({ width, height });

    const preFix = localStorage.getItem("preFix") || "spr_";
    const sufFix = localStorage.getItem("sufFix") || "";
    setFileFix({ preFix, sufFix });
  }, []);

  useEffect(() => {
    if (!file?.img || !canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current?.getContext("2d");

    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (!isMoveRight) {
      ctx?.drawImage(
        file?.img,
        0,
        0,
        file?.img.width,
        file?.img.height,
        0,
        tileSize.height,
        file?.img.width,
        file?.img.height
      );
      return;
    }

    ctx?.drawImage(
      file?.img,
      0,
      tileSize.height,
      file?.img.width,
      file?.img.height,
      0,
      tileSize.height,
      file?.img.width,
      file?.img.height
    );

    ctx?.drawImage(
      file?.img,
      0,
      0,
      file?.img.width,
      tileSize.height,
      tileSize.width,
      0,
      file?.img.width,
      tileSize.height
    );
  }, [tileSize.width, tileSize.height, file, isMoveRight]);

  return (
    <div className="mainPage">
      Move Direction :
      <label>
        <input
          type="radio"
          name={"type"}
          defaultChecked={true}
          onClick={() => {
            setIsMoveRight(true);
          }}
        />
        Right
      </label>
      <label>
        <input
          type="radio"
          name={"type"}
          onClick={() => {
            setIsMoveRight(false);
          }}
        />
        Down
      </label>
      <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          e.preventDefault();

          if (!e.target.files) {
            return;
          }

          const reader = new FileReader();
          const file = e.target.files[0];
          reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;

            setFile({
              name: file.name,
              imageUrl: reader.result as string,
              img: img,
            });
          };
          reader.readAsDataURL(file);
        }}
      />
      <br />
      {isMoveRight && (
        <>
          <label> Tile Width : </label>
          <input
            type="number"
            value={tileSize.width.toString()}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > 100 || val < 0) {
                window.alert("Enter a value between 0 and 100.");
                return;
              }

              localStorage.setItem("width", e.target.value);

              setTileSize((prev) => ({
                ...prev,
                width: val,
              }));
            }}
            max={100}
            min={0}
          />
          <span>{" / "}</span>
        </>
      )}
      <label> Tile Height : </label>
      <input
        type="number"
        value={tileSize.height.toString()}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val > 100 || val < 0) {
            window.alert("Enter a value between 0 and 100.");
            return;
          }

          localStorage.setItem("height", e.target.value);
          setTileSize((prev) => ({
            ...prev,
            height: val,
          }));
        }}
        max={100}
        min={0}
      />
      <br />
      <label> File Prefix : </label>
      <input
        value={fileFix.preFix}
        onChange={(e) => {
          localStorage.setItem("preFix", e.target.value);
          setFileFix((prev) => ({ ...prev, preFix: e.target.value }));
        }}
      />
      <span>{" / "}</span>
      <label> File Suffix : </label>
      <input
        value={fileFix.sufFix}
        onChange={(e) => {
          localStorage.setItem("sufFix", e.target.value);
          setFileFix((prev) => ({ ...prev, sufFix: e.target.value }));
        }}
      />
      <br />
      {file?.imageUrl && (
        <>
          <div className="imageDiffDiv">
            <div>
              <div>
                <b>Original</b>
              </div>
              <img
                id="dataimage"
                className="originImage image"
                alt="ImageName"
                src={file?.imageUrl}
                ref={imageRef}
                style={{
                  width: file?.img.width,
                  height: file?.img.height,
                }}
              />
            </div>
            <div
              style={{
                paddingRight: "2vw",
              }}
            />
            <div>
              <div>
                <b>Modified</b>
              </div>
              <canvas
                ref={canvasRef}
                id="image"
                className="image"
                width={file.img.width + (isMoveRight ? tileSize.width : 0)}
                height={file.img.height + (!isMoveRight ? tileSize.height : 0)}
              />
            </div>
          </div>
          <br />
          <button
            className="downloadBtn"
            onClick={() => {
              if (!canvasRef.current) {
                return;
              }
              // 캔버스 다운로드
              const $link = document.createElement("a");

              const [fileName] = file.name.split(".");

              $link.download = `${fileFix.preFix}${fileName}${fileFix.sufFix}`;
              $link.href = canvasRef.current.toDataURL("image/png");

              $link.click();
            }}
          >
            Download
          </button>
        </>
      )}
    </div>
  );
};

export default MainPage;
