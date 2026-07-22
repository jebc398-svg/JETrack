"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatDate, getInitials, generateId } from "@/lib/utils";
import type { Client, QuotationStatus, TicketStatus } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Users,
  Ticket,
  FileText,
  X,
  Calendar,
  DollarSign,
} from "lucide-react";

const statusLabels: Record<TicketStatus, string> = {
  pending: "Pendiente",
  scheduled: "Programado",
  en_camino: "En Camino",
  iniciado: "Iniciado",
  pausado: "Pausado",
  completado: "Completado",
  cancelado: "Cancelado",
};

const quotationStatusLabels: Record<QuotationStatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  facturada: "Facturada",
};

type DetailTab = "info" | "tickets" | "quotations";

export default function ClientsPage() {
  const {
    clients,
    tickets,
    quotations,
    addClient,
    updateClient,
    openModal,
    closeModal,
    modals,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const defaultForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    notes: "",
    active: true,
  };

  const [form, setForm] = useState(defaultForm);

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.active).length;
    const totalTickets = clients.reduce((sum, c) => {
      return sum + tickets.filter((t) => t.clientId === c.id).length;
    }, 0);
    const totalRevenue = quotations
      .filter((q) => q.status === "aprobada" || q.status === "facturada")
      .reduce((sum, q) => sum + q.total, 0);
    return { total, active, totalTickets, totalRevenue };
  }, [clients, tickets, quotations]);

  const getClientTickets = (clientId: string) =>
    tickets.filter((t) => t.clientId === clientId);

  const getClientQuotations = (clientId: string) =>
    quotations.filter((q) => q.clientId === clientId);

  const openDetail = (client: Client) => {
    setSelectedClient(client);
    setDetailTab("info");
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setTimeout(() => setSelectedClient(null), 300);
  };

  const openNewClient = () => {
    setEditingClient(null);
    setForm(defaultForm);
    openModal("newClient");
  };

  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company || "",
      address: client.address,
      city: client.city,
      notes: client.notes || "",
      active: client.active,
    });
    openModal("newClient");
  };

  const handleSaveClient = () => {
    if (editingClient) {
      updateClient(editingClient.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company || undefined,
        address: form.address,
        city: form.city,
        notes: form.notes || undefined,
        active: form.active,
      });
    } else {
      const newClient: Client = {
        id: `c${generateId()}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company || undefined,
        address: form.address,
        city: form.city,
        notes: form.notes || undefined,
        active: form.active,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addClient(newClient);
    }
    closeModal("newClient");
  };

  const handleDeleteClient = (id: string) => {
    const { updateClient: update } = useAppStore.getState();
    update(id, { active: false } as Partial<Client>);
    setConfirmDelete(null);
  };

  const clientModalOpen = modals["newClient"] || { open: false };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
          <p className="text-sm text-text-secondary mt-1">
            Gestiona tu cartera de clientes
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="input-field pl-10 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openNewClient}>
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-xs text-text-secondary">Total Clientes</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
            <p className="text-xs text-text-secondary">Activos</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.totalTickets}</p>
            <p className="text-xs text-text-secondary">Tickets Totales</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-text-secondary">Ingresos Totales</p>
          </div>
        </div>
      </div>

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div className="card-static p-12 text-center">
          <Users className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary font-medium">
            No se encontraron clientes
          </p>
          <p className="text-text-tertiary text-sm mt-1">
            {search
              ? "Intenta ajustar la búsqueda"
              : "Agrega tu primer cliente para comenzar"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClients.map((client, i) => {
              const clientTicketCount = getClientTickets(client.id).length;
              const clientRevenue = getClientQuotations(client.id)
                .filter((q) => q.status === "aprobada" || q.status === "facturada")
                .reduce((sum, q) => sum + q.total, 0);

              return (
                <motion.div
                  key={client.id}
                  className="card p-5 cursor-pointer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openDetail(client)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {getInitials(client.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {client.name}
                        </p>
                        {client.company && (
                          <p className="text-xs text-text-tertiary truncate">
                            {client.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                        client.active ? "bg-emerald-400" : "bg-gray-300"
                      }`}
                      title={client.active ? "Activo" : "Inactivo"}
                    />
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Mail className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Phone className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="chip chip-scheduled">{client.city}</span>
                    {!client.active && (
                      <span className="chip chip-cancelado">Inactivo</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-light">
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" />
                        {clientTicketCount} tickets
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatCurrency(clientRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-ghost p-1.5"
                        title="Ver historial"
                        onClick={() => openDetail(client)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="btn-ghost p-1.5"
                        title="Editar"
                        onClick={() => openEditClient(client)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="btn-ghost p-1.5 text-danger hover:bg-red-50"
                        title="Eliminar"
                        onClick={() => setConfirmDelete(client.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailOpen && selectedClient && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
          >
            <motion.div
              className="modal-content max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Client Header */}
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {getInitials(selectedClient.name)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">
                        {selectedClient.name}
                      </h2>
                      {selectedClient.company && (
                        <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5" />
                          {selectedClient.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="btn-ghost p-2" onClick={closeDetail}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-5">
                  {(
                    [
                      ["info", "Información"],
                      ["tickets", "Historial de Tickets"],
                      ["quotations", "Cotizaciones"],
                    ] as [DetailTab, string][]
                  ).map(([tab, label]) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        detailTab === tab
                          ? "bg-primary-50 text-primary-600"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
                      }`}
                      onClick={() => setDetailTab(tab)}
                    >
                      {label}
                      {tab === "tickets" && (
                        <span className="ml-1.5 text-xs opacity-70">
                          ({getClientTickets(selectedClient.id).length})
                        </span>
                      )}
                      {tab === "quotations" && (
                        <span className="ml-1.5 text-xs opacity-70">
                          ({getClientQuotations(selectedClient.id).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {detailTab === "info" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem
                        icon={<Mail className="w-4 h-4 text-primary-500" />}
                        label="Email"
                        value={selectedClient.email}
                      />
                      <InfoItem
                        icon={<Phone className="w-4 h-4 text-emerald-500" />}
                        label="Teléfono"
                        value={selectedClient.phone}
                      />
                      <InfoItem
                        icon={<MapPin className="w-4 h-4 text-rose-500" />}
                        label="Dirección"
                        value={selectedClient.address}
                      />
                      <InfoItem
                        icon={<Building className="w-4 h-4 text-blue-500" />}
                        label="Ciudad"
                        value={selectedClient.city}
                      />
                      {selectedClient.company && (
                        <InfoItem
                          icon={<Building className="w-4 h-4 text-violet-500" />}
                          label="Empresa"
                          value={selectedClient.company}
                        />
                      )}
                      <InfoItem
                        icon={<Calendar className="w-4 h-4 text-amber-500" />}
                        label="Fecha de Creación"
                        value={formatDate(selectedClient.createdAt)}
                      />
                    </div>

                    {selectedClient.notes && (
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-2">
                          Notas
                        </h3>
                        <div className="card-static p-4">
                          <p className="text-sm text-text-secondary whitespace-pre-wrap">
                            {selectedClient.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedClient.active ? "bg-emerald-400" : "bg-gray-300"
                        }`}
                      />
                      <span className="text-sm text-text-secondary">
                        {selectedClient.active ? "Cliente Activo" : "Cliente Inactivo"}
                      </span>
                    </div>
                  </div>
                )}

                {detailTab === "tickets" && (
                  <div className="space-y-3">
                    {getClientTickets(selectedClient.id).length === 0 ? (
                      <div className="text-center py-8">
                        <Ticket className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                        <p className="text-sm text-text-tertiary">
                          No hay tickets para este cliente
                        </p>
                      </div>
                    ) : (
                      getClientTickets(selectedClient.id).map((ticket) => (
                        <div key={ticket.id} className="card-static p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-primary-600">
                                  {ticket.id}
                                </span>
                                <span className={`chip chip-${ticket.status}`}>
                                  {statusLabels[ticket.status]}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-text-primary">
                                {ticket.title}
                              </p>
                            </div>
                            <span className="text-xs text-text-tertiary">
                              {formatDate(ticket.scheduledDate)}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary line-clamp-2">
                            {ticket.description}
                          </p>
                          {ticket.technicianName && (
                            <p className="text-xs text-text-tertiary mt-2">
                              Técnico: {ticket.technicianName}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {detailTab === "quotations" && (
                  <div className="space-y-3">
                    {getClientQuotations(selectedClient.id).length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                        <p className="text-sm text-text-tertiary">
                          No hay cotizaciones para este cliente
                        </p>
                      </div>
                    ) : (
                      getClientQuotations(selectedClient.id).map((q) => (
                        <div key={q.id} className="card-static p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-primary-600">
                                  {q.number}
                                </span>
                                <span
                                  className={`chip ${
                                    q.status === "aprobada"
                                      ? "chip-completado"
                                      : q.status === "rechazada"
                                        ? "chip-cancelado"
                                        : q.status === "enviada"
                                          ? "chip-scheduled"
                                          : "chip-pending"
                                  }`}
                                >
                                  {quotationStatusLabels[q.status]}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-text-primary">
                                {q.title}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-text-primary">
                              {formatCurrency(q.total)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-text-tertiary mt-2">
                            <span>{q.items.length} items</span>
                            <span>Válido hasta: {formatDate(q.validUntil)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
                <button
                  className="btn-secondary"
                  onClick={() => openEditClient(selectedClient)}
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button className="btn-primary" onClick={closeDetail}>
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New/Edit Client Modal */}
      <AnimatePresence>
        {clientModalOpen.open && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeModal("newClient")}
          >
            <motion.div
              className="modal-content max-w-lg p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
                </h2>
                <button
                  className="btn-ghost p-1"
                  onClick={() => closeModal("newClient")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <FormField label="Nombre *">
                  <input
                    className="input-field"
                    placeholder="Nombre del cliente"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Email *">
                    <input
                      type="email"
                      className="input-field"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Teléfono *">
                    <input
                      className="input-field"
                      placeholder="81-1234-5678"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Empresa">
                  <input
                    className="input-field"
                    placeholder="Nombre de la empresa (opcional)"
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Dirección *">
                  <input
                    className="input-field"
                    placeholder="Dirección completa"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Ciudad *">
                  <input
                    className="input-field"
                    placeholder="Ciudad"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </FormField>

                <FormField label="Notas">
                  <textarea
                    className="input-field min-h-[80px] resize-none"
                    placeholder="Notas sobre el cliente..."
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </FormField>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-secondary">
                    Cliente Activo
                  </label>
                  <button
                    type="button"
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.active ? "bg-primary-500" : "bg-gray-300"
                    }`}
                    onClick={() => setForm({ ...form, active: !form.active })}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        form.active ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
                <button
                  className="btn-secondary"
                  onClick={() => closeModal("newClient")}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSaveClient}
                  disabled={!form.name || !form.email || !form.phone || !form.address || !form.city}
                >
                  <Plus className="w-4 h-4" />
                  {editingClient ? "Guardar Cambios" : "Crear Cliente"}
                </button>
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
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Eliminar Cliente
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                ¿Estás seguro de que deseas eliminar este cliente? El cliente será
                marcado como inactivo.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="btn-secondary"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteClient(confirmDelete)}
                >
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

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-text-tertiary uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
