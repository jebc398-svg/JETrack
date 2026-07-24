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

const notificationTypeIcons: Record<string, string> = {
  info: "text-[var(--color-info)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-danger)]",
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
  const [searchQuery, setSearchQuery] = useState("");

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials = getInitials(user.name || "U");
  const roleLabel = roleLabels[user.role] || user.role;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
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
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / 60000,
    );
    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <header className="glass-strong sticky top-0 z-40 border-b border-white/40 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="btn-ghost rounded-xl p-2 transition-all duration-200 hover:bg-black/5 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 text-text-primary" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                {pageTitles[activePage] || activePage}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`hidden items-center gap-2.5 rounded-2xl border border-border bg-white/60 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 sm:flex ${
              searchFocused
                ? "border-primary-300 shadow-[0_0_0_3px_rgba(29,78,216,0.08)] bg-white/80"
                : "hover:bg-white/80 hover:border-border"
            }`}
          >
            <Search className="h-4 w-4 flex-shrink-0 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary lg:w-56"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="btn-ghost relative rounded-xl p-2.5 transition-all duration-200 hover:bg-black/5"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5 text-text-secondary" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white shadow-md shadow-danger/30">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 scale-in overflow-hidden rounded-2xl border border-border-light bg-white/95 shadow-2xl backdrop-blur-xl sm:w-96">
                <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Notificaciones
                    </h3>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1.5 text-[10px] font-bold text-primary-600">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-primary-500 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <Bell className="mx-auto mb-3 h-10 w-10 text-text-tertiary/40" />
                      <p className="text-sm font-medium text-text-tertiary">
                        No hay notificaciones
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex gap-3 border-b border-border-light px-5 py-3.5 transition-all duration-200 hover:bg-surface-secondary ${
                          !notification.read
                            ? "bg-primary-50/40"
                            : ""
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notificationTypeColors[notification.type]}`}
                        >
                          <Bell className={`h-4 w-4 ${notificationTypeIcons[notification.type]}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm leading-snug ${
                                !notification.read
                                  ? "font-semibold text-text-primary"
                                  : "font-medium text-text-secondary"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500 shadow-sm shadow-primary-500/30" />
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs leading-relaxed text-text-tertiary">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center gap-2.5">
                            <span className="text-[10px] font-medium text-text-tertiary">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => onMarkRead(notification.id)}
                                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-primary-500 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
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

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="btn-ghost flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2 transition-all duration-200 hover:bg-black/5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-md shadow-primary-500/25 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {initials}
                  </span>
                )}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold leading-tight text-text-primary">
                  {user.name}
                </p>
                <p className="text-[10px] font-medium text-text-tertiary">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 text-text-tertiary transition-transform duration-200 md:block ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-64 scale-in overflow-hidden rounded-2xl border border-border-light bg-white/95 shadow-2xl backdrop-blur-xl">
                <div className="border-b border-border-light px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-lg shadow-primary-500/25 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white drop-shadow-sm">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-text-tertiary">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="mt-3 inline-block rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-bold text-primary-600">
                    {roleLabel}
                  </span>
                </div>
                <div className="p-1.5">
                  <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-secondary hover:text-text-primary">
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-danger transition-all duration-200 hover:bg-danger-light"
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
