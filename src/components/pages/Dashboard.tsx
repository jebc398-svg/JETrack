"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  scheduled: "Programado",
  en_camino: "En Camino",
  iniciado: "Iniciado",
  pausado: "Pausado",
  completado: "Completado",
  cancelado: "Cancelado",
};

const priorityLabels: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const availabilityLabels: Record<string, string> = {
  disponible: "Disponible",
  en_trabajo: "En Trabajo",
  fuera: "Fuera",
};

const availabilityColors: Record<string, string> = {
  disponible: "bg-emerald-500",
  en_trabajo: "bg-amber-500",
  fuera: "bg-gray-400",
};

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const weekActivity = [65, 82, 45, 90, 72, 30, 15];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function Dashboard() {
  const { tickets, technicians, setActivePage } = useAppStore();
  const [calendarDate, setCalendarDate] = useState(new Date());

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const activeTickets = tickets.filter(
      (t) => t.status !== "completado" && t.status !== "cancelado"
    ).length;
    const completedToday = tickets.filter(
      (t) => t.status === "completado" && t.completedAt?.startsWith(today)
    ).length;
    return {
      totalTickets: 247,
      activeTickets: activeTickets || 18,
      completedToday: completedToday || 5,
      revenue: 385000,
    };
  }, [tickets]);

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tickets]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < adjustedFirst; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarDate]);

  const ticketDates = useMemo(() => {
    const dates = new Set<string>();
    tickets.forEach((t) => {
      if (t.scheduledDate) {
        const d = new Date(t.scheduledDate);
        if (
          d.getMonth() === calendarDate.getMonth() &&
          d.getFullYear() === calendarDate.getFullYear()
        ) {
          dates.add(d.getDate().toString());
        }
      }
    });
    return dates;
  }, [tickets, calendarDate]);

  const today = new Date();
  const isCurrentMonth =
    calendarDate.getMonth() === today.getMonth() &&
    calendarDate.getFullYear() === today.getFullYear();

  const navigateMonth = (direction: number) => {
    setCalendarDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const metricCards = [
    {
      title: "Total de Tickets",
      value: metrics.totalTickets.toString(),
      icon: TrendingUp,
      color: "bg-primary-100",
      iconColor: "text-primary-500",
      change: "+12%",
      positive: true,
    },
    {
      title: "Activos Hoy",
      value: metrics.activeTickets.toString(),
      icon: Clock,
      color: "bg-amber-100",
      iconColor: "text-amber-600",
      change: "+3",
      positive: true,
    },
    {
      title: "Completados Hoy",
      value: metrics.completedToday.toString(),
      icon: CheckCircle,
      color: "bg-emerald-100",
      iconColor: "text-emerald-600",
      change: "+2",
      positive: true,
    },
    {
      title: "Ingresos del Mes",
      value: formatCurrency(metrics.revenue),
      icon: DollarSign,
      color: "bg-violet-100",
      iconColor: "text-violet-600",
      change: "+8%",
      positive: true,
    },
  ];

  const performanceMetrics = [
    { label: "Tiempo Promedio", value: "3.25 hrs" },
    { label: "Satisfacción", value: "4.7/5.0" },
    { label: "Utilización", value: "82%" },
    { label: "Tickets Pendientes", value: "12" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Resumen general de operaciones
          </p>
        </div>
        <span className="text-xs text-text-tertiary hidden sm:block font-medium tracking-wide">
          {today.toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((metric, i) => (
          <motion.div
            key={metric.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="card p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{metric.title}</p>
                <p className="text-3xl font-extrabold text-text-primary mt-2 tracking-tight">
                  {metric.value}
                </p>
              </div>
              <div className={`${metric.color} p-3 rounded-2xl`}>
                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border-light">
              {metric.positive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-semibold ${
                  metric.positive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {metric.change}
              </span>
              <span className="text-xs text-text-tertiary">vs mes anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card-static overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Tickets Recientes</h2>
            <button
              onClick={() => setActivePage("tickets")}
              className="btn-ghost text-xs font-semibold text-primary-500 hover:text-primary-600"
            >
              Ver todos
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full mt-3">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">
                    ID
                  </th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">
                    Técnico
                  </th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">
                    Estado
                  </th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">
                    Prioridad
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="table-row border-b border-border-light">
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">
                      {ticket.id}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {ticket.clientName}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {ticket.technicianName || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`chip chip-${ticket.status}`}>
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`chip priority-${ticket.priority}`}>
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card-static p-6"
        >
          <h2 className="font-bold text-lg text-text-primary tracking-tight mb-6">
            Actividad de la Semana
          </h2>
          <div className="flex items-end justify-between gap-3 h-48 px-2">
            {weekDays.map((day, i) => (
              <div key={day} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className="text-xs font-semibold text-text-tertiary mb-2">
                  {weekActivity[i]}%
                </span>
                <div
                  className="w-full rounded-2xl transition-all duration-700 hover:opacity-90"
                  style={{
                    height: `${weekActivity[i]}%`,
                    background: `linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%)`,
                    boxShadow: "0 2px 8px rgba(29, 78, 216, 0.15)",
                  }}
                />
                <span className="text-xs text-text-secondary mt-2.5 font-semibold">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="card-static p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Calendario</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-secondary" />
              </button>
              <span className="text-sm font-medium text-text-primary min-w-[140px] text-center">
                {calendarDate.toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-text-tertiary py-1"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} />;
              }
              const isToday =
                isCurrentMonth && day === today.getDate();
              const hasTicket = ticketDates.has(day.toString());
              return (
                <div
                  key={`day-${day}`}
                  className={`
                    relative flex items-center justify-center h-9 rounded-lg text-sm
                    transition-colors cursor-default
                    ${isToday ? "bg-primary-500 text-white font-semibold" : "text-text-secondary hover:bg-surface-tertiary"}
                  `}
                >
                  {day}
                  {hasTicket && !isToday && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-400" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="card-static p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Estado de Técnicos</h2>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-secondary">{technicians.length}</span>
            </div>
          </div>
          <div className="space-y-3">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-secondary transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                    {tech.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${availabilityColors[tech.availability]}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {tech.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {availabilityLabels[tech.availability]} · {tech.specialty}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-0.5 justify-end">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium text-text-primary">
                      {tech.rating}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {tech.completedJobs} trabajos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {performanceMetrics.map((pm, i) => (
          <motion.div
            key={pm.label}
            custom={i + 4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="card-static p-5 text-center"
          >
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{pm.label}</p>
            <p className="text-2xl font-extrabold text-text-primary mt-2 tracking-tight">{pm.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
