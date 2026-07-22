"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { PenLine, Eraser, Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setIsDrawing(true);
    },
    [getPos]
  );

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setHasDrawn(true);
    },
    [isDrawing, getPos]
  );

  const stopDraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <motion.div
      className="card-static overflow-hidden"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <PenLine className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-text-primary">
            Firma del Cliente
          </span>
        </div>

        <div className="rounded-xl border border-border overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            className="w-full bg-white cursor-crosshair"
            style={{ height: "200px", touchAction: "none" }}
          />
        </div>

        {!hasDrawn && (
          <p className="text-xs text-text-tertiary text-center mb-4">
            Dibuja tu firma en el área superior
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <button className="btn-ghost" onClick={onCancel}>
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={clearCanvas}>
              <Eraser className="w-4 h-4" />
              Limpiar
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!hasDrawn}
              style={{ opacity: hasDrawn ? 1 : 0.5 }}
            >
              <Check className="w-4 h-4" />
              Confirmar Firma
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
