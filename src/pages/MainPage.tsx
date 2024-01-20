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
  const [isMoveRight, setIsMoveRight] = useState(true);

  useEffect(() => {
    const width = Number(localStorage.getItem("width")) || 16;
    const height = Number(localStorage.getItem("height")) || 16;

    setTileSize({ width, height });
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
      {isMoveRight && (
        <>
          <br />
          <label> Tile Width : </label>
          <input
            type="number"
            value={tileSize.width.toString()}
            onChange={(e) => {
              localStorage.setItem("width", e.target.value);

              setTileSize((prev) => ({
                ...prev,
                width: Number(e.target.value),
              }));
            }}
          />
        </>
      )}
      <br />
      <label> Tile Height : </label>
      <input
        type="number"
        value={tileSize.height.toString()}
        onChange={(e) => {
          localStorage.setItem("height", e.target.value);
          setTileSize((prev) => ({
            ...prev,
            height: Number(e.target.value),
          }));
        }}
      />
      <br />
      {file?.imageUrl && (
        <>
          <img
            id="dataimage"
            alt="ImageName"
            src={file?.imageUrl}
            ref={imageRef}
            style={{ paddingRight: "2vw" }}
          />
          <canvas
            ref={canvasRef}
            id="image"
            width={file.img.width + (isMoveRight ? tileSize.width : 0)}
            height={file.img.height + (!isMoveRight ? tileSize.height : 0)}
          />
          <br />
          <button
            onClick={() => {
              if (!canvasRef.current) {
                return;
              }
              // 캔버스 다운로드
              const $link = document.createElement("a");

              $link.download = file.name;
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
