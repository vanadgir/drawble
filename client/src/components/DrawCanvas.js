import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function DrawCanvas({ username, roomKey }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const gameCanvasRef = useRef(null);

  const windowWidth = window.innerWidth;

  useEffect(() => {
    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const handleStartDrawing = (x, y) => {
      setIsDrawing(true);
      setLastX(x);
      setLastY(y);
    };

    const handleDrawing = (x, y) => {
      if (!isDrawing) return;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      setLastX(x);
      setLastY(y);
    };

    const handleEndDrawing = () => {
      setIsDrawing(false);
    };

    // mouse and touch start events
    const handleMouseDown = (e) => {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      handleStartDrawing(mouseX, mouseY);
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const touchX = touch.clientX - canvas.getBoundingClientRect().left;
      const touchY = touch.clientY - canvas.getBoundingClientRect().top;
      handleStartDrawing(touchX, touchY);
    };

    // mouse and touch move events
    const handleMouseMove = (e) => {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      handleDrawing(mouseX, mouseY);
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const touchX = touch.clientX - canvas.getBoundingClientRect().left;
      const touchY = touch.clientY - canvas.getBoundingClientRect().top;
      handleDrawing(touchX, touchY);
    };

    // mouse and touch end events
    const handleMouseUp = () => {
      handleEndDrawing();
    };

    const handleTouchEnd = () => {
      handleEndDrawing();
    };

    // add all listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);


    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDrawing, lastX, lastY]);

  const handleClearCanvas = () => {
    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <canvas
        id="game-canvas"
        width={windowWidth >= 768 ? 720 : 400}
        height={windowWidth >= 768 ? 540 : 300}
        ref={gameCanvasRef}
      />
      <button id="clear-canvas" onClick={handleClearCanvas}>
        Clear Canvas
      </button>
    </>
  );
}
