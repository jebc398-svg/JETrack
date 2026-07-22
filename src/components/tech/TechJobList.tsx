"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Ticket } from "@/lib/types";
import {
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  CalendarCheck,
  Wrench,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  History,
  Search,
} from "lucide-react";
import { useState } from "react";

interface TechJobListProps {
  onSelectJob: (jobId: string) => void;
  onStartWork?: (jobId: string) => void;
  historyMode?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  scheduled: {
    label: "Pendiente",
    color: "#d97706",
    bg: "#fef3c7",
    icon: CalendarCheck,
  },
  en_camino: {
    label: "En Camino",
    color: "#2563eb",
    bg: "#eff6ff",
    icon: MapPin,
  },
  iniciado: {
    label: "En Progreso",
    color: "#059669",
    bg: "#ecfdf5",
    icon: PlayCircle,
  },
  pausado: {
    label: "Pausado",
    color: "#9333ea",
    bg: "#f5f3ff",
    icon: PauseCircle,
  },
  completado: {
    label: "Completado",
    color: "#16a34a",
    bg: "#f0fdf4",
    icon: CheckCircle2,
  },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  baja: { label: "Baja", color: "#94a3b8", bg: "#f1f5f9" },
  media: { label: "Media", color: "#d97706", bg: "#fef3c7" },
  alta: { label: "Alta", color: "#ea580c", bg: "#fff7ed" },
  urgente: { label: "Urgente", color: "#dc2626", bg: "#fef2f2" },
};

export default function TechJobList({
  onSelectJob,
  historyMode = false,
}: TechJobListProps) {
  const user = useAppStore((s) => s.user);
  const tickets = useAppStore((s) => s.tickets);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const myTickets = useMemo(() => {
    let filtered = tickets.filter((t) => t.technicianId === user.id);

    if (historyMode) {
      filtered = filtered.filter((t) => t.status === "completado");
    } else {
      filtered = filtered.filter((t) => t.status !== "completado");
    }

    if (filterStatus) {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.clientName.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }

    const statusOrder = [
      "urgente",
      "iniciado",
      "pausado",
      "en_camino",
      "scheduled",
      "completado",
    ];
    filtered.sort((a, b) => {
      if (!historyMode) {
        const aIdx = statusOrder.indexOf(a.status);
        const bIdx = statusOrder.indexOf(b.status);
        if (aIdx !== bIdx) return aIdx - bIdx;
        const priorityOrder = ["urgente", "alta", "media", "baja"];
        const aPri = priorityOrder.indexOf(a.priority);
        const bPri = priorityOrder.indexOf(b.priority);
        return aPri - bPri;
      }
      return (
        new Date(b.completedAt || b.updatedAt).getTime() -
        new Date(a.completedAt || a.updatedAt).getTime()
      );
    });

    return filtered;
  }, [tickets, user.id, historyMode, filterStatus, search]);

  const activeFilters = historyMode
    ? [{ id: "completado", label: "Completados" }]
    : [
        { id: "scheduled", label: "Pendientes" },
        { id: "iniciado", label: "En Progreso" },
        { id: "pausado", label: "Pausados" },
        { id: "en_camino", label: "En Camino" },
      ];

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
          padding: "20px 16px 16px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
            {historyMode ? "Historial" : "Mis Trabajos"}
          </h1>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {myTickets.length} {historyMode ? "trabajos" : "pendientes"}
          </span>
        </div>
        <p style={{ fontSize: "13px", opacity: 0.8, margin: "2px 0 0" }}>
          {historyMode
            ? "Trabajos finalizados"
            : "Tus trabajos asignados hoy"}
        </p>
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Buscar trabajos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              background: "#ffffff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <button
          onClick={() => setFilterStatus("")}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: "1px solid",
            borderColor: !filterStatus ? "#2563eb" : "#e2e8f0",
            background: !filterStatus ? "#2563eb" : "#ffffff",
            color: !filterStatus ? "#ffffff" : "#64748b",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}
        >
          Todos
        </button>
        {activeFilters.map((f) => (
          <button
            key={f.id}
            onClick={() =>
              setFilterStatus(filterStatus === f.id ? "" : f.id)
            }
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: filterStatus === f.id ? "#2563eb" : "#e2e8f0",
              background: filterStatus === f.id ? "#2563eb" : "#ffffff",
              color: filterStatus === f.id ? "#ffffff" : "#64748b",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        {myTickets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "#94a3b8",
            }}
          >
            <Wrench
              size={48}
              style={{ margin: "0 auto 16px", opacity: 0.4 }}
            />
            <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px" }}>
              {historyMode
                ? "Sin trabajos completados"
                : "Sin trabajos asignados"}
            </p>
            <p style={{ fontSize: "13px", margin: 0 }}>
              {historyMode
                ? "Los trabajos que completes aparecerán aquí"
                : "No hay trabajos pendientes por ahora"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myTickets.map((ticket) => (
              <JobCard
                key={ticket.id}
                ticket={ticket}
                onTap={() => onSelectJob(ticket.id)}
                historyMode={historyMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({
  ticket,
  onTap,
  historyMode,
}: {
  ticket: Ticket;
  onTap: () => void;
  historyMode: boolean;
}) {
  const status = statusConfig[ticket.status] || statusConfig.scheduled;
  const priority = priorityConfig[ticket.priority] || priorityConfig.media;
  const StatusIcon = status.icon;

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0) return `${h}h ${m}min`;
    return `${m} min`;
  };

  const getDuration = () => {
    if (ticket.actualDuration) return formatDuration(ticket.actualDuration);
    if (ticket.startedAt) {
      const start = new Date(ticket.startedAt).getTime();
      const end = ticket.completedAt
        ? new Date(ticket.completedAt).getTime()
        : Date.now();
      return formatDuration(Math.round((end - start) / 60000));
    }
    return formatDuration(ticket.estimatedDuration);
  };

  return (
    <div
      onClick={onTap}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onTouchStart={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(0.98)";
      }}
      onTouchEnd={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#64748b",
                fontFamily: "monospace",
              }}
            >
              {ticket.id}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                borderRadius: "8px",
                background: status.bg,
              }}
            >
              <StatusIcon size={12} style={{ color: status.color }} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: status.color,
                }}
              >
                {status.label}
              </span>
            </div>
          </div>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ticket.title}
          </h3>
        </div>
        <ChevronRight size={18} style={{ color: "#cbd5e1", flexShrink: 0, marginTop: "4px" }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          fontSize: "13px",
          color: "#64748b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 500, color: "#334155" }}>
            {ticket.clientName}
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              padding: "1px 6px",
              borderRadius: "6px",
              background: priority.bg || "#f1f5f9",
              color: priority.color,
            }}
          >
            {priority.label}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflow: "hidden",
          }}
        >
          <MapPin size={13} style={{ flexShrink: 0, color: "#94a3b8" }} />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ticket.location}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Clock size={13} style={{ color: "#94a3b8" }} />
            <span>
              {historyMode
                ? formatDate(ticket.completedAt || ticket.updatedAt)
                : `${ticket.scheduledDate} ${ticket.scheduledTime}`}
            </span>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#475569",
            }}
          >
            {getDuration()}
          </span>
        </div>
      </div>
    </div>
  );
}
