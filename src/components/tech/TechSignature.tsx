"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, PenLine, Eraser, Check } from "lucide-react";

interface TechSignatureProps {
  jobId: string;
  onBack: () => void;
  onCompleted: () => void;
}

export default function TechSignature({
  jobId,
  onBack,
  onCompleted,
}: TechSignatureProps) {
  const ticket = useAppStore((s) => s.tickets.find((t) => t.id === jobId));
  const updateTicket = useAppStore((s) => s.updateTicket);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      ctx.lineWidth = 3;
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

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn || !ticket) return;
    const signature = canvas.toDataURL("image/png");
    const startedAt = ticket.startedAt
      ? new Date(ticket.startedAt).getTime()
      : Date.now();
    const actualDuration = Math.round(
      (Date.now() - startedAt) / 60000
    );
    updateTicket(jobId, {
      signature,
      status: "completado",
      completedAt: new Date().toISOString(),
      actualDuration,
    });
    setShowSuccess(true);
    setTimeout(() => {
      onCompleted();
    }, 1800);
  };

  if (!ticket) return null;

  if (showSuccess) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "24px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "40px 32px",
            textAlign: "center",
            maxWidth: "320px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Check size={32} style={{ color: "#16a34a" }} />
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 8px",
            }}
          >
            ¡Trabajo Completado!
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              margin: 0,
            }}
          >
            La firma del cliente ha sido registrada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
          padding: "20px 16px 16px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "12px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Firma del Cliente
          </h1>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          margin: "16px",
          padding: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            fontFamily: "monospace",
            marginBottom: "4px",
          }}
        >
          {ticket.id}
        </div>
        <div style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
          {ticket.clientName}
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
          {ticket.serviceType}
        </div>
      </div>

      <div style={{ margin: "0 16px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <PenLine size={16} style={{ color: "#1d4ed8" }} />
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            Firma del Cliente
          </span>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "#94a3b8",
            margin: "0 0 12px",
          }}
        >
          El cliente debe firmar en el recuadro de abajo
        </p>

        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <canvas
            ref={canvasRef}
            className="tech-signature-canvas"
            style={{
              width: "100%",
              height: "200px",
              background: "#ffffff",
              cursor: "crosshair",
              touchAction: "none",
              display: "block",
            }}
          />
        </div>

        {!hasDrawn && (
          <p
            style={{
              fontSize: "12px",
              color: "#cbd5e1",
              textAlign: "center",
              marginTop: "-8px",
              marginBottom: "16px",
            }}
          >
            Dibuja la firma arriba
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={clearCanvas}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#64748b",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Eraser size={16} />
            Limpiar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasDrawn}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: hasDrawn ? "#16a34a" : "#94a3b8",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: hasDrawn ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "background 0.2s",
            }}
          >
            <Check size={16} />
            Confirmar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
