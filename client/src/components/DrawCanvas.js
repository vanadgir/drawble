import { useEffect, useState } from "react";
import { useSocket } from "../contexts/useSocket";
import { useDraw } from "../hooks/useDraw";
import { ChromePicker } from "react-color";
import { drawLine } from "../utils/drawLine";


export default function DrawCanvas({ username, roomKey }) {
  // use custom hook
  const { gameCanvasRef, onMouseDown, onTouchStart, handleClearCanvas } =
    useDraw(createLine);

  const [color, setColor] = useState("#000");
  const [showColorOptions, setShowColorOptions] = useState(false);

  const {socket} = useSocket();
  
  // use window width to determine canvas dimension
  const windowWidth = window.innerWidth;
  const canvasWidth = windowWidth >= 768 ? 720 : windowWidth <= 400 ? 360 : 400;
  const canvasHeight = windowWidth >= 768 ? 540 : windowWidth <= 400 ? 240 : 300;

  const handleOptionChange = () => {
    setShowColorOptions(!showColorOptions);
  };

  useEffect(() => {
    const ctx = gameCanvasRef.current.getContext("2d");
    
    socket.on("draw-line", ({ prevPoint, currentPoint, color}) => {
      if (!ctx) return;

      drawLine({prevPoint, currentPoint, ctx, color});
    });
  }, []);

  // function to draw line and emit event
  function createLine({ prevPoint, currentPoint, ctx }) {
    socket.emit("draw-line", { prevPoint, currentPoint, color, roomKey});
    drawLine({prevPoint, currentPoint, ctx, color});
  };

  return (
    <>
      {showColorOptions && <span className="chrome-picker">
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
      </span>}
      <canvas
        id="game-canvas"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        width={canvasWidth}
        height={canvasHeight}
        ref={gameCanvasRef}
      />
      <button id="clear-canvas" onClick={handleClearCanvas}>
        Clear Canvas
      </button>
      <button id="color-options" onClick={handleOptionChange}>
        Color Options
      </button>
    </>
  );
}
