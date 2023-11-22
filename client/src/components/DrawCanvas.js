import { useState } from "react";
import { useDraw } from "../hooks/useDraw";
import { ChromePicker } from "react-color";

export default function DrawCanvas({ username, roomKey }) {
  // use custom hook
  const { gameCanvasRef, onMouseDown, onTouchStart, handleClearCanvas } =
    useDraw(drawLine);

  const [color, setColor] = useState("#000");
  const [showColorOptions, setShowColorOptions] = useState(false);

  const handleOptionChange = () => {
    setShowColorOptions(!showColorOptions);
  };

  // draw function to pass to hook
  function drawLine({ prevPoint, currentPoint, ctx }) {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = color;
    const lineWidth = 4;

    let startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  // use window width to determine canvas dimension
  const windowWidth = window.innerWidth;
  const canvasWidth = windowWidth >= 768 ? 720 : windowWidth <= 400 ? 360 : 400;
  const canvasHeight = windowWidth >= 768 ? 540 : windowWidth <= 400 ? 240 : 300;

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
