"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Download,
  FileText,
  Send,
  Check,
  X,
  Printer,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Wrench,
  Clock,
  TrendingUp,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  generateId,
} from "@/lib/utils";
import type {
  Quotation,
  QuotationItem,
  QuotationStatus,
  Client,
} from "@/lib/types";

const statusLabels: Record<QuotationStatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  facturada: "Facturada",
};

const statusColors: Record<QuotationStatus, { bg: string; text: string; border: string }> = {
  borrador: { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" },
  enviada: { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" },
  aprobada: { bg: "#d1fae5", text: "#059669", border: "#a7f3d0" },
  rechazada: { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" },
  facturada: { bg: "#f3e8ff", text: "#7c3aed", border: "#ddd6fe" },
};

type FilterTab = "todas" | QuotationStatus;

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "borrador", label: "Borrador" },
  { id: "enviada", label: "Enviada" },
  { id: "aprobada", label: "Aprobada" },
  { id: "rechazada", label: "Rechazada" },
];

export default function Quotations() {
  const { quotations, clients, addQuotation, updateQuotation, deleteQuotation } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [pdfQuotation, setPdfQuotation] = useState<Quotation | null>(null);

  const filteredQuotations = useMemo(() => {
    let result = quotations;
    if (activeFilter !== "todas") {
      result = result.filter((q) => q.status === activeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.number.toLowerCase().includes(query) ||
          q.title.toLowerCase().includes(query) ||
          q.clientName.toLowerCase().includes(query)
      );
    }
    return result;
  }, [quotations, activeFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = quotations.length;
    const pending = quotations.filter(
      (q) => q.status === "borrador" || q.status === "enviada"
    ).length;
    const approved = quotations.filter((q) => q.status === "aprobada");
    const approvedTotal = approved.reduce((sum, q) => sum + q.total, 0);
    return { total, pending, approvedCount: approved.length, approvedTotal };
  }, [quotations]);

  const handleViewDetail = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailModal(true);
  };

  const handleStatusChange = (id: string, newStatus: QuotationStatus) => {
    updateQuotation(id, {
      status: newStatus,
      approvedAt: newStatus === "aprobada" ? new Date().toISOString() : undefined,
    });
    setShowDetailModal(false);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setShowDetailModal(false);
    setShowNewModal(true);
  };

  const handleDelete = (id: string) => {
    deleteQuotation(id);
    setShowDetailModal(false);
    setConfirmDelete(null);
  };

  const handleViewPdf = (quotation: Quotation) => {
    setPdfQuotation(quotation);
    setShowPdfModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Cotizaciones
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Gestiona las cotizaciones de tus clientes
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary"
        >
          <Plus size={18} />
          Nueva Cotización
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === tab.id
                  ? "bg-[var(--color-primary-500)] text-white shadow-md"
                  : "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          />
          <input
            type="text"
            placeholder="Buscar cotización..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 sm:w-64"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-static p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-info-light)]">
              <FileText size={20} className="text-[var(--color-info)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                Total Cotizaciones
              </p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {stats.total}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-static p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-warning-light)]">
              <Clock size={20} className="text-[var(--color-warning)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                Pendientes
              </p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {stats.pending}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-static p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success-light)]">
              <Check size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                Aprobadas
              </p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {stats.approvedCount}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-static p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success-light)]">
              <TrendingUp size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                Ingresos Potenciales
              </p>
              <p className="text-xl font-bold text-[var(--color-success)]">
                {formatCurrency(stats.approvedTotal)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quotations List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredQuotations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-static flex flex-col items-center justify-center py-16"
            >
              <FileText size={48} className="text-[var(--color-text-tertiary)] mb-3" />
              <p className="text-lg font-semibold text-[var(--color-text-secondary)]">
                No se encontraron cotizaciones
              </p>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {searchQuery
                  ? "Intenta con otros términos de búsqueda"
                  : "Crea una nueva cotización para comenzar"}
              </p>
            </motion.div>
          ) : (
            filteredQuotations.map((quotation, index) => (
              <motion.div
                key={quotation.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
                className="card p-5 cursor-pointer"
                onClick={() => handleViewDetail(quotation)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono font-semibold text-[var(--color-text-tertiary)]">
                        {quotation.number}
                      </span>
                      <span
                        className="chip"
                        style={{
                          backgroundColor: statusColors[quotation.status].bg,
                          color: statusColors[quotation.status].text,
                          border: `1px solid ${statusColors[quotation.status].border}`,
                        }}
                      >
                        {statusLabels[quotation.status]}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1 truncate">
                      {quotation.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {quotation.clientName}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Creada: {formatDate(quotation.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Vence: {formatDate(quotation.validUntil)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                      {formatCurrency(quotation.total)}
                    </p>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewDetail(quotation)}
                        className="btn-ghost p-2"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDetail(quotation)}
                        className="btn-ghost p-2"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleViewPdf(quotation)}
                        className="btn-ghost p-2"
                        title="Descargar PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(quotation.id)}
                        className="btn-ghost p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedQuotation && (
          <QuotationDetailModal
            quotation={selectedQuotation}
            onClose={() => setShowDetailModal(false)}
            onStatusChange={handleStatusChange}
            onViewPdf={handleViewPdf}
            onEdit={handleEditQuotation}
          />
        )}
      </AnimatePresence>

      {/* New Quotation Modal */}
      <AnimatePresence>
        {showNewModal && (
          <NewQuotationModal
            clients={clients}
            quotations={quotations}
            onClose={() => { setShowNewModal(false); setEditingQuotation(null); }}
            editingQuotation={editingQuotation}
            onSave={(q) => {
              if (editingQuotation) {
                updateQuotation(editingQuotation.id, q);
              } else {
                addQuotation(q);
              }
              setShowNewModal(false);
              setEditingQuotation(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* PDF / Print Modal */}
      <AnimatePresence>
        {showPdfModal && pdfQuotation && (
          <PdfModal
            quotation={pdfQuotation}
            onClose={() => setShowPdfModal(false)}
            onPrint={handlePrint}
          />
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
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Eliminar Cotización</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                ¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
                <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>
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

/* ──────────── Detail Modal ──────────── */

function QuotationDetailModal({
  quotation,
  onClose,
  onStatusChange,
  onViewPdf,
  onEdit,
}: {
  quotation: Quotation;
  onClose: () => void;
  onStatusChange: (id: string, status: QuotationStatus) => void;
  onViewPdf: (q: Quotation) => void;
  onEdit: (q: Quotation) => void;
}) {
  const sc = statusColors[quotation.status];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content max-w-3xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono font-bold text-[var(--color-text-tertiary)]">
                {quotation.number}
              </span>
              <span
                className="chip"
                style={{
                  backgroundColor: sc.bg,
                  color: sc.text,
                  border: `1px solid ${sc.border}`,
                }}
              >
                {statusLabels[quotation.status]}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {quotation.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--color-border)] p-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[var(--color-text-tertiary)]">Cliente:</span>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {quotation.clientName}
                </p>
              </div>
              {quotation.technicianName && (
                <div>
                  <span className="text-[var(--color-text-tertiary)]">Técnico:</span>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {quotation.technicianName}
                  </p>
                </div>
              )}
              <div>
                <span className="text-[var(--color-text-tertiary)]">Creada:</span>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {formatDateTime(quotation.createdAt)}
                </p>
              </div>
              <div>
                <span className="text-[var(--color-text-tertiary)]">Válido hasta:</span>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {formatDate(quotation.validUntil)}
                </p>
              </div>
              {quotation.ticketId && (
                <div>
                  <span className="text-[var(--color-text-tertiary)]">Ticket vinculado:</span>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {quotation.ticketId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
              Conceptos
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
                    <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)]">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-[var(--color-text-secondary)]">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)]">
                      Precio Unitario
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--color-border-light)] last:border-0"
                    >
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--color-text-primary)]">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-primary)]">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Subtotal:</span>
                <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">IVA (16%):</span>
                <span className="font-medium">{formatCurrency(quotation.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold">
                <span className="text-[var(--color-text-primary)]">Total:</span>
                <span className="text-[var(--color-primary-500)]">
                  {formatCurrency(quotation.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                Notas
              </h3>
              <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
                {quotation.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] px-6 py-4">
          {quotation.status === "borrador" && (
            <>
              <button
                onClick={() => onStatusChange(quotation.id, "enviada")}
                className="btn-primary"
              >
                <Send size={16} />
                Enviar
              </button>
              <button onClick={() => onEdit(quotation)} className="btn-secondary">
                <Pencil size={16} />
                Editar
              </button>
              <button
                onClick={() => onStatusChange(quotation.id, "rechazada")}
                className="btn-danger"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </>
          )}
          {quotation.status === "enviada" && (
            <>
              <button
                onClick={() => onStatusChange(quotation.id, "aprobada")}
                className="btn-primary"
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
                }}
              >
                <Check size={16} />
                Aprobar
              </button>
              <button
                onClick={() => onStatusChange(quotation.id, "rechazada")}
                className="btn-danger"
              >
                <X size={16} />
                Rechazar
              </button>
            </>
          )}
          {quotation.status === "aprobada" && (
            <>
              <button
                onClick={() => onViewPdf(quotation)}
                className="btn-primary"
              >
                <Download size={16} />
                Descargar PDF
              </button>
              <button
                onClick={() => onStatusChange(quotation.id, "facturada")}
                className="btn-primary"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
                }}
              >
                <FileText size={16} />
                Facturar
              </button>
            </>
          )}
          {quotation.status === "rechazada" && (
            <p className="text-sm text-[var(--color-text-tertiary)] italic">
              Esta cotización fue rechazada.
            </p>
          )}
          {quotation.status === "facturada" && (
            <p className="text-sm text-[var(--color-text-tertiary)] italic">
              Esta cotización ya fue facturada.
            </p>
          )}
          <div className="ml-auto">
            <button onClick={onClose} className="btn-ghost">
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────── New Quotation Modal ──────────── */

function NewQuotationModal({
  clients,
  quotations,
  onClose,
  onSave,
  editingQuotation,
}: {
  clients: Client[];
  quotations: Quotation[];
  onClose: () => void;
  onSave: (q: Quotation) => void;
  editingQuotation?: Quotation | null;
}) {
  const [title, setTitle] = useState(editingQuotation?.title || "");
  const [clientId, setClientId] = useState(editingQuotation?.clientId || "");
  const [ticketId, setTicketId] = useState(editingQuotation?.ticketId || "");
  const [notes, setNotes] = useState(editingQuotation?.notes || "");
  const [validUntil, setValidUntil] = useState(editingQuotation?.validUntil || "");
  const [items, setItems] = useState<QuotationItem[]>(
    editingQuotation?.items || [
      { id: generateId(), description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]
  );

  const nextNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const count = quotations.filter(
      (q: Quotation) => q.number.startsWith(`COT-${year}`)
    ).length;
    return `COT-${year}-${String(count + 1).padStart(3, "0")}`;
  }, [quotations]);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: generateId(), description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    if (!title || !clientId || !validUntil || items.every((i) => !i.description)) return;
    const client = clients.find((c: Client) => c.id === clientId);
    if (editingQuotation) {
      const updated: Quotation = {
        ...editingQuotation,
        title,
        clientId,
        clientName: client?.name || "",
        items,
        subtotal,
        tax,
        total,
        validUntil,
        notes: notes || undefined,
        ticketId: ticketId || undefined,
        updatedAt: new Date().toISOString(),
      };
      onSave(updated);
    } else {
      const quotation: Quotation = {
        id: `Q-${generateId()}`,
        number: nextNumber,
        title,
        status: "borrador",
        clientId,
        clientName: client?.name || "",
        items,
        subtotal,
        tax,
        total,
        validUntil,
        notes: notes || undefined,
        ticketId: ticketId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(quotation);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content max-w-3xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              {editingQuotation ? "Editar Cotización" : "Nueva Cotización"}
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              {editingQuotation ? editingQuotation.number : nextNumber}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Instalación sistema eléctrico"
              className="input-field"
            />
          </div>

          {/* Client + Ticket */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                Cliente *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="select-field"
              >
                <option value="">Seleccionar cliente...</option>
                {clients.filter((c: Client) => c.active).map((c: Client) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                Ticket vinculado (opcional)
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="TK-001"
                className="input-field"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                Conceptos
              </label>
              <button onClick={addItem} className="btn-ghost text-xs">
                <Plus size={14} />
                Agregar Concepto
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] p-4 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 min-w-0">
                    <label className="mb-1 block text-xs text-[var(--color-text-tertiary)]">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Descripción del concepto"
                      className="input-field"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="mb-1 block text-xs text-[var(--color-text-tertiary)]">
                      Cant.
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", Number(e.target.value))
                      }
                      className="input-field text-center"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="mb-1 block text-xs text-[var(--color-text-tertiary)]">
                      Precio Unit.
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, "unitPrice", Number(e.target.value))
                      }
                      className="input-field text-right"
                    />
                  </div>
                  <div className="w-full sm:w-32 text-right">
                    <label className="mb-1 block text-xs text-[var(--color-text-tertiary)]">
                      Total
                    </label>
                    <p className="py-2.5 text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="btn-ghost p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals Preview */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">IVA (16%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold">
                <span>Total:</span>
                <span className="text-[var(--color-primary-500)]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes + Valid Until */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Notas adicionales..."
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                Válido hasta *
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !clientId || !validUntil}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={16} />
            {editingQuotation ? "Guardar Cambios" : "Crear Cotización"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────── PDF / Print Modal ──────────── */

function PdfModal({
  quotation,
  onClose,
  onPrint,
}: {
  quotation: Quotation;
  onClose: () => void;
  onPrint: () => void;
}) {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content max-w-4xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 print:hidden">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Vista Previa - PDF
          </h2>
          <div className="flex gap-2">
            <button onClick={onPrint} className="btn-primary">
              <Printer size={16} />
              Imprimir
            </button>
            <button onClick={onClose} className="btn-ghost p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="p-6 print:p-0">
          <div
            className="mx-auto max-w-2xl rounded-xl border border-[var(--color-border)] bg-white p-8 shadow-sm print:border-0 print:shadow-none print:p-0"
            id="quotation-print"
          >
            {/* Company Header */}
            <div className="flex items-start justify-between border-b-2 border-[var(--color-primary-500)] pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-primary-500)] flex items-center justify-center">
                    <Wrench size={18} className="text-white" />
                  </div>
                  <span className="text-xl font-bold text-[var(--color-primary-500)]">
                    JETrack
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                  Servicios Técnicos e Industriales
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Monterrey, Nuevo León, México
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  contacto@jetrack.mx | 81-0000-1111
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold text-[var(--color-primary-500)] uppercase tracking-wider">
                  Cotización
                </h2>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                  {quotation.number}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  Fecha: {formatDate(quotation.createdAt)}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Vence: {formatDate(quotation.validUntil)}
                </p>
              </div>
            </div>

            {/* Client */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                Cliente
              </h3>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {quotation.clientName}
              </p>
              {quotation.technicianName && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Técnico asignado: {quotation.technicianName}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {quotation.title}
              </h3>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b-2 border-[var(--color-primary-500)]">
                  <th className="pb-2 text-left font-semibold text-[var(--color-text-primary)]">
                    Descripción
                  </th>
                  <th className="pb-2 text-center font-semibold text-[var(--color-text-primary)]">
                    Cant.
                  </th>
                  <th className="pb-2 text-right font-semibold text-[var(--color-text-primary)]">
                    Precio Unit.
                  </th>
                  <th className="pb-2 text-right font-semibold text-[var(--color-text-primary)]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--color-border-light)]">
                    <td className="py-2.5 text-[var(--color-text-primary)]">
                      {item.description}
                    </td>
                    <td className="py-2.5 text-center text-[var(--color-text-primary)]">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-right text-[var(--color-text-primary)]">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-[var(--color-text-primary)]">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Subtotal:</span>
                  <span>{formatCurrency(quotation.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">IVA (16%):</span>
                  <span>{formatCurrency(quotation.tax)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-[var(--color-primary-500)] pt-2 text-base font-bold">
                  <span>TOTAL:</span>
                  <span className="text-[var(--color-primary-500)]">
                    {formatCurrency(quotation.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quotation.notes && (
              <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
                <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
                  Notas
                </h4>
                <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
                  {quotation.notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-[var(--color-border)] pt-4 text-center">
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Esta cotización es válida hasta el {formatDate(quotation.validUntil)}.
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                JETrack - Servicios Técnico e Industriales &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


