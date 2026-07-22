"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import TechJobList from "./TechJobList";
import TechJobDetail from "./TechJobDetail";
import TechWorkView from "./TechWorkView";
import TechSignature from "./TechSignature";
import TechProfile from "./TechProfile";
import {
  Briefcase,
  Clock,
  User,
  LogOut,
} from "lucide-react";

export type TechScreen =
  | "list"
  | "detail"
  | "work"
  | "signature"
  | "history"
  | "profile";

export default function TechApp() {
  const [screen, setScreen] = useState<TechScreen>("list");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const logout = useAppStore((s) => s.logout);

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setScreen("detail");
  };

  const handleStartWork = (jobId: string) => {
    setSelectedJobId(jobId);
    setScreen("work");
  };

  const handleRequestSignature = (jobId: string) => {
    setSelectedJobId(jobId);
    setScreen("signature");
  };

  const handleJobCompleted = () => {
    setSelectedJobId(null);
    setScreen("history");
  };

  const handleBack = () => {
    if (screen === "detail" || screen === "work" || screen === "signature") {
      setSelectedJobId(null);
      setScreen("list");
    } else {
      setScreen("list");
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case "list":
        return (
          <TechJobList
            onSelectJob={handleSelectJob}
            onStartWork={handleStartWork}
          />
        );
      case "detail":
        return selectedJobId ? (
          <TechJobDetail
            jobId={selectedJobId}
            onBack={handleBack}
            onStartWork={handleStartWork}
            onRequestSignature={handleRequestSignature}
          />
        ) : null;
      case "work":
        return selectedJobId ? (
          <TechWorkView
            jobId={selectedJobId}
            onBack={handleBack}
            onRequestSignature={handleRequestSignature}
          />
        ) : null;
      case "signature":
        return selectedJobId ? (
          <TechSignature
            jobId={selectedJobId}
            onBack={handleBack}
            onCompleted={handleJobCompleted}
          />
        ) : null;
      case "history":
        return <TechJobList onSelectJob={handleSelectJob} historyMode />;
      case "profile":
        return <TechProfile />;
      default:
        return null;
    }
  };

  const tabs: { id: TechScreen; label: string; icon: typeof Briefcase }[] = [
    { id: "list", label: "Trabajos", icon: Briefcase },
    { id: "history", label: "Historial", icon: Clock },
    { id: "profile", label: "Perfil", icon: User },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100dvh",
        background: "#f1f5f9",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      <main
        style={{
          flex: 1,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "80px",
        }}
      >
        {renderScreen()}
      </main>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: "72px",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
          zIndex: 100,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            (screen === tab.id) ||
            (tab.id === "list" && screen === "detail") ||
            (tab.id === "list" && screen === "work") ||
            (tab.id === "list" && screen === "signature");
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "list" || tab.id === "history") {
                  setSelectedJobId(null);
                }
                setScreen(tab.id);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "6px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                minWidth: "64px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "16px",
                  background: isActive ? "#eff6ff" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: isActive ? "#2563eb" : "#94a3b8",
                    transition: "color 0.2s",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#2563eb" : "#94a3b8",
                  transition: "color 0.2s",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={logout}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            padding: "6px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            minWidth: "64px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
            }}
          >
            <LogOut size={22} style={{ color: "#94a3b8" }} />
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#94a3b8",
            }}
          >
            Salir
          </span>
        </button>
      </nav>
    </div>
  );
}
