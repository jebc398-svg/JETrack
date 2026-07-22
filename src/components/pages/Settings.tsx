"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Users,
  DollarSign,
  Bell,
  Shield,
  Palette,
  Save,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Check,
  X,
} from "lucide-react";

type SettingsTab = "general" | "usuarios" | "tarifas" | "notificaciones" | "permisos" | "personalizacion";

interface SettingsUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "technician" | "client";
  active: boolean;
  phone: string;
}

interface ServiceRate {
  id: string;
  service: string;
  rate: number;
}

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Building className="w-5 h-5" /> },
  { id: "usuarios", label: "Usuarios", icon: <Users className="w-5 h-5" /> },
  { id: "tarifas", label: "Tarifas", icon: <DollarSign className="w-5 h-5" /> },
  { id: "notificaciones", label: "Notificaciones", icon: <Bell className="w-5 h-5" /> },
  { id: "permisos", label: "Permisos", icon: <Shield className="w-5 h-5" /> },
  { id: "personalizacion", label: "Personalización", icon: <Palette className="w-5 h-5" /> },
];

const roleBadgeColors: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  supervisor: "bg-green-100 text-green-700",
  technician: "bg-amber-100 text-amber-700",
  client: "bg-gray-100 text-gray-600",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  supervisor: "Supervisor",
  technician: "Técnico",
  client: "Cliente",
};

const permissionLabels: Record<string, string> = {
  viewTickets: "Ver Tickets",
  createTickets: "Crear Tickets",
  editTickets: "Editar Tickets",
  deleteTickets: "Eliminar Tickets",
  viewClients: "Ver Clientes",
  createClients: "Crear Clientes",
  editClients: "Editar Clientes",
  viewQuotations: "Ver Cotizaciones",
  createQuotations: "Crear Cotizaciones",
  approveQuotations: "Aprobar Cotizaciones",
  viewCalendar: "Ver Calendario",
  manageCalendar: "Gestionar Calendario",
  viewReports: "Ver Reportes",
  manageSettings: "Configuración",
};

const permissionKeys = Object.keys(permissionLabels);

const defaultPermissions: Record<string, Record<string, boolean>> = {
  admin: Object.fromEntries(permissionKeys.map((k) => [k, true])),
  supervisor: {
    viewTickets: true,
    createTickets: true,
    editTickets: true,
    deleteTickets: false,
    viewClients: true,
    createClients: true,
    editClients: true,
    viewQuotations: true,
    createQuotations: true,
    approveQuotations: false,
    viewCalendar: true,
    manageCalendar: true,
    viewReports: true,
    manageSettings: false,
  },
  technician: {
    viewTickets: true,
    createTickets: false,
    editTickets: true,
    deleteTickets: false,
    viewClients: true,
    createClients: false,
    editClients: false,
    viewQuotations: true,
    createQuotations: false,
    approveQuotations: false,
    viewCalendar: true,
    manageCalendar: false,
    viewReports: false,
    manageSettings: false,
  },
  client: {
    viewTickets: true,
    createTickets: true,
    editTickets: false,
    deleteTickets: false,
    viewClients: false,
    createClients: false,
    editClients: false,
    viewQuotations: true,
    createQuotations: false,
    approveQuotations: false,
    viewCalendar: false,
    manageCalendar: false,
    viewReports: false,
    manageSettings: false,
  },
};

const presetColors = [
  "#1d4ed8",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#be185d",
  "#4f46e5",
];

const initialUsers: SettingsUser[] = [
  { id: "u1", name: "María López", email: "maria@jetrack.mx", role: "admin", active: true, phone: "81-1234-5678" },
  { id: "u2", name: "Carlos Mendoza", email: "carlos@jetrack.mx", role: "technician", active: true, phone: "81-2345-6789" },
  { id: "u3", name: "Roberto García", email: "roberto@jetrack.mx", role: "technician", active: true, phone: "81-3456-7890" },
  { id: "u4", name: "Ana Torres", email: "ana@jetrack.mx", role: "supervisor", active: true, phone: "81-4567-8901" },
  { id: "u5", name: "Luis Ramírez", email: "luis@jetrack.mx", role: "technician", active: false, phone: "81-5678-9012" },
  { id: "u6", name: "Sofia Hernández", email: "sofia@jetrack.mx", role: "client", active: true, phone: "81-6789-0123" },
];

const initialRates: ServiceRate[] = [
  { id: "r1", service: "Climatización", rate: 800 },
  { id: "r2", service: "Electricidad", rate: 750 },
  { id: "r3", service: "Plomería", rate: 700 },
  { id: "r4", service: "Mantenimiento", rate: 650 },
  { id: "r5", service: "Carpintería", rate: 600 },
  { id: "r6", service: "Pintura", rate: 550 },
  { id: "r7", service: "Albañilería", rate: 700 },
  { id: "r8", service: "Jardinería", rate: 500 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [users, setUsers] = useState<SettingsUser[]>(initialUsers);
  const [rates, setRates] = useState<ServiceRate[]>(initialRates);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [travelFee, setTravelFee] = useState(150);
  const [minCharge, setMinCharge] = useState(350);

  const [generalForm, setGeneralForm] = useState({
    companyName: "JETrack Soluciones Técnicas",
    companyEmail: "contacto@jetrack.mx",
    companyPhone: "81-8000-5678",
    companyAddress: "Av. Tecnológico 1250, Monterrey, NL 64000",
    timezone: "America/Mexico_City",
    language: "es",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    ticketAssignment: true,
    statusChange: true,
    quotationAlerts: true,
  });

  const [personalization, setPersonalization] = useState({
    primaryColor: "#1d4ed8",
    sidebarStyle: "expanded" as "compact" | "expanded",
    dateFormat: "DD/MM/YYYY",
    currencyFormat: "MXN",
    mapProvider: "google",
  });

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<SettingsUser["role"]>("technician");

  function handleGeneralChange(field: string, value: string) {
    setGeneralForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNotificationToggle(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePermissionToggle(role: string, perm: string) {
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
  }

  function startEditRate(rate: ServiceRate) {
    setEditingRateId(rate.id);
    setEditRateValue(rate.rate);
  }

  function saveEditRate(id: string) {
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, rate: editRateValue } : r)));
    setEditingRateId(null);
  }

  function addRate() {
    const newRate: ServiceRate = {
      id: `r${Date.now()}`,
      service: "Nuevo Servicio",
      rate: 500,
    };
    setRates((prev) => [...prev, newRate]);
    setEditingRateId(newRate.id);
    setEditRateValue(500);
  }

  function removeRate(id: string) {
    setRates((prev) => prev.filter((r) => r.id !== id));
  }

  function addUser() {
    if (!newUserName || !newUserEmail) return;
    const newUser: SettingsUser = {
      id: `u${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      active: true,
      phone: "",
    };
    setUsers((prev) => [...prev, newUser]);
    setNewUserName("");
    setNewUserEmail("");
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function toggleUserActive(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
          <Settings className="w-7 h-7 text-[var(--color-primary-500)]" />
          Configuración
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Administra la configuración del sistema</p>
      </div>

      <div className="flex gap-6 min-h-[700px]">
        {/* Left: Tab navigation */}
        <div className="w-64 shrink-0">
          <div className="card-static p-2">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-link ${activeTab === tab.id ? "active" : ""}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right: Content area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "general" && (
                <div className="card-static p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Building className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Información General
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Nombre de la Empresa</label>
                      <input
                        type="text"
                        className="input-field"
                        value={generalForm.companyName}
                        onChange={(e) => handleGeneralChange("companyName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-4 h-4" /> Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        value={generalForm.companyEmail}
                        onChange={(e) => handleGeneralChange("companyEmail", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-4 h-4" /> Teléfono
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={generalForm.companyPhone}
                        onChange={(e) => handleGeneralChange("companyPhone", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Dirección
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={generalForm.companyAddress}
                        onChange={(e) => handleGeneralChange("companyAddress", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Zona Horaria
                      </label>
                      <select
                        className="select-field"
                        value={generalForm.timezone}
                        onChange={(e) => handleGeneralChange("timezone", e.target.value)}
                      >
                        <option value="America/Mexico_City">México (GMT-6)</option>
                        <option value="America/Tijuana">Tijuana (GMT-8)</option>
                        <option value="America/Cancun">Cancún (GMT-5)</option>
                        <option value="America/Bogota">Bogotá (GMT-5)</option>
                        <option value="America/New_York">Nueva York (GMT-5)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                        <Globe className="w-4 h-4" /> Idioma
                      </label>
                      <select
                        className="select-field"
                        value={generalForm.language}
                        onChange={(e) => handleGeneralChange("language", e.target.value)}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Logo de la Empresa</label>
                      <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center hover:border-[var(--color-primary-400)] transition-colors cursor-pointer">
                        <Upload className="w-10 h-10 mx-auto text-[var(--color-text-tertiary)] mb-2" />
                        <p className="text-sm text-[var(--color-text-secondary)]">Arrastra un archivo o haz clic para subir</p>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">PNG, JPG, SVG (Max. 2MB)</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                    <button className="btn-primary">
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "usuarios" && (
                <div className="card-static p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--color-primary-500)]" />
                      Gestión de Usuarios
                    </h2>
                    <button className="btn-primary" onClick={() => {
                      setNewUserName("");
                      setNewUserEmail("");
                      setNewUserRole("technician");
                    }}>
                      <Plus className="w-4 h-4" />
                      Agregar Usuario
                    </button>
                  </div>

                  {/* Add user form */}
                  <div className="bg-[var(--color-surface-secondary)] rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[180px]">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Nombre</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nombre completo"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Email</label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="correo@jetrack.mx"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="w-44">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Rol</label>
                      <select
                        className="select-field"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as SettingsUser["role"])}
                      >
                        <option value="admin">Admin</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="technician">Técnico</option>
                        <option value="client">Cliente</option>
                      </select>
                    </div>
                    <button className="btn-primary" onClick={addUser}>
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--color-border)]">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Nombre</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Email</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Rol</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Estado</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="table-row border-b border-[var(--color-border-light)]">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center text-white text-sm font-semibold">
                                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </div>
                                <span className="font-medium text-sm text-[var(--color-text-primary)]">{user.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`chip ${roleBadgeColors[user.role]}`}>
                                {roleLabels[user.role]}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`chip ${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {user.active ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  className="btn-ghost p-1.5"
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn-ghost p-1.5"
                                  title={user.active ? "Desactivar" : "Activar"}
                                  onClick={() => toggleUserActive(user.id)}
                                >
                                  {user.active ? (
                                    <X className="w-4 h-4 text-amber-500" />
                                  ) : (
                                    <Check className="w-4 h-4 text-green-500" />
                                  )}
                                </button>
                                <button
                                  className="btn-ghost p-1.5"
                                  title="Eliminar"
                                  onClick={() => removeUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "tarifas" && (
                <div className="card-static p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Tarifas de Servicio
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Cuota de Desplazamiento ($)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={travelFee}
                        onChange={(e) => setTravelFee(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Cargo Mínimo ($)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={minCharge}
                        onChange={(e) => setMinCharge(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--color-border)]">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Servicio</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Tarifa / hr ($)</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates.map((rate) => (
                          <tr key={rate.id} className="table-row border-b border-[var(--color-border-light)]">
                            <td className="py-3 px-4 text-sm font-medium text-[var(--color-text-primary)]">{rate.service}</td>
                            <td className="py-3 px-4">
                              {editingRateId === rate.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    className="input-field w-32"
                                    value={editRateValue}
                                    onChange={(e) => setEditRateValue(Number(e.target.value))}
                                    autoFocus
                                  />
                                  <button
                                    className="btn-ghost p-1.5"
                                    onClick={() => saveEditRate(rate.id)}
                                  >
                                    <Check className="w-4 h-4 text-green-500" />
                                  </button>
                                  <button
                                    className="btn-ghost p-1.5"
                                    onClick={() => setEditingRateId(null)}
                                  >
                                    <X className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                                  ${rate.rate.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  className="btn-ghost p-1.5"
                                  onClick={() => startEditRate(rate)}
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn-ghost p-1.5"
                                  onClick={() => removeRate(rate.id)}
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <button className="btn-secondary" onClick={addRate}>
                      <Plus className="w-4 h-4" />
                      Agregar Tipo de Servicio
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                    <button className="btn-primary">
                      <Save className="w-4 h-4" />
                      Guardar Tarifas
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notificaciones" && (
                <div className="card-static p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Configuración de Notificaciones
                  </h2>

                  <div className="max-w-xl space-y-4 mb-8">
                    {(Object.keys(notifications) as (keyof typeof notifications)[]).map((key) => {
                      const labels: Record<string, string> = {
                        email: "Notificaciones por Email",
                        sms: "Notificaciones por SMS",
                        push: "Notificaciones Push",
                        ticketAssignment: "Alertas de Asignación de Tickets",
                        statusChange: "Alertas de Cambio de Estado",
                        quotationAlerts: "Alertas de Cotizaciones",
                      };
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                        >
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{labels[key]}</span>
                          <button
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              notifications[key] ? "bg-[var(--color-primary-500)]" : "bg-gray-300"
                            }`}
                            onClick={() => handleNotificationToggle(key)}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                notifications[key] ? "translate-x-5" : ""
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Plantillas de Notificación</h3>
                    <div className="space-y-3 max-w-xl">
                      <div className="p-4 rounded-xl border border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">Asignación de Ticket</span>
                          <button className="btn-ghost text-xs">
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] rounded-lg p-2.5">
                          Se te ha asignado el ticket #{"{ticketId}"}. Servicio: {"{serviceType}"} en {"{location}"}. Fecha: {"{date}"} a las {"{time}"}.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">Cambio de Estado</span>
                          <button className="btn-ghost text-xs">
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] rounded-lg p-2.5">
                          El ticket #{"{ticketId}"} ha cambiado de estado a <strong>{"{newStatus}"}</strong>.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">Cotización Enviada</span>
                          <button className="btn-ghost text-xs">
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] rounded-lg p-2.5">
                          Se ha enviado la cotización #{"{quotationNumber}"} al cliente {"{clientName}"} por un total de {"${total}"}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                    <button className="btn-primary">
                      <Save className="w-4 h-4" />
                      Guardar Notificaciones
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "permisos" && (
                <div className="card-static p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Matriz de Permisos por Rol
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--color-border)]">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider sticky left-0 bg-white">
                            Permiso
                          </th>
                          {["admin", "supervisor", "technician", "client"].map((role) => (
                            <th key={role} className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                              <span className={`chip ${roleBadgeColors[role]}`}>{roleLabels[role]}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {permissionKeys.map((perm) => (
                          <tr key={perm} className="table-row border-b border-[var(--color-border-light)]">
                            <td className="py-3 px-4 text-sm font-medium text-[var(--color-text-primary)] sticky left-0 bg-white">
                              {permissionLabels[perm]}
                            </td>
                            {["admin", "supervisor", "technician", "client"].map((role) => (
                              <td key={role} className="py-3 px-4 text-center">
                                <button
                                  className={`w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-colors ${
                                    permissions[role][perm]
                                      ? "bg-[var(--color-primary-500)] border-[var(--color-primary-500)] text-white"
                                      : "border-gray-300 hover:border-gray-400"
                                  }`}
                                  onClick={() => handlePermissionToggle(role, perm)}
                                >
                                  {permissions[role][perm] && <Check className="w-3 h-3" />}
                                </button>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                    <button className="btn-primary">
                      <Save className="w-4 h-4" />
                      Guardar Permisos
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "personalizacion" && (
                <div className="card-static p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Personalización
                  </h2>

                  <div className="max-w-xl space-y-6">
                    {/* Color theme */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">Color Principal</label>
                      <div className="flex items-center gap-3 flex-wrap">
                        {presetColors.map((color) => (
                          <button
                            key={color}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              personalization.primaryColor === color
                                ? "border-[var(--color-text-primary)] scale-110"
                                : "border-transparent hover:scale-105"
                            }`}
                            style={{ background: color }}
                            onClick={() => setPersonalization((prev) => ({ ...prev, primaryColor: color }))}
                          >
                            {personalization.primaryColor === color && <Check className="w-5 h-5 text-white mx-auto" />}
                          </button>
                        ))}
                        <div className="flex items-center gap-2 ml-2">
                          <input
                            type="color"
                            className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--color-border)]"
                            value={personalization.primaryColor}
                            onChange={(e) => setPersonalization((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          />
                          <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{personalization.primaryColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar style */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Estilo del Sidebar</label>
                      <div className="flex gap-3">
                        <button
                          className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                            personalization.sidebarStyle === "expanded"
                              ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                              : "border-[var(--color-border)] hover:border-gray-300"
                          }`}
                          onClick={() => setPersonalization((prev) => ({ ...prev, sidebarStyle: "expanded" }))}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded bg-[var(--color-primary-500)]" />
                            <div className="w-16 h-2 rounded bg-gray-300" />
                          </div>
                          <span className="text-xs font-medium">Expandido</span>
                        </button>
                        <button
                          className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                            personalization.sidebarStyle === "compact"
                              ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                              : "border-[var(--color-border)] hover:border-gray-300"
                          }`}
                          onClick={() => setPersonalization((prev) => ({ ...prev, sidebarStyle: "compact" }))}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-4 h-4 rounded bg-[var(--color-primary-500)]" />
                          </div>
                          <span className="text-xs font-medium">Compacto</span>
                        </button>
                      </div>
                    </div>

                    {/* Date format */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Formato de Fecha</label>
                      <select
                        className="select-field"
                        value={personalization.dateFormat}
                        onChange={(e) => setPersonalization((prev) => ({ ...prev, dateFormat: e.target.value }))}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                      </select>
                    </div>

                    {/* Currency format */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Moneda</label>
                      <select
                        className="select-field"
                        value={personalization.currencyFormat}
                        onChange={(e) => setPersonalization((prev) => ({ ...prev, currencyFormat: e.target.value }))}
                      >
                        <option value="MXN">MXN - Peso Mexicano</option>
                        <option value="USD">USD - Dólar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>

                    {/* Map provider */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Proveedor de Mapas</label>
                      <select
                        className="select-field"
                        value={personalization.mapProvider}
                        onChange={(e) => setPersonalization((prev) => ({ ...prev, mapProvider: e.target.value }))}
                      >
                        <option value="google">Google Maps</option>
                        <option value="mapbox">Mapbox</option>
                        <option value="openstreet">OpenStreetMap</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                    <button className="btn-primary">
                      <Save className="w-4 h-4" />
                      Guardar Personalización
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
