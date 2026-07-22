"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Ticket } from "@/lib/types";
import {
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  PenLine,
  CheckCircle2,
  MapPin,
  Phone,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Camera,
  Navigation,
  AlertTriangle,
  Timer,
} from "lucide-react";

interface TechJobDetailProps {
  jobId: string;
  onBack: () => void;
  onStartWork: (jobId: string) => void;
  onRequestSignature: (jobId: string) => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function formatNoteDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: "Programado", color: "#ffffff", bg: "#6b7280" },
  en_camino: { label: "En Camino", color: "#ffffff", bg: "#2563eb" },
  iniciado: { label: "Iniciado", color: "#ffffff", bg: "#16a34a" },
  pausado: { label: "Pausado", color: "#ffffff", bg: "#f59e0b" },
  completado: { label: "Completado", color: "#ffffff", bg: "#059669" },
  cancelado: { label: "Cancelado", color: "#ffffff", bg: "#dc2626" },
};

export default function TechJobDetail({
  jobId,
  onBack,
  onStartWork,
  onRequestSignature,
}: TechJobDetailProps) {
  const ticket = useAppStore((s) => s.tickets.find((t) => t.id === jobId));
  const updateTicket = useAppStore((s) => s.updateTicket);
  const user = useAppStore((s) => s.user);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (ticket?.status !== "iniciado" || !ticket.startedAt) return;
    const calc = () =>
      Math.floor((Date.now() - new Date(ticket.startedAt!).getTime()) / 1000);
    setElapsed(calc());
    const iv = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(iv);
  }, [ticket?.status, ticket?.startedAt]);

  if (!ticket) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Ticket no encontrado</p>
      </div>
    );
  }

  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.scheduled;

  const handlePause = () => {
    updateTicket(ticket.id, { status: "pausado", pausedAt: new Date().toISOString() });
  };

  const handleResume = () => {
    updateTicket(ticket.id, { status: "iniciado", pausedAt: undefined });
  };

  const handleStartTravel = () => {
    updateTicket(ticket.id, { status: "en_camino" });
  };

  const completedDuration =
    ticket.status === "completado" && ticket.startedAt && ticket.completedAt
      ? Math.floor(
          (new Date(ticket.completedAt).getTime() - new Date(ticket.startedAt).getTime()) / 60000
        )
      : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      {/* BLUE GRADIENT HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
          padding: "20px 16px",
          color: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: 8,
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </button>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                opacity: 0.85,
                margin: 0,
                letterSpacing: 0.5,
              }}
            >
              Ticket #{ticket.id.slice(-8).toUpperCase()}
            </p>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: "4px 0 0 0",
                lineHeight: 1.2,
              }}
            >
              {ticket.clientName}
            </h1>
          </div>
          <span
            style={{
              background: status.bg,
              color: status.color,
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Live timer for iniciado */}
        {ticket.status === "iniciado" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(0,0,0,0.2)",
              borderRadius: 10,
              padding: "10px 16px",
            }}
          >
            <Timer size={18} color="#86efac" />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 28,
                fontWeight: 700,
                color: "#86efac",
                letterSpacing: 2,
              }}
            >
              {formatElapsed(elapsed)}
            </span>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      {ticket.status !== "completado" && ticket.status !== "cancelado" && (
        <div style={{ padding: "16px" }}>
          {ticket.status === "scheduled" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => onStartWork(ticket.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                }}
              >
                <PlayCircle size={20} />
                Iniciar Trabajo
              </button>
              <button
                onClick={handleStartTravel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                }}
              >
                <Navigation size={20} />
                En Camino
              </button>
            </div>
          )}

          {ticket.status === "en_camino" && (
            <button
              onClick={() => onStartWork(ticket.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 600,
                width: "100%",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
              }}
            >
              <PlayCircle size={20} />
              Iniciar Trabajo
            </button>
          )}

          {ticket.status === "iniciado" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={handlePause}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#f59e0b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
                }}
              >
                <PauseCircle size={20} />
                Pausar
              </button>
              <button
                onClick={() => onRequestSignature(ticket.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#7c3aed",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
                }}
              >
                <PenLine size={20} />
                Solicitar Firma
              </button>
            </div>
          )}

          {ticket.status === "pausado" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={handleResume}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                }}
              >
                <PlayCircle size={20} />
                Reanudar
              </button>
              <button
                onClick={() => onRequestSignature(ticket.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#7c3aed",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
                }}
              >
                <PenLine size={20} />
                Solicitar Firma
              </button>
            </div>
          )}
        </div>
      )}

      {/* COMPLETED STATE */}
      {ticket.status === "completado" && (
        <div style={{ padding: "16px" }}>
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 12,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <CheckCircle2 size={28} color="#16a34a" />
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#166534" }}>
                Trabajo Completado
              </p>
              {ticket.completedAt && (
                <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#15803d" }}>
                  Finalizado el {formatDate(ticket.completedAt)} a las{" "}
                  {formatTime(ticket.completedAt)}
                </p>
              )}
              {completedDuration !== null && (
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#15803d" }}>
                  Duración real: {formatDuration(completedDuration)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLIENT INFO CARD */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          margin: "0 16px 12px",
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#6b7280",
            margin: "0 0 12px 0",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Información del Cliente
        </h3>

        <p style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, color: "#111827" }}>
          {ticket.clientName}
        </p>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <MapPin size={16} color="#6b7280" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.4 }}>
            {ticket.location}
          </p>
        </div>

        <div
          style={{
            display: "inline-block",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {ticket.serviceType}
        </div>

        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            paddingTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={14} color="#9ca3af" />
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {formatDate(ticket.scheduledDate)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={14} color="#9ca3af" />
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {ticket.scheduledTime}
            </span>
          </div>
          {ticket.estimatedDuration && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Timer size={14} color="#9ca3af" />
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Estimado: {formatDuration(ticket.estimatedDuration)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* DESCRIPTION CARD */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          margin: "0 16px 12px",
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <FileText size={18} color="#6b7280" />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Descripción
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
          {ticket.description || "Sin descripción"}
        </p>
      </div>

      {/* PRIORITY INDICATOR */}
      {ticket.priority && (
        <div
          style={{
            margin: "0 16px 12px",
            padding: "10px 16px",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: ticket.priority === "alta" || ticket.priority === "urgente" ? "#fef2f2" : "#fffbeb",
            border: `1px solid ${ticket.priority === "alta" || ticket.priority === "urgente" ? "#fecaca" : "#fde68a"}`,
          }}
        >
          <AlertTriangle
            size={18}
            color={ticket.priority === "alta" || ticket.priority === "urgente" ? "#dc2626" : "#d97706"}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: ticket.priority === "alta" || ticket.priority === "urgente" ? "#dc2626" : "#d97706",
              textTransform: "uppercase",
            }}
          >
            Prioridad: {ticket.priority}
          </span>
        </div>
      )}

      {/* NOTES SECTION */}
      {ticket.notes && ticket.notes.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            margin: "0 16px 12px",
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <MessageSquare size={18} color="#6b7280" />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Notas
            </h3>
            <span
              style={{
                background: "#f3f4f6",
                color: "#6b7280",
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 10,
              }}
            >
              {ticket.notes.length}
            </span>
          </div>

          {ticket.notes.map((note, idx) => (
            <div
              key={note.id || idx}
              style={{
                borderLeft: note.isInternal ? "3px solid #f59e0b" : "3px solid #e5e7eb",
                paddingLeft: 12,
                marginBottom: idx < ticket.notes!.length - 1 ? 12 : 0,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                  {note.author || "Técnico"}
                </span>
                {note.authorRole && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: note.authorRole === "admin" ? "#ede9fe" : "#dbeafe",
                      color: note.authorRole === "admin" ? "#7c3aed" : "#2563eb",
                      textTransform: "uppercase",
                    }}
                  >
                    {note.authorRole}
                  </span>
                )}
                {note.isInternal && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "#fef3c7",
                      color: "#92400e",
                    }}
                  >
                    Interna
                  </span>
                )}
              </div>
              <p style={{ margin: "0 0 4px 0", fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                {note.content}
              </p>
              {note.createdAt && (
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                  {formatNoteDate(note.createdAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PHOTOS SECTION */}
      {ticket.photos && ticket.photos.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            margin: "0 16px 12px",
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Camera size={18} color="#6b7280" />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Fotos
            </h3>
            <span
              style={{
                background: "#f3f4f6",
                color: "#6b7280",
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 10,
              }}
            >
              {ticket.photos.length}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {ticket.photos.map((photo, idx) => (
              <div
                key={idx}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {typeof photo === "string" ? (
                  <img
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Camera size={24} color="#d1d5db" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIGNATURE */}
      {ticket.signature && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            margin: "0 16px 12px",
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: 14,
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Firma del Cliente
          </h3>
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={ticket.signature}
              alt="Firma"
              style={{ maxHeight: 80, objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {/* BOTTOM SPACER */}
      <div style={{ height: 32 }} />
    </div>
  );
}