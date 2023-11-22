import { useState, useEffect, useRef } from "react"

export const useDraw = (onDraw) => {
  const [mouseDown, setMouseDown] = useState(false);
  const [screenTouch, setScreenTouch] = useState(false);
  const gameCanvasRef = useRef(null);
  const prevPoint = useRef(null);

  // mouse/touch start
  const onMouseDown = () => {
    setMouseDown(true);
  };

  const onTouchStart = () => {
    setScreenTouch(true);
  };

  // clear canvas
  const handleClearCanvas = () => {
    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    // mouse handler
    const mouseHandler = (e) => {
      if (!mouseDown) return;
      
      const currentPoint = getPointInCanvas(e);

      const ctx = gameCanvasRef.current.getContext("2d");
      if (!ctx || !currentPoint) return;

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current});
      prevPoint.current = currentPoint;
    };

    const mouseUpHandler = () => {
      setMouseDown(false);
      prevPoint.current = null;
    };

    // touch screen handler
    const touchHandler = (e) => {
      if (!screenTouch) return;

      const currentPoint = getPointInCanvas(e.touches[0]);

      const ctx = gameCanvasRef.current.getContext("2d");
      if (!ctx || !currentPoint) return;

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
      prevPoint.current = currentPoint;
    };

    const stopTouchHandler = () => {
      setScreenTouch(false);
      prevPoint.current = null;
    }

    // get (x, y) of event
    const getPointInCanvas = (e) => {
      const canvas = gameCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return {x ,y}
    }

    // Load event listeners
    const canvasRef = gameCanvasRef.current;

    // add listeners if canvas exists
    if (canvasRef){
      canvasRef.addEventListener('mousemove', mouseHandler);
      canvasRef.addEventListener('touchmove', touchHandler);
      window.addEventListener('mouseup', mouseUpHandler);
      window.addEventListener('touchend', stopTouchHandler);
    }

    // unload listeners if canvas exists
    return () => { 
      if (canvasRef){
        canvasRef.removeEventListener('mousemove', mouseHandler);
        canvasRef.removeEventListener('touchmove', touchHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
        window.removeEventListener('touchend', stopTouchHandler);
      }
    }
  }, [onDraw]);

  // pass to component using hook
  return {gameCanvasRef, onMouseDown, onTouchStart, handleClearCanvas}
}