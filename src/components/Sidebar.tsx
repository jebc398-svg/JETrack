"use client";

import {
  LayoutDashboard,
  Ticket,
  Calendar,
  FileText,
  Users,
  Wrench,
  BarChart3,
  Settings,
  Menu,
  X,
  Download,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import logo2 from "../logo2.png";

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onMobileClose: () => void;
}

const allNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "supervisor"] },
  { id: "tickets", label: "Tickets", icon: Ticket, roles: ["admin", "supervisor", "technician"] },
  { id: "calendario", label: "Calendario", icon: Calendar, roles: ["admin", "supervisor"] },
  { id: "cotizaciones", label: "Cotizaciones", icon: FileText, roles: ["admin", "supervisor"] },
  { id: "clientes", label: "Clientes", icon: Users, roles: ["admin", "supervisor"] },
  { id: "tecnicos", label: "Técnicos", icon: Wrench, roles: ["admin", "supervisor"] },
  { id: "reportes", label: "Reportes", icon: BarChart3, roles: ["admin", "supervisor"] },
  { id: "configuracion", label: "Configuración", icon: Settings, roles: ["admin"] },
];

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  technician: "Técnico",
  client: "Cliente",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({
  activePage,
  onPageChange,
  isOpen,
  onToggle,
  isMobile,
  onMobileClose,
}: SidebarProps) {
  const user = useAppStore((s) => s.user);
  const initials = getInitials(user.name || "U");
  const roleLabel = roleLabels[user.role] || user.role;

  const navItems = allNavItems.filter((item) => item.roles.includes(user.role));

  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    if (isMobile) onMobileClose();
  };

  const sidebarContent = (
    <div
      style={{
        width: isMobile ? "288px" : isOpen ? "272px" : "0px",
        minWidth: isMobile ? "288px" : isOpen ? "272px" : "0px",
        height: "100vh",
        background: "white",
        borderRight: "1px solid rgba(226, 232, 240, 0.6)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        zIndex: isMobile ? 1000 : 1,
        top: 0,
        left: 0,
        boxShadow: isMobile ? "4px 0 24px rgba(0, 0, 0, 0.08)" : "none",
      }}
    >
      {/* Logo Area — Premium */}
      <div
        style={{
          height: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "visible",
          flexShrink: 0,
        }}
      >
        {/* Subtle texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 40%, rgba(96, 165, 250, 0.15) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <img
          src={logo2.src}
          alt="JETrack"
          style={{
            height: "150px",
            width: "auto",
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            filter: "brightness(0) invert(1)",
          }}
        />

        {isMobile && (
          <button
            onClick={onMobileClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "10px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
              zIndex: 2,
            }}
          >
            <X size={18} color="white" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "16px 12px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`sidebar-link${isActive ? " active" : ""}`}
              style={{
                width: "100%",
                border: "none",
                textAlign: "left",
                animation: `slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.04}s both`,
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Download App — Technician only */}
      {user.role === "technician" && (
        <div style={{ padding: "12px 12px 0" }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("La app JETrack estará disponible próximamente en las tiendas de aplicaciones.");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(29, 78, 216, 0.25)",
              transition: "all 0.3s ease",
            }}
          >
            <Download size={16} />
            <span>Descargar App JETrack</span>
          </a>
        </div>
      )}

      {/* User Info — Premium */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(226, 232, 240, 0.6)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(248, 250, 252, 0.5)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(29, 78, 216, 0.2)",
          }}
        >
          {initials}
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.3,
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              fontWeight: 500,
              marginTop: "1px",
            }}
          >
            {roleLabel}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={onToggle}
          style={{
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 900,
            background: "white",
            border: "1px solid rgba(226, 232, 240, 0.6)",
            borderRadius: "14px",
            padding: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
          }}
        >
          <Menu size={20} color="#475569" />
        </button>

        {isOpen && (
          <div
            onClick={onMobileClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 999,
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>{sidebarContent}</div>
          </div>
        )}
      </>
    );
  }

  return sidebarContent;
}
