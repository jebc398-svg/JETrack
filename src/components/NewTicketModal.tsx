"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { serviceTypes } from "@/lib/data";
import { generateId } from "@/lib/utils";
import type { Ticket } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus } from "lucide-react";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function NewTicketModal() {
  const {
    clients,
    technicians,
    tickets,
    modals,
    closeModal,
    addTicket,
  } = useAppStore();

  const isOpen = modals["newTicket"]?.open || false;

  const [form, setForm] = useState({
    title: "",
    description: "",
    clientId: "",
    technicianId: "",
    serviceType: "",
    priority: "media" as Ticket["priority"],
    scheduledDate: "",
    scheduledTime: "",
    estimatedDuration: 60,
    location: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      clientId: "",
      technicianId: "",
      serviceType: "",
      priority: "media",
      scheduledDate: "",
      scheduledTime: "",
      estimatedDuration: 60,
      location: "",
      notes: "",
    });
  };

  const handleClose = () => {
    resetForm();
    closeModal("newTicket");
  };

  const handleCreate = () => {
    if (!form.title || !form.clientId || !form.scheduledDate) return;
    const client = clients.find((c) => c.id === form.clientId);
    const tech = technicians.find((t) => t.id === form.technicianId);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: `TK-${String(tickets.length + 1).padStart(3, "0")}`,
      title: form.title,
      description: form.description,
      status: "pending",
      priority: form.priority,
      clientId: form.clientId,
      clientName: client?.name || "",
      technicianId: form.technicianId || undefined,
      technicianName: tech?.name || undefined,
      serviceType: form.serviceType,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      location: form.location,
      estimatedDuration: form.estimatedDuration,
      photos: [],
      notes: form.notes
        ? [
            {
              id: generateId(),
              content: form.notes,
              author: "María López",
              authorRole: "admin",
              createdAt: now,
              isInternal: false,
            },
          ]
        : [],
      createdAt: now,
      updatedAt: now,
      createdBy: "María López",
    };
    addTicket(newTicket);
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="modal-content max-w-lg p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Nuevo Ticket</h2>
              <button className="btn-ghost p-1" onClick={handleClose}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <FormField label="Título">
                <input
                  className="input-field"
                  placeholder="Título del ticket"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </FormField>

              <FormField label="Descripción">
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Descripción del problema o servicio..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Cliente">
                  <select
                    className="select-field"
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Técnico (opcional)">
                  <select
                    className="select-field"
                    value={form.technicianId}
                    onChange={(e) => setForm({ ...form, technicianId: e.target.value })}
                  >
                    <option value="">Sin asignar</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Tipo de Servicio">
                  <select
                    className="select-field"
                    value={form.serviceType}
                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  >
                    <option value="">Seleccionar servicio</option>
                    {serviceTypes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Prioridad">
                  <select
                    className="select-field"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Ticket["priority"] })}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Fecha Programada">
                  <input
                    type="date"
                    className="input-field"
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  />
                </FormField>

                <FormField label="Hora Programada">
                  <input
                    type="time"
                    className="input-field"
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="Duración Estimada (minutos)">
                <input
                  type="number"
                  className="input-field"
                  min={15}
                  step={15}
                  value={form.estimatedDuration}
                  onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })}
                />
              </FormField>

              <FormField label="Ubicación">
                <input
                  className="input-field"
                  placeholder="Dirección completa"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </FormField>

              <FormField label="Notas">
                <textarea
                  className="input-field min-h-[60px] resize-none"
                  placeholder="Notas adicionales..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-[var(--color-border)]">
              <button className="btn-secondary" onClick={handleClose}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                <Plus className="w-4 h-4" />
                Crear Ticket
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
