import React, { useRef, useState, useEffect } from 'react';

/**
 * Canvas-based digital signature pad.
 * Supports both touch (mobile) and mouse drawing.
 */
export default function SignaturePad({ onSave, onClear }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave?.(dataUrl);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onClear?.();
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-2xl overflow-hidden bg-white border-2 border-gray-200">
        <canvas
          ref={canvasRef}
          width={360}
          height={140}
          className="w-full h-36 touch-none cursor-crosshair bg-slate-50"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-xs">Sign with finger or stylus</p>
          </div>
        )}
        <div className="absolute bottom-2 left-4 right-4 border-b border-dashed border-gray-300 pointer-events-none" />
      </div>
      <div className="flex justify-between items-center px-1">
        <p className="text-xs text-gray-400">Officer Signature</p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-red-500 font-medium hover:underline"
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
}
