"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import logo2 from "../logo2.png";
import portada from "../portada.jpg";

const validUsers: Record<
  string,
  { password: string; name: string; role: string; id: string }
> = {
  "maria@jetrack.mx": {
    password: "admin123",
    name: "María López",
    role: "admin",
    id: "u1",
  },
  "supervisor@jetrack.mx": {
    password: "super123",
    name: "Ana García",
    role: "supervisor",
    id: "u2",
  },
  "carlos@jetrack.mx": {
    password: "tech123",
    name: "Carlos Mendoza",
    role: "technician",
    id: "t1",
  },
  "roberto@jetrack.mx": {
    password: "tech123",
    name: "Roberto García",
    role: "technician",
    id: "t2",
  },
  "miguel@jetrack.mx": {
    password: "tech123",
    name: "Miguel Torres",
    role: "technician",
    id: "t3",
  },
};

export default function Login() {
  const login = useAppStore((s) => s.login);
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shakeError, setShakeError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    const saved = localStorage.getItem("jetrack_remember");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEmail(data.email || "");
        setRememberMe(true);
      } catch {}
    }
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (mounted && emailRef.current) {
      emailRef.current.focus();
    }
  }, [mounted]);

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña para continuar.");
      triggerShake();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El formato del correo electrónico no es válido.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1400));

    const user = validUsers[email.toLowerCase()];

    if (user && user.password === password) {
      if (rememberMe) {
        localStorage.setItem(
          "jetrack_remember",
          JSON.stringify({ email: email.toLowerCase() })
        );
      } else {
        localStorage.removeItem("jetrack_remember");
      }
      login(email.toLowerCase(), user.name, user.role, user.id);
    } else {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      triggerShake();
    }

    setIsLoading(false);
  };

  return (
    <div className="lg-root" role="main">
      {/* ===== LEFT: FORM PANEL ===== */}
      <div className={`lg-left ${mounted ? "lg-left--visible" : ""}`}>
        {/* Subtle background texture */}
        <div className="lg-left-texture" aria-hidden="true" />

        <div className="lg-left-inner">
          {/* Logo — large and prominent */}
          <div className={`lg-logo ${mounted ? "lg-logo--ready" : ""}`}>
            <img
              src={logo2.src}
              alt="JETrack"
              className="lg-logo-img"
              draggable={false}
            />
          </div>

          {/* Heading */}
          <div className="lg-heading">
            <h1 className="lg-title">Bienvenido de vuelta</h1>
            <p className="lg-subtitle">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="lg-error" role="alert" aria-live="assertive">
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`lg-form ${shakeError ? "lg-form--shake" : ""}`}
          >
            {/* Email */}
            <div className="lg-field">
              <label htmlFor="lg-email" className="lg-label">
                Correo electrónico
              </label>
              <div
                className={`lg-input-wrap ${
                  focusedField === "email" ? "lg-input-wrap--focus" : ""
                }`}
              >
                <Mail
                  size={18}
                  className={`lg-input-icon ${
                    focusedField === "email" ? "lg-input-icon--active" : ""
                  }`}
                  aria-hidden="true"
                />
                <input
                  ref={emailRef}
                  id="lg-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="tu@empresa.com"
                  autoComplete="email"
                  aria-required="true"
                  className="lg-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="lg-field">
              <label htmlFor="lg-password" className="lg-label">
                Contraseña
              </label>
              <div
                className={`lg-input-wrap ${
                  focusedField === "password" ? "lg-input-wrap--focus" : ""
                }`}
              >
                <Lock
                  size={18}
                  className={`lg-input-icon ${
                    focusedField === "password" ? "lg-input-icon--active" : ""
                  }`}
                  aria-hidden="true"
                />
                <input
                  id="lg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  aria-required="true"
                  className="lg-input lg-input--pw"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="lg-eye"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="lg-row">
              <label className="lg-remember" htmlFor="lg-remember">
                <input
                  id="lg-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="lg-checkbox-input"
                  aria-label="Recordarme"
                />
                <span
                  className={`lg-check ${
                    rememberMe ? "lg-check--on" : ""
                  }`}
                  aria-hidden="true"
                >
                  {rememberMe && (
                    <CheckCircle size={11} color="white" strokeWidth={3} />
                  )}
                </span>
                <span className="lg-remember-text">Recordarme</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`lg-submit ${isLoading ? "lg-submit--loading" : ""}`}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="lg-spinner" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Security */}
          <div className="lg-security">
            <Shield size={13} color="#94a3b8" />
            <span>Conexión segura y encriptada</span>
          </div>
        </div>

        {/* Footer */}
        <p className="lg-footer">© 2026 · Sistema de Gestión de Trabajos Técnicos</p>
      </div>

      {/* ===== RIGHT: IMAGE PANEL ===== */}
      <div className={`lg-right ${mounted ? "lg-right--visible" : ""}`} aria-hidden="true">
        {/* The cover image */}
        <img
          src={portada.src}
          alt=""
          className="lg-right-img"
          draggable={false}
        />

        {/* Gradient fade: white → transparent (left edge) */}
        <div className="lg-right-fade-left" />

        {/* Subtle dark overlay for depth */}
        <div className="lg-right-overlay" />

        {/* Bottom gradient for text legibility if needed */}
        <div className="lg-right-fade-bottom" />
      </div>

      {/* === ANIMATIONS === */}
      <style>{`
        @keyframes lg-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes lg-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
