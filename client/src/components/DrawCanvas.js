import { useEffect, useState } from "react";
import { useDraw } from "../hooks/useDraw";
import { ChromePicker } from "react-color";
import { drawLine } from "../utils/drawLine";
import { useSocket } from "../contexts/SocketContext";

export default function DrawCanvas({}) {
  // use custom hook
  const { gameCanvasRef, onMouseDown, onTouchStart, handleClearCanvas } =
    useDraw(createLine);

  const [color, setColor] = useState("#000");
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [windowWidth, setWindowWidth] = useState(null);
  const [myDimensions, setMyDimensions] = useState({});

  const { socket, roomKey } = useSocket();

  useEffect(() => {
    // use window width to determine canvas dimension
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    const canvasWidth = windowWidth >= 768 ? 720 : windowWidth <= 400 ? 360 : 400;
    const canvasHeight = windowWidth >= 768 ? 540 : windowWidth <= 400 ? 240 : 300;
    setMyDimensions({ x: canvasWidth, y: canvasHeight });
  }, [windowWidth]);

  const handleOptionChange = () => {
    setShowColorOptions(!showColorOptions);
  };

  useEffect(() => {
    const ctx = gameCanvasRef.current.getContext("2d");

    socket.on("draw-line", ({ prevPoint, currentPoint, color, dimensions }) => {
      if (!ctx || !prevPoint) return;

      if (myDimensions.x !== dimensions.x) {
        prevPoint.x = (prevPoint.x / dimensions.x) * myDimensions.x;
        prevPoint.y = (prevPoint.y / dimensions.y) * myDimensions.y;
        currentPoint.x = (currentPoint.x / dimensions.x) * myDimensions.x;
        currentPoint.y = (currentPoint.y / dimensions.y) * myDimensions.y;
      }

      drawLine({ prevPoint, currentPoint, ctx, color });
    });

    socket.on("clear", handleClearCanvas);

    return () => {
      socket.off("draw-line");
      socket.off("clear");
    };
  }, [roomKey, myDimensions]);

  // function to draw line and emit event
  function createLine({ prevPoint, currentPoint, ctx }) {
    socket.emit("draw-line", {
      prevPoint,
      currentPoint,
      color,
      roomKey,
      myDimensions,
    });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  return (
    <>
      {showColorOptions && (
        <span className="chrome-picker">
          <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        </span>
      )}
      <canvas
        id="game-canvas"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        width={myDimensions.x}
        height={myDimensions.y}
        ref={gameCanvasRef}
      />
      <button
        id="clear-canvas"
        onClick={() => socket.emit("clear", { roomKey })}
      >
        Clear Canvas
      </button>
      <button id="color-options" onClick={handleOptionChange}>
        Color Options
      </button>
    </>
  );
}
