"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  LayoutGrid,
  List,
  X,
  MapPin,
  User,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Ticket, TicketStatus, Technician } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week" | "day";

const STATUS_COLORS: Record<TicketStatus, string> = {
  pending: "#94a3b8",
  scheduled: "#1d4ed8",
  en_camino: "#d97706",
  iniciado: "#059669",
  pausado: "#be185d",
  completado: "#047857",
  cancelado: "#dc2626",
};

const STATUS_BG: Record<TicketStatus, string> = {
  pending: "#f1f5f9",
  scheduled: "#dbeafe",
  en_camino: "#fef3c7",
  iniciado: "#d1fae5",
  pausado: "#fce7f3",
  completado: "#d1fae5",
  cancelado: "#fee2e2",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  pending: "Pendiente",
  scheduled: "Programado",
  en_camino: "En Camino",
  iniciado: "Iniciado",
  pausado: "Pausado",
  completado: "Completado",
  cancelado: "Cancelado",
};

const PRIORITY_LABELS: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getTicketsForDate(tickets: Ticket[], dateStr: string): Ticket[] {
  return tickets.filter((t) => t.scheduledDate === dateStr);
}

export default function CalendarPage() {
  const tickets = useAppStore((s) => s.tickets);
  const technicians = useAppStore((s) => s.technicians);
  const openModal = useAppStore((s) => s.openModal);

  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDay, setSelectedDay] = useState<string>(formatDateKey(today));
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterTechIds, setFilterTechIds] = useState<Set<string>>(new Set());
  const [miniCalDate, setMiniCalDate] = useState<Date>(today);

  const filteredTickets = useMemo(() => {
    if (filterTechIds.size === 0) return tickets;
    return tickets.filter(
      (t) => t.technicianId && filterTechIds.has(t.technicianId)
    );
  }, [tickets, filterTechIds]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const nextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const goToToday = useCallback(() => {
    setCurrentDate(today);
    setSelectedDay(formatDateKey(today));
    setMiniCalDate(today);
  }, []);

  const toggleTechFilter = useCallback((techId: string) => {
    setFilterTechIds((prev) => {
      const next = new Set(prev);
      if (next.has(techId)) next.delete(techId);
      else next.add(techId);
      return next;
    });
  }, []);

  const monthGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevDays = getDaysInMonth(year, month - 1);
    const cells: { date: Date; dateStr: string; day: number; currentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevDays - i);
      cells.push({ date: d, dateStr: formatDateKey(d), day: prevDays - i, currentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      cells.push({ date: d, dateStr: formatDateKey(d), day: i, currentMonth: true });
    }

    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({ date: d, dateStr: formatDateKey(d), day: i, currentMonth: false });
    }

    return cells;
  }, [year, month]);

  const weekDays = useMemo(() => {
    const start = getWeekStart(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const todayStr = formatDateKey(today);

  const selectedDayTickets = useMemo(() => {
    return getTicketsForDate(filteredTickets, selectedDay);
  }, [filteredTickets, selectedDay]);

  const todayTickets = useMemo(() => {
    return getTicketsForDate(filteredTickets, todayStr);
  }, [filteredTickets, todayStr]);

  const nextJob = useMemo(() => {
    const upcoming = filteredTickets
      .filter(
        (t) =>
          t.scheduledDate >= todayStr &&
          (t.status === "scheduled" || t.status === "en_camino")
      )
      .sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
    return upcoming[0] || null;
  }, [filteredTickets, todayStr]);

  const handleDayClick = useCallback((dateStr: string) => {
    setSelectedDay(dateStr);
    if (viewMode === "month") {
      setCurrentDate(new Date(dateStr + "T00:00:00"));
    }
  }, [viewMode]);

  const handleNewJob = useCallback(() => {
    openModal("newTicket");
  }, [openModal]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 6; h <= 20; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

  const miniCalendar = useMemo(() => {
    const my = miniCalDate.getFullYear();
    const mm = miniCalDate.getMonth();
    const daysInM = getDaysInMonth(my, mm);
    const firstD = getFirstDayOfMonth(my, mm);
    const prevD = getDaysInMonth(my, mm - 1);
    const cells: { day: number; currentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstD - 1; i >= 0; i--) {
      const d = new Date(my, mm - 1, prevD - i);
      cells.push({ day: prevD - i, currentMonth: false, dateStr: formatDateKey(d) });
    }
    for (let i = 1; i <= daysInM; i++) {
      const d = new Date(my, mm, i);
      cells.push({ day: i, currentMonth: true, dateStr: formatDateKey(d) });
    }
    const remaining = 35 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(my, mm + 1, i);
      cells.push({ day: i, currentMonth: false, dateStr: formatDateKey(d) });
    }

    return cells;
  }, [miniCalDate]);

  const renderMonthView = () => (
    <motion.div
      key="month"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-7 gap-px rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] overflow-hidden">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="bg-[var(--color-surface-secondary)] px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]"
          >
            {d}
          </div>
        ))}

        {monthGrid.map((cell, idx) => {
          const dayTickets = getTicketsForDate(filteredTickets, cell.dateStr);
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDay;

          return (
            <div
              key={idx}
              onClick={() => {
                if (cell.currentMonth) handleDayClick(cell.dateStr);
              }}
              className={cn(
                "relative min-h-[90px] bg-white p-1.5 transition-colors",
                cell.currentMonth
                  ? "cursor-pointer hover:bg-[var(--color-surface-secondary)]"
                  : "bg-[var(--color-surface-secondary)] opacity-40",
                isSelected && "ring-2 ring-inset ring-[var(--color-primary-500)]"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday
                      ? "bg-[var(--color-primary-500)] text-white font-bold"
                      : cell.currentMonth
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-tertiary)]"
                  )}
                >
                  {cell.day}
                </span>
              </div>

              {dayTickets.length > 0 && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group relative truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight text-white cursor-pointer"
                      style={{ backgroundColor: STATUS_COLORS[ticket.status] }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticket);
                      }}
                    >
                      {ticket.scheduledTime} {ticket.clientName.split(" ")[0]}
                    </div>
                  ))}
                  {dayTickets.length > 3 && (
                    <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] pl-1">
                      +{dayTickets.length - 3} más
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDayTickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card-static p-4"
        >
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            Trabajos del {new Date(selectedDay + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </h3>
          <div className="flex flex-col gap-2">
            {selectedDayTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderWeekView = () => {
    const techIds = new Set(filteredTickets.map((t) => t.technicianId).filter(Boolean));
    const techRows = Array.from(techIds)
      .map((id) => technicians.find((t) => t.id === id))
      .filter((t): t is Technician => t !== undefined);

    return (
      <motion.div
        key="week"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="overflow-x-auto"
      >
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-px rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] overflow-hidden">
            <div className="bg-[var(--color-surface-secondary)] px-2 py-2">
              <span className="text-[10px] font-semibold uppercase text-[var(--color-text-tertiary)]">
                Técnico / Hora
              </span>
            </div>
            {weekDays.map((d, i) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={i}
                  className={cn(
                    "bg-[var(--color-surface-secondary)] px-2 py-2 text-center",
                    isToday && "bg-[var(--color-primary-50)]"
                  )}
                >
                  <div className="text-[10px] font-semibold uppercase text-[var(--color-text-tertiary)]">
                    {DAY_NAMES[i]}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 text-sm font-bold",
                      isToday
                        ? "text-[var(--color-primary-500)]"
                        : "text-[var(--color-text-primary)]"
                    )}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}

            {techRows.map((tech) => (
              <WeekRow
                key={tech.id}
                technician={tech}
                weekDays={weekDays}
                tickets={filteredTickets}
                today={today}
                onTicketClick={setSelectedTicket}
              />
            ))}

            {techRows.length === 0 && (
              <>
                <div className="col-span-8 bg-white p-8 text-center text-sm text-[var(--color-text-tertiary)]">
                  No hay técnicos con trabajos en esta semana
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDayView = () => {
    const dayDate = new Date(selectedDay + "T00:00:00");
    const dayTickets = getTicketsForDate(filteredTickets, selectedDay);

    return (
      <motion.div
        key="day"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="overflow-x-auto"
      >
        <div className="card-static overflow-hidden">
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {dayDate.toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {dayTickets.length} trabajo{dayTickets.length !== 1 ? "s" : ""} programado{dayTickets.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative">
            {timeSlots.map((slot, i) => {
              const hour = parseInt(slot.split(":")[0]);
              const slotTickets = dayTickets.filter((t) => {
                const tHour = parseInt(t.scheduledTime.split(":")[0]);
                return tHour === hour;
              });

              return (
                <div
                  key={slot}
                  className="grid grid-cols-[80px_1fr] border-b border-[var(--color-border-light)]"
                >
                  <div className="border-r border-[var(--color-border-light)] px-3 py-3 text-xs font-medium text-[var(--color-text-tertiary)]">
                    {slot}
                  </div>
                  <div className="relative min-h-[56px] px-3 py-1">
                    {slotTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-l-3 p-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
                        style={{
                          borderLeftColor: STATUS_COLORS[ticket.status],
                          backgroundColor: STATUS_BG[ticket.status] + "40",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--color-text-primary)]">
                              {ticket.scheduledTime}
                            </span>
                            <span className="chip text-[10px]" style={{ backgroundColor: STATUS_BG[ticket.status], color: STATUS_COLORS[ticket.status] }}>
                              {STATUS_LABELS[ticket.status]}
                            </span>
                            <span className={`chip text-[10px] priority-${ticket.priority}`}>
                              {PRIORITY_LABELS[ticket.priority]}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs font-medium text-[var(--color-text-primary)]">
                            {ticket.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-3 text-[10px] text-[var(--color-text-tertiary)]">
                            <span className="flex items-center gap-1">
                              <User size={10} /> {ticket.clientName}
                            </span>
                            {ticket.technicianName && (
                              <span className="flex items-center gap-1">
                                <Wrench size={10} /> {ticket.technicianName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
                          <Clock size={10} />
                          {ticket.estimatedDuration}min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const miniCalTickets = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach((t) => {
      counts[t.scheduledDate] = (counts[t.scheduledDate] || 0) + 1;
    });
    return counts;
  }, [filteredTickets]);

  return (
    <div className="flex gap-6 p-4 md:p-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="btn-ghost p-2" aria-label="Mes anterior">
              <ChevronLeft size={18} />
            </button>
            <h2 className="min-w-[180px] text-center text-lg font-bold text-[var(--color-text-primary)]">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth} className="btn-ghost p-2" aria-label="Mes siguiente">
              <ChevronRight size={18} />
            </button>
            <button onClick={goToToday} className="btn-secondary text-xs">
              Hoy
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-[var(--color-border)] bg-white p-0.5">
              {([
                { mode: "month" as ViewMode, icon: LayoutGrid, label: "Mes" },
                { mode: "week" as ViewMode, icon: CalendarDays, label: "Semana" },
                { mode: "day" as ViewMode, icon: List, label: "Día" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    viewMode === mode
                      ? "bg-[var(--color-primary-500)] text-white shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]"
                  )}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <button onClick={handleNewJob} className="btn-primary text-xs">
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo Trabajo</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </AnimatePresence>
      </div>

      <div className="hidden w-[260px] shrink-0 lg:flex flex-col gap-4">
        <div className="card-static p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => {
                const d = new Date(miniCalDate);
                d.setMonth(d.getMonth() - 1);
                setMiniCalDate(d);
              }}
              className="btn-ghost p-1"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              {MONTH_NAMES[miniCalDate.getMonth()]} {miniCalDate.getFullYear()}
            </span>
            <button
              onClick={() => {
                const d = new Date(miniCalDate);
                d.setMonth(d.getMonth() + 1);
                setMiniCalDate(d);
              }}
              className="btn-ghost p-1"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
              <div key={d} className="py-1 text-center text-[9px] font-semibold uppercase text-[var(--color-text-tertiary)]">
                {d}
              </div>
            ))}
            {miniCalendar.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const hasTickets = (miniCalTickets[cell.dateStr] || 0) > 0;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (cell.currentMonth) {
                      setSelectedDay(cell.dateStr);
                      setCurrentDate(new Date(cell.dateStr + "T00:00:00"));
                    }
                  }}
                  className={cn(
                    "relative flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium transition-all mx-auto",
                    isToday
                      ? "bg-[var(--color-primary-500)] text-white font-bold"
                      : cell.currentMonth
                        ? "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"
                        : "text-[var(--color-text-tertiary)] opacity-40"
                  )}
                >
                  {cell.day}
                  {hasTickets && !isToday && cell.currentMonth && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-primary-400)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-static p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Leyenda de Estados
          </h3>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(STATUS_COLORS) as TicketStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {STATUS_LABELS[status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-static p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Resumen de Hoy
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-2xl font-bold text-[var(--color-primary-500)]">
                {todayTickets.length}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">
                trabajo{todayTickets.length !== 1 ? "s" : ""} programado{todayTickets.length !== 1 ? "s" : ""}
              </div>
            </div>
            {nextJob && (
              <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] p-2.5">
                <div className="text-[10px] font-semibold uppercase text-[var(--color-text-tertiary)]">
                  Próximo trabajo
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {nextJob.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                  <Clock size={10} />
                  {nextJob.scheduledTime}
                  <span className="mx-0.5">·</span>
                  {nextJob.clientName.split(" ")[0]}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card-static p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Filtrar por Técnico
          </h3>
          <div className="flex flex-col gap-1.5">
            {technicians.map((tech) => (
              <label
                key={tech.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--color-surface-secondary)]"
              >
                <input
                  type="checkbox"
                  checked={filterTechIds.size === 0 || filterTechIds.has(tech.id)}
                  onChange={() => toggleTechFilter(tech.id)}
                  className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-primary-500)]"
                />
                <span className="flex-1 text-xs text-[var(--color-text-secondary)]">
                  {tech.name}
                </span>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {tech.zone}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="modal-content max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-[var(--color-border)] px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    {selectedTicket.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                    {selectedTicket.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="btn-ghost p-1.5"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className="chip"
                    style={{ backgroundColor: STATUS_BG[selectedTicket.status], color: STATUS_COLORS[selectedTicket.status] }}
                  >
                    {STATUS_LABELS[selectedTicket.status]}
                  </span>
                  <span className={`chip priority-${selectedTicket.priority}`}>
                    {PRIORITY_LABELS[selectedTicket.priority]}
                  </span>
                  <span className="chip chip-pending">
                    {selectedTicket.serviceType}
                  </span>
                </div>

                <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                  {selectedTicket.description}
                </p>

                <div className="flex flex-col gap-2.5">
                  <InfoRow icon={<CalendarDays size={14} />} label="Fecha" value={selectedTicket.scheduledDate} />
                  <InfoRow icon={<Clock size={14} />} label="Hora" value={`${selectedTicket.scheduledTime} (${selectedTicket.estimatedDuration} min)`} />
                  <InfoRow icon={<User size={14} />} label="Cliente" value={selectedTicket.clientName} />
                  {selectedTicket.technicianName && (
                    <InfoRow icon={<Wrench size={14} />} label="Técnico" value={selectedTicket.technicianName} />
                  )}
                  <InfoRow icon={<MapPin size={14} />} label="Ubicación" value={selectedTicket.location} />
                </div>

                {selectedTicket.notes.length > 0 && (
                  <div className="mt-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] p-3">
                    <h4 className="mb-2 text-xs font-semibold uppercase text-[var(--color-text-tertiary)]">
                      Notas
                    </h4>
                    {selectedTicket.notes.map((note) => (
                      <p key={note.id} className="text-xs text-[var(--color-text-secondary)]">
                        {note.content}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--color-border)] px-5 py-3 flex justify-end gap-2">
                <button onClick={() => setSelectedTicket(null)} className="btn-secondary text-xs">
                  Cerrar
                </button>
                <button onClick={() => { openModal("editTicket", selectedTicket); setSelectedTicket(null); }} className="btn-primary text-xs">
                  Editar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border-light)] bg-white p-3 transition-all hover:border-[var(--color-primary-200)] hover:shadow-sm"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: STATUS_BG[ticket.status] }}
      >
        <Clock size={16} style={{ color: STATUS_COLORS[ticket.status] }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-text-primary)]">
            {ticket.scheduledTime}
          </span>
          <span className={`chip text-[10px] priority-${ticket.priority}`}>
            {PRIORITY_LABELS[ticket.priority]}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs font-medium text-[var(--color-text-primary)]">
          {ticket.clientName}
        </p>
        {ticket.technicianName && (
          <p className="text-[10px] text-[var(--color-text-tertiary)]">
            {ticket.technicianName}
          </p>
        )}
      </div>
      <span
        className="chip text-[10px]"
        style={{ backgroundColor: STATUS_BG[ticket.status], color: STATUS_COLORS[ticket.status] }}
      >
        {STATUS_LABELS[ticket.status]}
      </span>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[var(--color-text-tertiary)]">{icon}</div>
      <div>
        <div className="text-[10px] font-semibold uppercase text-[var(--color-text-tertiary)]">
          {label}
        </div>
        <div className="text-xs text-[var(--color-text-primary)]">{value}</div>
      </div>
    </div>
  );
}

function WeekRow({
  technician,
  weekDays,
  tickets,
  today,
  onTicketClick,
}: {
  technician: { id: string; name: string; zone: string };
  weekDays: Date[];
  tickets: Ticket[];
  today: Date;
  onTicketClick: (t: Ticket) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 bg-white px-2 py-2 border-r border-[var(--color-border-light)]">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[10px] font-bold text-[var(--color-primary-500)]">
          {technician.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[10px] font-semibold text-[var(--color-text-primary)]">
            {technician.name.split(" ")[0]}
          </div>
          <div className="text-[9px] text-[var(--color-text-tertiary)]">
            {technician.zone}
          </div>
        </div>
      </div>
      {weekDays.map((day, i) => {
        const dayStr = formatDateKey(day);
        const dayTickets = tickets.filter(
          (t) => t.technicianId === technician.id && t.scheduledDate === dayStr
        );
        const isToday = isSameDay(day, today);

        return (
          <div
            key={i}
            className={cn(
              "relative bg-white p-1 min-h-[60px]",
              isToday && "bg-[var(--color-primary-50)]/30"
            )}
          >
            {dayTickets.map((ticket) => {
              const startMin = parseTimeToMinutes(ticket.scheduledTime);
              const durationMin = ticket.estimatedDuration;
              const topPx = ((startMin - 360) / 60) * 40;
              const heightPx = Math.max((durationMin / 60) * 40, 20);

              return (
                <div
                  key={ticket.id}
                  onClick={() => onTicketClick(ticket)}
                  className="absolute left-0.5 right-0.5 cursor-pointer overflow-hidden rounded-md border-l-2 px-1 py-0.5 transition-opacity hover:opacity-80"
                  style={{
                    top: `${Math.max(topPx, 0)}px`,
                    height: `${heightPx}px`,
                    backgroundColor: STATUS_BG[ticket.status],
                    borderLeftColor: STATUS_COLORS[ticket.status],
                  }}
                >
                  <div className="truncate text-[9px] font-bold" style={{ color: STATUS_COLORS[ticket.status] }}>
                    {ticket.scheduledTime}
                  </div>
                  <div className="truncate text-[9px] font-medium text-[var(--color-text-primary)]">
                    {ticket.clientName.split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
