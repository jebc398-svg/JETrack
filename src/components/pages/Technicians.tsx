"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { getInitials, generateId } from "@/lib/utils";
import type { Technician } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";

const specialties = [
  "Electrónica Industrial",
  "Plomería",
  "Climatización",
  "Mantenimiento General",
  "Electricidad",
  "Seguridad",
  "Telecomunicaciones",
];

const zones = ["Norte", "Sur", "Este", "Oeste", "Centro"];

const availabilityLabels: Record<Technician["availability"], string> = {
  disponible: "Disponible",
  en_trabajo: "En Trabajo",
  fuera: "Fuera",
};

type FilterAvailability = "" | "disponible" | "en_trabajo" | "fuera";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialty: "",
  zone: "",
  availability: "disponible" as Technician["availability"],
  active: true,
};

export default function TechniciansPage() {
  const { technicians, tickets, addTechnician, updateTechnician, deleteTechnician, openModal, closeModal, modals } =
    useAppStore();

  const [search, setSearch] = useState("");
  const [filterAvail, setFilterAvail] = useState<FilterAvailability>("");
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editTech, setEditTech] = useState<Technician | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    let result = [...technicians];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.specialty.toLowerCase().includes(q) ||
          t.zone.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
      );
    }
    if (filterAvail) {
      result = result.filter((t) => t.availability === filterAvail);
    }
    return result;
  }, [technicians, search, filterAvail]);

  const stats = useMemo(() => {
    const total = technicians.length;
    const disponibles = technicians.filter(
      (t) => t.availability === "disponible"
    ).length;
    const enTrabajo = technicians.filter(
      (t) => t.availability === "en_trabajo"
    ).length;
    const fuera = technicians.filter((t) => t.availability === "fuera").length;
    return { total, disponibles, enTrabajo, fuera };
  }, [technicians]);

  const getActiveTicket = (techId: string) => {
    return tickets.find(
      (t) =>
        t.technicianId === techId &&
        ["en_camino", "iniciado", "pausado"].includes(t.status)
    );
  };

  const getTechHistory = (techId: string) => {
    return tickets
      .filter((t) => t.technicianId === techId && t.status === "completado")
      .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))
      .slice(0, 5);
  };

  const openProfile = (tech: Technician) => {
    setSelectedTech(tech);
    setProfileOpen(true);
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setTimeout(() => setSelectedTech(null), 300);
  };

  const openNewModal = () => {
    setEditTech(null);
    setForm({ ...emptyForm });
    openModal("technicianForm");
  };

  const openEditModal = (tech: Technician) => {
    setEditTech(tech);
    setForm({
      name: tech.name,
      email: tech.email,
      phone: tech.phone || "",
      specialty: tech.specialty,
      zone: tech.zone,
      availability: tech.availability,
      active: tech.active,
    });
    openModal("technicianForm");
  };

  const handleSubmit = () => {
    if (editTech) {
      updateTechnician(editTech.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialty: form.specialty,
        zone: form.zone,
        availability: form.availability,
        active: form.active,
      });
    } else {
      const newTech: Technician = {
        id: `t${generateId()}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: "technician",
        specialty: form.specialty,
        zone: form.zone,
        availability: form.availability,
        rating: 0,
        completedJobs: 0,
        active: form.active,
      };
      addTechnician(newTech);
    }
    closeModal("technicianForm");
    setForm({ ...emptyForm });
    setEditTech(null);
  };

  const handleDeleteTechnician = (id: string) => {
    deleteTechnician(id);
    setConfirmDelete(null);
  };

  const availColor = (avail: Technician["availability"]) => {
    switch (avail) {
      case "disponible":
        return "bg-green-500";
      case "en_trabajo":
        return "bg-amber-500";
      case "fuera":
        return "bg-gray-400";
    }
  };

  const availTextColor = (avail: Technician["availability"]) => {
    switch (avail) {
      case "disponible":
        return "text-green-700";
      case "en_trabajo":
        return "text-amber-700";
      case "fuera":
        return "text-gray-500";
    }
  };

  const availBgColor = (avail: Technician["availability"]) => {
    switch (avail) {
      case "disponible":
        return "bg-green-50";
      case "en_trabajo":
        return "bg-amber-50";
      case "fuera":
        return "bg-gray-50";
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const techModal = modals["technicianForm"] || { open: false };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Técnicos</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar técnico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            {(["", "disponible", "en_trabajo", "fuera"] as FilterAvailability[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilterAvail(f)}
                  className={`btn-ghost text-xs ${
                    filterAvail === f
                      ? "!bg-primary-500 !text-white"
                      : ""
                  }`}
                >
                  {f === ""
                    ? "Todos"
                    : availabilityLabels[f as Technician["availability"]]}
                </button>
              )
            )}
          </div>
          <button className="btn-primary" onClick={openNewModal}>
            <Plus className="w-4 h-4" />
            Nuevo Técnico
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary font-medium">Total Técnicos</p>
            <p className="text-xl font-bold text-text-primary">{stats.total}</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-text-tertiary font-medium">Disponibles</span>
          </div>
          <p className="text-xl font-bold text-green-700">{stats.disponibles}</p>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-text-tertiary font-medium">En Trabajo</span>
          </div>
          <p className="text-xl font-bold text-amber-700">{stats.enTrabajo}</p>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-xs text-text-tertiary font-medium">Fuera</span>
          </div>
          <p className="text-xl font-bold text-gray-500">{stats.fuera}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((tech, i) => {
            const activeTicket = getActiveTicket(tech.id);
            return (
              <motion.div
                key={tech.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {getInitials(tech.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-text-primary text-base">
                          {tech.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="chip chip-scheduled text-[11px]">
                            {tech.specialty}
                          </span>
                          <span className="chip chip-pending text-[11px]">
                            <MapPin className="w-3 h-3" />
                            {tech.zone}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${availBgColor(
                          tech.availability
                        )} ${availTextColor(tech.availability)}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${availColor(
                            tech.availability
                          )}`}
                        />
                        {availabilityLabels[tech.availability]}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1">
                        {renderStars(tech.rating)}
                        <span className="text-sm font-semibold text-text-primary ml-1">
                          {tech.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-tertiary">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {tech.completedJobs} trabajos
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-text-tertiary" />
                        {tech.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-text-tertiary" />
                        {tech.phone}
                      </span>
                    </div>

                    {activeTicket && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">
                          Asignación Actual
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {activeTicket.title}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-light">
                      <button
                        className="btn-ghost text-xs"
                        onClick={() => openProfile(tech)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Perfil
                      </button>
                      <button
                        className="btn-ghost text-xs"
                        onClick={() => openEditModal(tech)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        className="btn-ghost text-xs text-danger hover:bg-red-50"
                        onClick={() => setConfirmDelete(tech.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="card-static p-12 text-center">
          <Wrench className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary font-medium">
            No se encontraron técnicos
          </p>
          <p className="text-text-tertiary text-sm mt-1">
            Ajusta los filtros o agrega un nuevo técnico
          </p>
        </div>
      )}

      <AnimatePresence>
        {profileOpen && selectedTech && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfile}
          >
            <motion.div
              className="modal-content max-w-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl">
                      {getInitials(selectedTech.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">
                        {selectedTech.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="chip chip-scheduled text-xs">
                          {selectedTech.specialty}
                        </span>
                        <span className="chip chip-pending text-xs">
                          <MapPin className="w-3 h-3" />
                          {selectedTech.zone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-ghost"
                    onClick={closeProfile}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-surface-secondary text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {selectedTech.completedJobs}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      Trabajos Completados
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-secondary text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <p className="text-2xl font-bold text-text-primary">
                        {selectedTech.rating.toFixed(1)}
                      </p>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">Calificación</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-secondary text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {selectedTech.completedJobs > 0
                        ? Math.round(
                            (selectedTech.completedJobs /
                              (selectedTech.completedJobs + 10)) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      Tasa de Utilización
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-text-primary">
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Mail className="w-4 h-4 text-text-tertiary" />
                      {selectedTech.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Phone className="w-4 h-4 text-text-tertiary" />
                      {selectedTech.phone}
                    </div>
                  </div>
                </div>

                {(() => {
                  const activeTicket = getActiveTicket(selectedTech.id);
                  if (!activeTicket) return null;
                  return (
                    <div className="mb-6">
                      <h3 className="font-semibold text-text-primary mb-3">
                        Asignación Actual
                      </h3>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="font-medium text-text-primary">
                          {activeTicket.title}
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                          {activeTicket.clientName} — {activeTicket.location}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <h3 className="font-semibold text-text-primary mb-3">
                    Historial Reciente
                  </h3>
                  {getTechHistory(selectedTech.id).length === 0 ? (
                    <p className="text-sm text-text-tertiary">
                      Sin trabajos completados recientes
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {getTechHistory(selectedTech.id).map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary"
                        >
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {ticket.title}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {ticket.clientName}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="chip chip-completado text-[11px]">
                              Completado
                            </span>
                            <p className="text-[11px] text-text-tertiary mt-1">
                              {ticket.completedAt
                                ? new Date(ticket.completedAt).toLocaleDateString(
                                    "es-MX",
                                    { day: "2-digit", month: "short" }
                                  )
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {techModal.open && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              closeModal("technicianForm");
              setEditTech(null);
            }}
          >
            <motion.div
              className="modal-content max-w-lg"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary">
                    {editTech ? "Editar Técnico" : "Nuevo Técnico"}
                  </h2>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      closeModal("technicianForm");
                      setEditTech(null);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="input-field"
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="input-field"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="input-field"
                        placeholder="81-0000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Especialidad
                      </label>
                      <select
                        value={form.specialty}
                        onChange={(e) =>
                          setForm({ ...form, specialty: e.target.value })
                        }
                        className="select-field"
                      >
                        <option value="">Seleccionar...</option>
                        {specialties.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Zona
                      </label>
                      <select
                        value={form.zone}
                        onChange={(e) =>
                          setForm({ ...form, zone: e.target.value })
                        }
                        className="select-field"
                      >
                        <option value="">Seleccionar...</option>
                        {zones.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Disponibilidad
                      </label>
                      <select
                        value={form.availability}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            availability: e.target.value as Technician["availability"],
                          })
                        }
                        className="select-field"
                      >
                        <option value="disponible">Disponible</option>
                        <option value="en_trabajo">En Trabajo</option>
                        <option value="fuera">Fuera</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2.5 cursor-pointer py-2.5">
                        <input
                          type="checkbox"
                          checked={form.active}
                          onChange={(e) =>
                            setForm({ ...form, active: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-text-secondary">
                          Activo
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        closeModal("technicianForm");
                        setEditTech(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleSubmit}
                      disabled={!form.name || !form.email || !form.specialty || !form.zone}
                    >
                      {editTech ? "Guardar Cambios" : "Crear Técnico"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              className="modal-content max-w-sm p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-primary mb-2">Eliminar Técnico</h3>
              <p className="text-sm text-text-secondary mb-6">
                ¿Estás seguro de que deseas eliminar este técnico? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
                <button className="btn-danger" onClick={() => handleDeleteTechnician(confirmDelete)}>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
