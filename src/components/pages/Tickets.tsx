"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { serviceTypes } from "@/lib/data";
import { formatDate, formatDateTime, getInitials, generateId } from "@/lib/utils";
import type { Ticket, TicketStatus, TicketNote } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Calendar,
  ArrowUpDown,
  Download,
  FileText,
  Image as ImageIcon,
  PenLine,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  CircleDot,
  Circle,
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

const priorityLabels = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

type SortField = "id" | "title" | "clientName" | "technicianName" | "status" | "priority" | "scheduledDate";
type SortDir = "asc" | "desc";

const ROWS_PER_PAGE = 6;

function buildTimeline(ticket: Ticket) {
  const events: { time: string; label: string; icon: React.ReactNode; color: string }[] = [];
  events.push({
    time: ticket.createdAt,
    label: "Ticket creado",
    icon: <Circle className="w-4 h-4" />,
    color: "text-gray-400",
  });
  if (ticket.startedAt) {
    events.push({
      time: ticket.startedAt,
      label: "Trabajo iniciado",
      icon: <PlayCircle className="w-4 h-4" />,
      color: "text-green-500",
    });
  }
  if (ticket.pausedAt) {
    events.push({
      time: ticket.pausedAt,
      label: "Trabajo pausado",
      icon: <PauseCircle className="w-4 h-4" />,
      color: "text-pink-500",
    });
  }
  if (ticket.completedAt) {
    events.push({
      time: ticket.completedAt,
      label: "Trabajo completado",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-emerald-600",
    });
  }
  return events;
}

export default function TicketsPage() {
  const {
    tickets,
    clients,
    technicians,
    ticketFilters,
    setTicketFilters,
    resetTicketFilters,
    openModal,
    closeModal,
    modals,
    addTicket,
    updateTicket,
    deleteTicket,
  } = useAppStore();

  const [sortField, setSortField] = useState<SortField>("scheduledDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const newTicketModal = modals["newTicket"] || { open: false };

  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [statusChangeTicket, setStatusChangeTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState<TicketStatus>("pending");
  const [noteTicket, setNoteTicket] = useState<Ticket | null>(null);
  const [noteContent, setNoteContent] = useState("");

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

  const hasActiveFilters =
    ticketFilters.search ||
    ticketFilters.status ||
    ticketFilters.technician ||
    ticketFilters.client ||
    ticketFilters.priority ||
    ticketFilters.dateFrom ||
    ticketFilters.dateTo;

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (ticketFilters.search) {
      const q = ticketFilters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.clientName.toLowerCase().includes(q) ||
          (t.technicianName && t.technicianName.toLowerCase().includes(q))
      );
    }
    if (ticketFilters.status) {
      result = result.filter((t) => t.status === ticketFilters.status);
    }
    if (ticketFilters.technician) {
      result = result.filter((t) => t.technicianId === ticketFilters.technician);
    }
    if (ticketFilters.client) {
      result = result.filter((t) => t.clientId === ticketFilters.client);
    }
    if (ticketFilters.priority) {
      result = result.filter((t) => t.priority === ticketFilters.priority);
    }
    if (ticketFilters.dateFrom) {
      result = result.filter((t) => t.scheduledDate >= ticketFilters.dateFrom);
    }
    if (ticketFilters.dateTo) {
      result = result.filter((t) => t.scheduledDate <= ticketFilters.dateTo);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "id":
          cmp = a.id.localeCompare(b.id);
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "clientName":
          cmp = a.clientName.localeCompare(b.clientName);
          break;
        case "technicianName":
          cmp = (a.technicianName || "Sin asignar").localeCompare(b.technicianName || "Sin asignar");
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "priority": {
          const order = { urgente: 0, alta: 1, media: 2, baja: 3 };
          cmp = order[a.priority] - order[b.priority];
          break;
        }
        case "scheduledDate":
          cmp = a.scheduledDate.localeCompare(b.scheduledDate);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tickets, ticketFilters, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ROWS_PER_PAGE));
  const pagedTickets = filteredTickets.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const stats = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter((t) => t.status === "pending" || t.status === "scheduled").length;
    const inProgress = tickets.filter((t) => ["en_camino", "iniciado", "pausado"].includes(t.status)).length;
    const completed = tickets.filter((t) => t.status === "completado").length;
    return { total, pending, inProgress, completed };
  }, [tickets]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTicketFilters({ [key]: value });
    setPage(1);
  };

  const handleClearFilters = () => {
    resetTicketFilters();
    setPage(1);
  };

  const openTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailOpen(true);
  };

  const closeTicketDetail = () => {
    setDetailOpen(false);
    setTimeout(() => setSelectedTicket(null), 300);
  };

  const handleOpenNewTicket = () => {
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
    openModal("newTicket");
  };

  const handleCreateTicket = () => {
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
    closeModal("newTicket");
  };

  const handleOpenEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setForm({
      title: ticket.title,
      description: ticket.description,
      clientId: ticket.clientId,
      technicianId: ticket.technicianId || "",
      serviceType: ticket.serviceType,
      priority: ticket.priority,
      scheduledDate: ticket.scheduledDate,
      scheduledTime: ticket.scheduledTime,
      estimatedDuration: ticket.estimatedDuration,
      location: ticket.location,
      notes: "",
    });
    openModal("editTicket");
  };

  const handleEditTicket = () => {
    if (!editingTicket) return;
    const client = clients.find((c) => c.id === form.clientId);
    const tech = technicians.find((t) => t.id === form.technicianId);
    updateTicket(editingTicket.id, {
      title: form.title,
      description: form.description,
      clientId: form.clientId,
      clientName: client?.name || "",
      technicianId: form.technicianId || undefined,
      technicianName: tech?.name || undefined,
      serviceType: form.serviceType,
      priority: form.priority,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      estimatedDuration: form.estimatedDuration,
      location: form.location,
    });
    closeModal("editTicket");
    setEditingTicket(null);
    if (selectedTicket?.id === editingTicket.id) {
      const updated = tickets.find((t) => t.id === editingTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  const handleStatusChange = (ticket: Ticket, status: TicketStatus) => {
    const now = new Date().toISOString();
    const updates: Partial<Ticket> = { status };
    if (status === "iniciado") updates.startedAt = now;
    if (status === "pausado") updates.pausedAt = now;
    if (status === "completado") updates.completedAt = now;
    updateTicket(ticket.id, updates);
    setStatusChangeTicket(null);
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket({ ...ticket, ...updates });
    }
  };

  const handleAddNote = (ticket: Ticket) => {
    if (!noteContent.trim()) return;
    const now = new Date().toISOString();
    const newNote = {
      id: generateId(),
      content: noteContent.trim(),
      author: "María López",
      authorRole: "admin" as const,
      createdAt: now,
      isInternal: false,
    };
    updateTicket(ticket.id, {
      notes: [...ticket.notes, newNote],
    });
    setNoteContent("");
    setNoteTicket(null);
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket({ ...ticket, notes: [...ticket.notes, newNote] });
    }
  };

  const handleDownloadPdf = (ticket: Ticket) => {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(29, 78, 216);
      doc.text("JETrack - Field Service", 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Reporte de Ticket", 20, 28);
      doc.setDrawColor(29, 78, 216);
      doc.line(20, 32, 190, 32);
      let y = 42;
      const addLine = (label: string, value: string) => {
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(label, 20, y);
        doc.setTextColor(30);
        doc.text(value, 70, y);
        y += 8;
      };
      addLine("ID:", ticket.id);
      addLine("Título:", ticket.title);
      addLine("Descripción:", ticket.description);
      addLine("Estado:", statusLabels[ticket.status]);
      addLine("Prioridad:", priorityLabels[ticket.priority]);
      addLine("Cliente:", ticket.clientName);
      addLine("Técnico:", ticket.technicianName || "Sin asignar");
      addLine("Tipo de Servicio:", ticket.serviceType);
      addLine("Ubicación:", ticket.location);
      addLine("Fecha Programada:", `${ticket.scheduledDate} ${ticket.scheduledTime}`);
      addLine("Duración Estimada:", `${ticket.estimatedDuration} min`);
      addLine("Creado:", formatDateTime(ticket.createdAt));
      if (ticket.completedAt) addLine("Completado:", formatDateTime(ticket.completedAt));
      y += 5;
      if (ticket.notes.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text("Notas:", 20, y);
        y += 8;
        ticket.notes.forEach((note) => {
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(`[${note.author}] ${note.content}`, 20, y);
          y += 6;
        });
      }
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Generado el ${new Date().toLocaleDateString("es-MX")}`, 20, 280);
      doc.save(`ticket_${ticket.id}.pdf`);
    });
  };

  const handleDeleteTicket = (id: string) => {
    deleteTicket(id);
    setConfirmDelete(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-3.5 h-3.5 inline-block ml-1 ${
        sortField === field ? "text-primary-500" : "text-gray-300"
      }`}
    />
  );

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-text-primary">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              className="input-field pl-10"
              value={ticketFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          {/* Status */}
          <select
            className="select-field"
            value={ticketFilters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          {/* Technician */}
          <select
            className="select-field"
            value={ticketFilters.technician}
            onChange={(e) => handleFilterChange("technician", e.target.value)}
          >
            <option value="">Todos los técnicos</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {/* Client */}
          <select
            className="select-field"
            value={ticketFilters.client}
            onChange={(e) => handleFilterChange("client", e.target.value)}
          >
            <option value="">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {/* Priority */}
          <select
            className="select-field"
            value={ticketFilters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            {Object.entries(priorityLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          {/* Date From */}
          <input
            type="date"
            className="input-field"
            value={ticketFilters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            placeholder="Fecha desde"
          />
          {/* Date To */}
          <input
            type="date"
            className="input-field"
            value={ticketFilters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            placeholder="Fecha hasta"
          />
          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasActiveFilters && (
              <button className="btn-ghost text-danger flex items-center gap-1" onClick={handleClearFilters}>
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
            <button className="btn-primary ml-auto" onClick={handleOpenNewTicket}>
              <Plus className="w-4 h-4" />
              Nuevo Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-xs text-text-secondary">Total</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.pending}</p>
            <p className="text-xs text-text-secondary">Pendientes</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <CircleDot className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.inProgress}</p>
            <p className="text-xs text-text-secondary">En Progreso</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.completed}</p>
            <p className="text-xs text-text-secondary">Completados</p>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card-static overflow-hidden">
        {pagedTickets.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No se encontraron tickets</p>
            <p className="text-text-tertiary text-sm mt-1">
              {hasActiveFilters ? "Intenta ajustar los filtros de búsqueda" : "Crea tu primer ticket para comenzar"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {(
                      [
                        ["id", "ID"],
                        ["title", "Título"],
                        ["clientName", "Cliente"],
                        ["technicianName", "Técnico"],
                        ["status", "Estado"],
                        ["priority", "Prioridad"],
                        ["scheduledDate", "Fecha"],
                      ] as [SortField, string][]
                    ).map(([field, label]) => (
                      <th
                        key={field}
                        className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-primary-500 transition-colors"
                        onClick={() => handleSort(field)}
                      >
                        {label}
                        <SortIcon field={field} />
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {pagedTickets.map((ticket, i) => (
                      <motion.tr
                        key={ticket.id}
                        className="table-row border-b border-border-light last:border-0"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-bold text-primary-600">{ticket.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">
                            {ticket.title}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-primary-600">
                                {getInitials(ticket.clientName)}
                              </span>
                            </div>
                            <span className="text-sm text-text-secondary truncate max-w-[150px]">
                              {ticket.clientName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {ticket.technicianName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-emerald-600">
                                  {getInitials(ticket.technicianName)}
                                </span>
                              </div>
                              <span className="text-sm text-text-secondary truncate max-w-[150px]">
                                {ticket.technicianName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-text-tertiary italic">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`chip chip-${ticket.status}`}>
                            {statusLabels[ticket.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`chip priority-${ticket.priority}`}>
                            {priorityLabels[ticket.priority]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-secondary">{formatDate(ticket.scheduledDate)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="btn-ghost p-1.5"
                              title="Ver detalles"
                              onClick={() => openTicketDetail(ticket)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="btn-ghost p-1.5"
                              title="Editar"
                              onClick={() => handleOpenEditTicket(ticket)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="btn-ghost p-1.5 text-danger hover:bg-red-50"
                              title="Eliminar"
                              onClick={() => setConfirmDelete(ticket.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-text-secondary">
                Mostrando {(page - 1) * ROWS_PER_PAGE + 1}
                {" - "}
                {Math.min(page * ROWS_PER_PAGE, filteredTickets.length)} de {filteredTickets.length} tickets
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="btn-ghost p-2"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-primary-500 text-white"
                        : "text-text-secondary hover:bg-surface-tertiary"
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn-ghost p-2"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

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
              <h3 className="text-lg font-bold text-text-primary mb-2">Eliminar Ticket</h3>
              <p className="text-sm text-text-secondary mb-6">
                ¿Estás seguro de que deseas eliminar el ticket{" "}
                <strong>{confirmDelete}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
                <button className="btn-danger" onClick={() => handleDeleteTicket(confirmDelete)}>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Panel */}
      <AnimatePresence>
        {detailOpen && selectedTicket && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeTicketDetail} />
            <motion.div
              className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 border-b border-border px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center gap-2 sm:gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-primary-600">{selectedTicket.id}</span>
                  <span className={`chip chip-${selectedTicket.status}`}>
                    {statusLabels[selectedTicket.status]}
                  </span>
                  <span className={`chip priority-${selectedTicket.priority}`}>
                    {priorityLabels[selectedTicket.priority]}
                  </span>
                </div>
                <button className="btn-ghost p-2" onClick={closeTicketDetail}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{selectedTicket.title}</h2>
                  <p className="text-sm text-text-secondary mt-1">{selectedTicket.description}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<User className="w-4 h-4 text-primary-500" />}
                    label="Cliente"
                    value={selectedTicket.clientName}
                  />
                  <InfoItem
                    icon={<User className="w-4 h-4 text-emerald-500" />}
                    label="Técnico"
                    value={selectedTicket.technicianName || "Sin asignar"}
                  />
                  <InfoItem
                    icon={<FileText className="w-4 h-4 text-blue-500" />}
                    label="Servicio"
                    value={selectedTicket.serviceType}
                  />
                  <InfoItem
                    icon={<MapPin className="w-4 h-4 text-rose-500" />}
                    label="Ubicación"
                    value={selectedTicket.location}
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4 text-violet-500" />}
                    label="Fecha Programada"
                    value={`${formatDate(selectedTicket.scheduledDate)} a las ${selectedTicket.scheduledTime}`}
                  />
                  <InfoItem
                    icon={<Clock className="w-4 h-4 text-amber-500" />}
                    label="Duración Estimada"
                    value={`${selectedTicket.estimatedDuration} min`}
                  />
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
                    Cronología
                  </h3>
                  <div className="space-y-3">
                    {buildTimeline(selectedTicket).map((event, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={event.color}>{event.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{event.label}</p>
                          <p className="text-xs text-text-tertiary">{formatDateTime(event.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
                    Fotos ({selectedTicket.photos.length})
                  </h3>
                  {selectedTicket.photos.length === 0 ? (
                    <p className="text-sm text-text-tertiary italic">No hay fotos registradas</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedTicket.photos.map((photo) => (
                        <div key={photo.id} className="card-static p-2">
                          <div className="aspect-video bg-surface-tertiary rounded-lg flex items-center justify-center mb-1">
                            <ImageIcon className="w-6 h-6 text-text-tertiary" />
                          </div>
                          <p className="text-xs font-medium text-text-secondary capitalize">{photo.type}</p>
                          {photo.caption && (
                            <p className="text-xs text-text-tertiary">{photo.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
                    Notas ({selectedTicket.notes.length})
                  </h3>
                  {selectedTicket.notes.length === 0 ? (
                    <p className="text-sm text-text-tertiary italic">No hay notas</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTicket.notes.map((note) => (
                        <div key={note.id} className="card-static p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-text-primary">{note.author}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-tertiary text-text-tertiary">
                              {note.authorRole}
                            </span>
                            {note.isInternal && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                Interno
                              </span>
                            )}
                            <span className="text-xs text-text-tertiary ml-auto">
                              {formatDateTime(note.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Signature */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
                    Firma
                  </h3>
                  {selectedTicket.signature ? (
                    <div className="card-static p-3 text-center">
                      <div className="h-20 bg-surface-tertiary rounded-lg flex items-center justify-center">
                        <PenLine className="w-6 h-6 text-text-tertiary" />
                      </div>
                      <p className="text-xs text-text-tertiary mt-1">Firma capturada</p>
                    </div>
                  ) : (
                    <div className="card-static p-4 text-center border-dashed border-2 border-border">
                      <PenLine className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                      <p className="text-sm text-text-tertiary">Sin firma</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t border-border px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={() => { setStatusChangeTicket(selectedTicket); setNewStatus(selectedTicket.status); }}>
                  <CircleDot className="w-4 h-4" />
                  Cambiar Estado
                </button>
                <button className="btn-secondary" onClick={() => setNoteTicket(selectedTicket)}>
                  <PenLine className="w-4 h-4" />
                  Agregar Nota
                </button>
                <button className="btn-secondary" onClick={() => handleDownloadPdf(selectedTicket)}>
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
                <button className="btn-primary ml-auto" onClick={closeTicketDetail}>
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Ticket Modal */}
      <AnimatePresence>
        {modals["editTicket"]?.open && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { closeModal("editTicket"); setEditingTicket(null); }}
          >
            <motion.div
              className="modal-content max-w-lg p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-text-primary">Editar Ticket</h2>
                <button className="btn-ghost p-1" onClick={() => { closeModal("editTicket"); setEditingTicket(null); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <FormField label="Título">
                  <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </FormField>
                <FormField label="Descripción">
                  <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Cliente">
                    <select className="select-field" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                      <option value="">Seleccionar cliente</option>
                      {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </FormField>
                  <FormField label="Técnico">
                    <select className="select-field" value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })}>
                      <option value="">Sin asignar</option>
                      {technicians.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Tipo de Servicio">
                    <select className="select-field" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                      <option value="">Seleccionar servicio</option>
                      {serviceTypes.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </FormField>
                  <FormField label="Prioridad">
                    <select className="select-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Ticket["priority"] })}>
                      {Object.entries(priorityLabels).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
                    </select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Fecha Programada">
                    <input type="date" className="input-field" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
                  </FormField>
                  <FormField label="Hora Programada">
                    <input type="time" className="input-field" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} />
                  </FormField>
                </div>
                <FormField label="Duración Estimada (minutos)">
                  <input type="number" className="input-field" min={15} step={15} value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })} />
                </FormField>
                <FormField label="Ubicación">
                  <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </FormField>
              </div>
              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
                <button className="btn-secondary" onClick={() => { closeModal("editTicket"); setEditingTicket(null); }}>Cancelar</button>
                <button className="btn-primary" onClick={handleEditTicket}>
                  <Pencil className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      <AnimatePresence>
        {statusChangeTicket && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStatusChangeTicket(null)}
          >
            <motion.div
              className="modal-content max-w-sm p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-primary mb-2">Cambiar Estado</h3>
              <p className="text-sm text-text-secondary mb-4">
                Ticket <strong>{statusChangeTicket.id}</strong> — {statusChangeTicket.title}
              </p>
              <div className="space-y-2 mb-6">
                {(Object.entries(statusLabels) as [TicketStatus, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => handleStatusChange(statusChangeTicket, val)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      statusChangeTicket.status === val
                        ? "bg-primary-100 text-primary-700 ring-2 ring-primary-300"
                        : "hover:bg-surface-tertiary text-text-secondary"
                    }`}
                  >
                    <span className={`chip chip-${val} mr-2`}>{label}</span>
                    {statusChangeTicket.status === val && <span className="text-xs text-primary-500">(actual)</span>}
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button className="btn-secondary" onClick={() => setStatusChangeTicket(null)}>Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Note Modal */}
      <AnimatePresence>
        {noteTicket && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setNoteTicket(null); setNoteContent(""); }}
          >
            <motion.div
              className="modal-content max-w-sm p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-primary mb-2">Agregar Nota</h3>
              <p className="text-sm text-text-secondary mb-4">
                Ticket <strong>{noteTicket.id}</strong>
              </p>
              <textarea
                className="input-field min-h-[100px] resize-none mb-4"
                placeholder="Escribe una nota..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => { setNoteTicket(null); setNoteContent(""); }}>Cancelar</button>
                <button className="btn-primary" onClick={() => handleAddNote(noteTicket)} disabled={!noteContent.trim()}>
                  <PenLine className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-text-tertiary uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}
