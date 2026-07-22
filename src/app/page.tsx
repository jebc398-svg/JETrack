"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import Login from "@/components/Login";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/pages/Dashboard";
import Tickets from "@/components/pages/Tickets";
import CalendarPage from "@/components/pages/CalendarPage";
import Quotations from "@/components/pages/Quotations";
import Clients from "@/components/pages/Clients";
import Technicians from "@/components/pages/Technicians";
import Reports from "@/components/pages/Reports";
import Settings from "@/components/pages/Settings";

const allowedPagesByRole: Record<string, string[]> = {
  admin: ["dashboard", "tickets", "calendario", "cotizaciones", "clientes", "tecnicos", "reportes", "configuracion"],
  supervisor: ["dashboard", "tickets", "calendario", "cotizaciones", "clientes", "tecnicos", "reportes"],
  technician: ["tickets"],
  client: ["tickets"],
};

const defaultPageByRole: Record<string, string> = {
  admin: "dashboard",
  supervisor: "dashboard",
  technician: "tickets",
  client: "tickets",
};

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const activePage = useAppStore((s) => s.activePage);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen);
  const notifications = useAppStore((s) => s.notifications);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setMobileSidebar = useAppStore((s) => s.setMobileSidebar);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const allowed = allowedPagesByRole[user.role] || [];
      if (!allowed.includes(activePage)) {
        setActivePage(defaultPageByRole[user.role] || "dashboard");
      }
    }
  }, [isAuthenticated, user.role, activePage, setActivePage]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!hydrated) {
    return <div style={{ display: "flex", minHeight: "100vh" }} />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "tickets":
        return <Tickets />;
      case "calendario":
        return <CalendarPage />;
      case "cotizaciones":
        return <Quotations />;
      case "clientes":
        return <Clients />;
      case "tecnicos":
        return <Technicians />;
      case "reportes":
        return <Reports />;
      case "configuracion":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        isOpen={isMobile ? mobileSidebarOpen : sidebarOpen}
        onToggle={isMobile ? () => setMobileSidebar(!mobileSidebarOpen) : toggleSidebar}
        isMobile={isMobile}
        onMobileClose={() => setMobileSidebar(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header
          activePage={activePage}
          onMenuToggle={isMobile ? () => setMobileSidebar(!mobileSidebarOpen) : toggleSidebar}
          notifications={notifications}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsRead}
        />

        <main
          className="app-main"
          style={{
            flex: 1,
            padding: isMobile ? "16px" : "24px",
            overflow: "auto",
            background: "#f8fafc",
          }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
