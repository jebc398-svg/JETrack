"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, ChevronDown, User, LogOut } from "lucide-react";
import { Notification } from "@/lib/types";
import { useAppStore } from "@/lib/store";

interface HeaderProps {
  activePage: string;
  onMenuToggle: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  tickets: "Tickets",
  calendario: "Calendario",
  clientes: "Clientes",
  tecnicos: "Técnicos",
  cotizaciones: "Cotizaciones",
  reportes: "Reportes",
  configuracion: "Configuración",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  technician: "Técnico",
  client: "Cliente",
};

const notificationTypeColors: Record<string, string> = {
  info: "bg-[var(--color-info-light)]",
  success: "bg-[var(--color-success-light)]",
  warning: "bg-[var(--color-warning-light)]",
  error: "bg-[var(--color-danger-light)]",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Header({
  activePage,
  onMenuToggle,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: HeaderProps) {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials = getInitials(user.name || "U");
  const roleLabel = roleLabels[user.role] || user.role;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <header className="glass-strong sticky top-0 z-40 border-b border-white/50 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="btn-ghost p-2 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-bold text-[var(--color-text-primary)] md:text-xl">
            {pageTitles[activePage] || activePage}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`hidden items-center gap-2 rounded-xl border-1.5 border-[var(--color-border)] bg-white px-3 py-2 transition-all duration-200 sm:flex ${
              searchFocused
                ? "border-[var(--color-primary-500)] shadow-[0_0_0_3px_rgba(29,78,216,0.1)]"
                : ""
            }`}
          >
            <Search className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-40 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] lg:w-56"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-ghost relative p-2"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 scale-in rounded-2xl border border-[var(--color-border)] bg-white shadow-xl sm:w-96">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-xs font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]"
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex gap-3 border-b border-[var(--color-border-light)] px-4 py-3 transition-colors hover:bg-[var(--color-surface-secondary)] ${
                          !notification.read ? "bg-[var(--color-surface-secondary)]" : ""
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notificationTypeColors[notification.type]}`}
                        >
                          <Bell className="h-4 w-4 text-[var(--color-text-secondary)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-medium ${
                                !notification.read
                                  ? "text-[var(--color-text-primary)]"
                                  : "text-[var(--color-text-secondary)]"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary-500)]" />
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-[var(--color-text-tertiary)]">
                            {notification.message}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[10px] text-[var(--color-text-tertiary)]">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => onMarkRead(notification.id)}
                                className="text-[10px] font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]"
                              >
                                Marcar leído
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn-ghost flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)]">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {user.name}
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">{roleLabel}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-[var(--color-text-tertiary)] md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 scale-in overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-xl">
                <div className="border-b border-[var(--color-border)] px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {user.email}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-[var(--color-info-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-info)]">
                    {roleLabel}
                  </span>
                </div>
                <div className="py-1">
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]">
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
