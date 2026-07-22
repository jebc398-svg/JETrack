"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  Mail,
  Phone,
  Star,
  MapPin,
  Wrench,
  Briefcase,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function TechProfile() {
  const user = useAppStore((s) => s.user);
  const tickets = useAppStore((s) => s.tickets);
  const technicians = useAppStore((s) => s.technicians);
  const logout = useAppStore((s) => s.logout);

  const tech = useMemo(
    () => technicians.find((t) => t.id === user.id),
    [technicians, user.id]
  );

  const completedJobs = useMemo(
    () =>
      tickets.filter(
        (t) => t.technicianId === user.id && t.status === "completado"
      ).length,
    [tickets, user.id]
  );

  const initials = useMemo(() => {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user.name]);

  const displayName = tech?.name || user.name || "Técnico";
  const displayEmail = tech?.email || user.email || "";
  const displayPhone = tech?.phone || user.phone || "";
  const displayRole = tech?.role || user.role || "technician";
  const displayZone = tech?.zone || "Sin asignar";
  const displaySpecialty = tech?.specialty || "General";
  const displayRating = tech?.rating || 4.8;

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    supervisor: "Supervisor",
    technician: "Técnico",
    client: "Cliente",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
          padding: "24px 20px 32px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "-20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Mi Perfil
          </h1>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {roleLabels[displayRole] || displayRole}
          </span>
        </div>
      </div>

      <div style={{ padding: "0 16px", marginTop: "-16px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "white",
              marginBottom: "12px",
              border: "4px solid #ffffff",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
            }}
          >
            {initials}
          </div>

          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 4px",
            }}
          >
            {displayName}
          </h2>

          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: 0,
            }}
          >
            {displayEmail}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              padding: "4px 12px",
              borderRadius: "20px",
              background:
                displayRating >= 4.5 ? "#f0fdf4" : "#fef3c7",
              border: `1px solid ${displayRating >= 4.5 ? "#bbf7d0" : "#fde68a"}`,
            }}
          >
            <Star
              size={14}
              style={{
                color: displayRating >= 4.5 ? "#16a34a" : "#d97706",
                fill: displayRating >= 4.5 ? "#16a34a" : "#d97706",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: displayRating >= 4.5 ? "#16a34a" : "#d97706",
              }}
            >
              {displayRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Briefcase size={16} style={{ color: "#16a34a" }} />
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Trabajos
            </span>
          </div>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            {tech?.completedJobs ?? completedJobs}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              margin: "2px 0 0",
            }}
          >
            completados
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Star
                size={16}
                style={{ color: "#d97706", fill: "#d97706" }}
              />
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Calificación
            </span>
          </div>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            {displayRating.toFixed(1)}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              margin: "2px 0 0",
            }}
          >
            de 5.0
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={16} style={{ color: "#2563eb" }} />
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Zona
            </span>
          </div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {displayZone}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              margin: "2px 0 0",
            }}
          >
            asignada
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#f5f3ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wrench size={16} style={{ color: "#9333ea" }} />
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Especialidad
            </span>
          </div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {displaySpecialty}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              margin: "2px 0 0",
            }}
          >
            principal
          </p>
        </div>
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Info size={16} style={{ color: "#64748b" }} />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Información de Contacto
            </span>
          </div>

          <div style={{ padding: "0 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 0",
                borderBottom: "1px solid #f8fafc",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail size={16} style={{ color: "#2563eb" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    margin: "0 0 2px",
                    fontWeight: 500,
                  }}
                >
                  Email
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#0f172a",
                    margin: 0,
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayEmail || "No registrado"}
                </p>
              </div>
              {displayEmail && (
                <a
                  href={`mailto:${displayEmail}`}
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    fontWeight: 600,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  Abrir
                </a>
              )}
            </div>

            {displayPhone ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 0",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Phone size={16} style={{ color: "#16a34a" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      margin: "0 0 2px",
                      fontWeight: 500,
                    }}
                  >
                    Teléfono
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#0f172a",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {displayPhone}
                  </p>
                </div>
                <a
                  href={`tel:${displayPhone}`}
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    fontWeight: 600,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  Llamar
                </a>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 0",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Phone size={16} style={{ color: "#94a3b8" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      margin: "0 0 2px",
                      fontWeight: 500,
                    }}
                  >
                    Teléfono
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#94a3b8",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    No registrado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Info size={16} style={{ color: "#64748b" }} />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Acerca de
            </span>
          </div>

          <div style={{ padding: "14px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Wrench size={14} style={{ color: "white" }} />
                </div>
                <span
                  style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}
                >
                  JETrack Field Service
                </span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#94a3b8",
                }}
              >
                v1.0
              </span>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "10px 0 0",
                lineHeight: 1.5,
              }}
            >
              Diseñado para técnicos en campo
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 32px" }}>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "2px solid #ef4444",
            background: "transparent",
            color: "#ef4444",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#ef4444";
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.color = "#ffffff";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#ef4444";
          }}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
