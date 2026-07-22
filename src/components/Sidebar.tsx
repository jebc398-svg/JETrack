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
  ClipboardList,
  HardHat,
  Download,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

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
        width: isMobile ? "280px" : isOpen ? "260px" : "0px",
        minWidth: isMobile ? "280px" : isOpen ? "260px" : "0px",
        height: "100vh",
        background: "white",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        zIndex: isMobile ? 1000 : 1,
        top: 0,
        left: 0,
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: "20px 16px",
          background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minHeight: "72px",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            height: "32px",
            width: "auto",
            objectFit: "contain",
          }}
        />
        {isMobile && (
          <button
            onClick={onMobileClose}
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
          padding: "12px 8px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {navItems.map((item) => {
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
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(29, 78, 216, 0.3)",
              transition: "all 0.2s ease",
            }}
          >
            <Download size={16} />
            <span>Descargar App JETrack</span>
          </a>
        </div>
      )}

      {/* User Info */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              fontWeight: 500,
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
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 999,
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
