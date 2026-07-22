"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  ArrowUpRight,
  Clock,
  Star,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

type ReportTab = "general" | "technician" | "client" | "service";

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

const statusColors: Record<string, string> = {
  pending: "#94a3b8",
  scheduled: "#1d4ed8",
  en_camino: "#d97706",
  iniciado: "#059669",
  pausado: "#be185d",
  completado: "#047857",
  cancelado: "#dc2626",
};

const priorityColors: Record<string, string> = {
  baja: "#94a3b8",
  media: "#1d4ed8",
  alta: "#d97706",
  urgente: "#dc2626",
};

const tabs: { id: ReportTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "technician", label: "Por Técnico" },
  { id: "client", label: "Por Cliente" },
  { id: "service", label: "Por Servicio" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function Reports() {
  const { tickets, clients, technicians, quotations } = useAppStore();
  const [activeTab, setActiveTab] = useState<ReportTab>("general");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-12-31");
  const [techSortField, setTechSortField] = useState<"name" | "completedJobs" | "rating" | "avgTime">("completedJobs");
  const [techSortDir, setTechSortDir] = useState<"asc" | "desc">("desc");
  const [clientSortField, setClientSortField] = useState<"name" | "totalTickets" | "revenue">("revenue");
  const [clientSortDir, setClientSortDir] = useState<"asc" | "desc">("desc");
  const [serviceSortField, setServiceSortField] = useState<"count" | "revenue">("count");
  const [serviceSortDir, setServiceSortDir] = useState<"asc" | "desc">("desc");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (dateFrom && t.scheduledDate < dateFrom) return false;
      if (dateTo && t.scheduledDate > dateTo) return false;
      return true;
    });
  }, [tickets, dateFrom, dateTo]);

  const generalMetrics = useMemo(() => {
    const completed = filteredTickets.filter((t) => t.status === "completado");
    const totalCompleted = completed.length;
    const avgTime =
      completed.length > 0
        ? Math.round(completed.reduce((sum, t) => sum + (t.actualDuration || t.estimatedDuration), 0) / completed.length)
        : 0;
    const revenue = quotations
      .filter((q) => q.status === "aprobada" || q.status === "facturada")
      .reduce((sum, q) => sum + q.total, 0);
    return { totalCompleted, avgTime, satisfaction: 4.7, revenue };
  }, [filteredTickets, quotations]);

  const monthlyData = useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const last6 = months.slice(1, 7);
    const values = [32, 28, 45, 38, 52, 47];
    const max = Math.max(...values);
    return last6.map((name, i) => ({
      name,
      value: values[i],
      percentage: max > 0 ? (values[i] / max) * 100 : 0,
    }));
  }, []);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    const total = filteredTickets.length || 1;
    return Object.entries(counts)
      .map(([status, count]) => ({
        status,
        label: statusLabels[status] || status,
        count,
        percentage: Math.round((count / total) * 100),
        color: statusColors[status] || "#94a3b8",
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTickets]);

  const priorityDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    const total = filteredTickets.length || 1;
    const data = Object.entries(counts).map(([priority, count]) => ({
      priority,
      label: priorityLabels[priority] || priority,
      count,
      percentage: Math.round((count / total) * 100),
      color: priorityColors[priority] || "#94a3b8",
    }));
    return data;
  }, [filteredTickets]);

  const techData = useMemo(() => {
    const data = technicians.map((tech) => {
      const techTickets = filteredTickets.filter((t) => t.technicianId === tech.id);
      const completed = techTickets.filter((t) => t.status === "completado");
      const avgTime =
        completed.length > 0
          ? Math.round(
              completed.reduce((sum, t) => sum + (t.actualDuration || t.estimatedDuration), 0) / completed.length
            )
          : 0;
      return {
        id: tech.id,
        name: tech.name,
        specialty: tech.specialty,
        zone: tech.zone,
        completedJobs: tech.completedJobs,
        rating: tech.rating,
        completedInRange: completed.length,
        avgTime,
        totalTickets: techTickets.length,
      };
    });
    const sorted = [...data].sort((a, b) => {
      const aVal = a[techSortField];
      const bVal = b[techSortField];
      if (typeof aVal === "string") return techSortDir === "asc" ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      return techSortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [technicians, filteredTickets, techSortField, techSortDir]);

  const maxTechCompleted = useMemo(() => Math.max(...techData.map((t) => t.completedInRange), 1), [techData]);

  const clientData = useMemo(() => {
    const data = clients.map((client) => {
      const clientTickets = filteredTickets.filter((t) => t.clientId === client.id);
      const revenue = quotations
        .filter((q) => q.clientId === client.id && (q.status === "aprobada" || q.status === "facturada"))
        .reduce((sum, q) => sum + q.total, 0);
      const lastTicket = [...clientTickets].sort(
        (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      )[0];
      return {
        id: client.id,
        name: client.name,
        company: client.company,
        totalTickets: clientTickets.length,
        revenue,
        lastService: lastTicket?.scheduledDate || null,
      };
    });
    const sorted = [...data].sort((a, b) => {
      const aVal = a[clientSortField];
      const bVal = b[clientSortField];
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (typeof aVal === "string") return clientSortDir === "asc" ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      return clientSortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [clients, filteredTickets, quotations, clientSortField, clientSortDir]);

  const maxClientRevenue = useMemo(() => Math.max(...clientData.map((c) => c.revenue), 1), [clientData]);

  const serviceData = useMemo(() => {
    const map = new Map<string, { count: number; totalRevenue: number; totalTime: number; completedCount: number }>();
    filteredTickets.forEach((t) => {
      const existing = map.get(t.serviceType) || { count: 0, totalRevenue: 0, totalTime: 0, completedCount: 0 };
      existing.count += 1;
      if (t.status === "completado") {
        existing.completedCount += 1;
        existing.totalTime += t.actualDuration || t.estimatedDuration;
      }
      map.set(t.serviceType, existing);
    });
    const data = Array.from(map.entries()).map(([service, info]) => {
      const serviceRevenue = quotations
        .filter((q) => q.ticketId && filteredTickets.find((t) => t.id === q.ticketId && t.serviceType === service))
        .reduce((sum, q) => sum + q.total, 0);
      return {
        service,
        count: info.count,
        revenue: serviceRevenue,
        avgRevenue: info.count > 0 ? Math.round(serviceRevenue / info.count) : 0,
        avgTime: info.completedCount > 0 ? Math.round(info.totalTime / info.completedCount) : 0,
      };
    });
    const sorted = [...data].sort((a, b) => {
      const aVal = a[serviceSortField];
      const bVal = b[serviceSortField];
      return serviceSortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredTickets, quotations, serviceSortField, serviceSortDir]);

  const maxServiceCount = useMemo(() => Math.max(...serviceData.map((s) => s.count), 1), [serviceData]);

  const totalPriority = priorityDistribution.reduce((sum, p) => sum + p.count, 0);

  function handleExport() {
    const rows: (string | number)[][] = [["Reporte General JETrack", `Del ${dateFrom} al ${dateTo}`], []];
    rows.push(["Métricas Generales"]);
    rows.push(["Total Trabajos Completados", generalMetrics.totalCompleted]);
    rows.push(["Tiempo Promedio (min)", generalMetrics.avgTime]);
    rows.push(["Satisfacción", generalMetrics.satisfaction]);
    rows.push(["Ingresos Totales", generalMetrics.revenue]);
    rows.push([]);
    rows.push(["Por Técnico"]);
    rows.push(["Técnico", "Trabajos Completados", "Tiempo Promedio", "Satisfacción", "Zona"]);
    techData.forEach((t) => rows.push([t.name, t.completedInRange, t.avgTime, t.rating, t.zone]));
    rows.push([]);
    rows.push(["Por Cliente"]);
    rows.push(["Cliente", "Total Tickets", "Ingresos", "Último Servicio"]);
    clientData.forEach((c) => rows.push([c.name, c.totalTickets, c.revenue, c.lastService || ""]));
    rows.push([]);
    rows.push(["Por Servicio"]);
    rows.push(["Servicio", "Total Tickets", "Ingresos Promedio", "Tiempo Promedio"]);
    serviceData.forEach((s) => rows.push([s.service, s.count, s.avgRevenue, s.avgTime]));
    const csv = rows.map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_jetrack_${dateFrom}_${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function toggleTechSort(field: typeof techSortField) {
    if (techSortField === field) setTechSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setTechSortField(field);
      setTechSortDir("desc");
    }
  }

  function toggleClientSort(field: typeof clientSortField) {
    if (clientSortField === field) setClientSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setClientSortField(field);
      setClientSortDir("desc");
    }
  }

  function toggleServiceSort(field: typeof serviceSortField) {
    if (serviceSortField === field) setServiceSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setServiceSortField(field);
      setServiceSortDir("desc");
    }
  }

  function SortHeader({
    label,
    active,
    dir,
    onClick,
  }: {
    label: string;
    active: boolean;
    dir: "asc" | "desc";
    onClick: () => void;
  }) {
    return (
      <th
        className={`text-left text-xs font-medium px-5 py-3 cursor-pointer select-none transition-colors hover:text-primary-500 ${
          active ? "text-primary-500" : "text-text-tertiary"
        }`}
        onClick={onClick}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <span className="text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : "⇅"}</span>
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reportes</h1>
          <p className="text-sm text-text-secondary mt-1">Análisis detallado del rendimiento operativo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-tertiary" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field text-sm py-2 w-[140px]"
            />
            <span className="text-text-tertiary text-sm">a</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field text-sm py-2 w-[140px]"
            />
          </div>
          <button onClick={handleExport} className="btn-primary">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-surface-tertiary rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-primary-500 shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "general" && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Total Trabajos Completados",
                  value: generalMetrics.totalCompleted.toString(),
                  icon: BarChart3,
                  bg: "bg-primary-100",
                  iconColor: "text-primary-500",
                  change: "+12%",
                },
                {
                  title: "Tiempo Promedio de Resolución",
                  value: `${Math.round(generalMetrics.avgTime / 60)}h ${generalMetrics.avgTime % 60}m`,
                  icon: Clock,
                  bg: "bg-amber-100",
                  iconColor: "text-amber-600",
                  change: "-8%",
                },
                {
                  title: "Tasa de Satisfacción",
                  value: `${generalMetrics.satisfaction}/5.0`,
                  icon: Star,
                  bg: "bg-emerald-100",
                  iconColor: "text-emerald-600",
                  change: "+0.2",
                },
                {
                  title: "Ingresos Totales",
                  value: formatCurrency(generalMetrics.revenue),
                  icon: TrendingUp,
                  bg: "bg-violet-100",
                  iconColor: "text-violet-600",
                  change: "+15%",
                },
              ].map((kpi, i) => (
                <motion.div key={kpi.title} custom={i} initial="hidden" animate="visible" variants={cardVariants} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">{kpi.title}</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">{kpi.value}</p>
                    </div>
                    <div className={`${kpi.bg} p-2.5 rounded-xl`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">{kpi.change}</span>
                    <span className="text-xs text-text-tertiary">vs mes anterior</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="card-static p-5"
              >
                <h2 className="font-semibold text-text-primary mb-1">Rendimiento Mensual</h2>
                <p className="text-xs text-text-tertiary mb-4">Últimos 6 meses</p>
                <div className="flex items-end justify-between gap-2 h-48 px-2">
                  {monthlyData.map((m) => (
                    <div key={m.name} className="flex flex-col items-center flex-1 h-full justify-end">
                      <span className="text-xs text-text-tertiary mb-1">{m.value}</span>
                      <div
                        className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
                        style={{ height: `${m.percentage}%` }}
                      />
                      <span className="text-xs text-text-secondary mt-2 font-medium">{m.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="card-static p-5"
              >
                <h2 className="font-semibold text-text-primary mb-1">Distribución por Estado</h2>
                <p className="text-xs text-text-tertiary mb-4">Porcentaje de tickets por estado</p>
                <div className="space-y-3">
                  {statusDistribution.map((s) => (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text-secondary">{s.label}</span>
                        <span className="text-sm font-medium text-text-primary">
                          {s.count} ({s.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="card-static p-5"
            >
              <h2 className="font-semibold text-text-primary mb-1">Distribución por Prioridad</h2>
              <p className="text-xs text-text-tertiary mb-6">Proporción de tickets por nivel de prioridad</p>
              <div className="flex items-center gap-4">
                <div className="relative w-48 h-48 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      let cumulative = 0;
                      const radius = 40;
                      const circumference = 2 * Math.PI * radius;
                      return priorityDistribution.map((p) => {
                        const dash = (p.percentage / 100) * circumference;
                        const offset = cumulative;
                        cumulative += dash;
                        return (
                          <circle
                            key={p.priority}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={p.color}
                            strokeWidth="20"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={-offset}
                            className="transition-all duration-700"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-text-primary">{totalPriority}</span>
                    <span className="text-xs text-text-tertiary">Total</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {priorityDistribution.map((p) => (
                    <div key={p.priority} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-text-secondary flex-1">{p.label}</span>
                      <span className="text-sm font-medium text-text-primary">{p.count}</span>
                      <span className="text-sm text-text-tertiary w-12 text-right">{p.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "technician" && (
          <motion.div
            key="technician"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="card-static overflow-hidden"
            >
              <div className="p-5 pb-0">
                <h2 className="font-semibold text-text-primary">Rendimiento por Técnico</h2>
                <p className="text-xs text-text-tertiary mt-1">Comparativa de desempeño individual</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full mt-3">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">Técnico</th>
                      <SortHeader
                        label="Trabajos Completados"
                        active={techSortField === "completedJobs"}
                        dir={techSortDir}
                        onClick={() => toggleTechSort("completedJobs")}
                      />
                      <SortHeader
                        label="Tiempo Promedio"
                        active={techSortField === "avgTime"}
                        dir={techSortDir}
                        onClick={() => toggleTechSort("avgTime")}
                      />
                      <SortHeader
                        label="Satisfacción"
                        active={techSortField === "rating"}
                        dir={techSortDir}
                        onClick={() => toggleTechSort("rating")}
                      />
                      <SortHeader
                        label="Zona"
                        active={techSortField === "name"}
                        dir={techSortDir}
                        onClick={() => toggleTechSort("name")}
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {techData.map((tech) => (
                      <tr key={tech.id} className="table-row border-b border-border-light">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                              {getInitials(tech.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                              <p className="text-xs text-text-tertiary">{tech.specialty}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-text-primary">{tech.completedJobs}</td>
                        <td className="px-5 py-3 text-sm text-text-secondary">
                          {tech.avgTime > 0 ? `${Math.round(tech.avgTime / 60)}h ${tech.avgTime % 60}m` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-text-primary">{tech.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-text-secondary">{tech.zone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="card-static p-5"
            >
              <h2 className="font-semibold text-text-primary mb-1">Comparativa de Técnicos</h2>
              <p className="text-xs text-text-tertiary mb-4">Trabajos completados en el rango seleccionado</p>
              <div className="space-y-3">
                {techData.map((tech) => {
                  const pct = maxTechCompleted > 0 ? (tech.completedInRange / maxTechCompleted) * 100 : 0;
                  return (
                    <div key={tech.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text-secondary">{tech.name}</span>
                        <span className="text-sm font-medium text-text-primary">{tech.completedInRange} trabajos</span>
                      </div>
                      <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-primary-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "client" && (
          <motion.div
            key="client"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="card-static overflow-hidden"
            >
              <div className="p-5 pb-0">
                <h2 className="font-semibold text-text-primary">Reporte por Cliente</h2>
                <p className="text-xs text-text-tertiary mt-1">Actividad e ingresos por cliente</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full mt-3">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">Cliente</th>
                      <SortHeader
                        label="Total Tickets"
                        active={clientSortField === "totalTickets"}
                        dir={clientSortDir}
                        onClick={() => toggleClientSort("totalTickets")}
                      />
                      <SortHeader
                        label="Ingresos"
                        active={clientSortField === "revenue"}
                        dir={clientSortDir}
                        onClick={() => toggleClientSort("revenue")}
                      />
                      <SortHeader
                        label="Último Servicio"
                        active={clientSortField === "name"}
                        dir={clientSortDir}
                        onClick={() => toggleClientSort("name")}
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.map((client) => (
                      <tr key={client.id} className="table-row border-b border-border-light">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-600">
                              {getInitials(client.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{client.name}</p>
                              {client.company && <p className="text-xs text-text-tertiary">{client.company}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-text-primary">{client.totalTickets}</td>
                        <td className="px-5 py-3 text-sm font-medium text-text-primary">{formatCurrency(client.revenue)}</td>
                        <td className="px-5 py-3 text-sm text-text-secondary">
                          {client.lastService ? formatDate(client.lastService) : "—"}
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
              transition={{ delay: 0.25, duration: 0.4 }}
              className="card-static p-5"
            >
              <h2 className="font-semibold text-text-primary mb-1">Ingresos por Cliente</h2>
              <p className="text-xs text-text-tertiary mb-4">Distribución de ingresos generados</p>
              <div className="space-y-3">
                {clientData
                  .filter((c) => c.revenue > 0)
                  .map((client) => {
                    const pct = maxClientRevenue > 0 ? (client.revenue / maxClientRevenue) * 100 : 0;
                    return (
                      <div key={client.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-secondary">{client.name}</span>
                          <span className="text-sm font-medium text-text-primary">{formatCurrency(client.revenue)}</span>
                        </div>
                        <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "service" && (
          <motion.div
            key="service"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="card-static overflow-hidden"
            >
              <div className="p-5 pb-0">
                <h2 className="font-semibold text-text-primary">Reporte por Servicio</h2>
                <p className="text-xs text-text-tertiary mt-1">Análisis por tipo de servicio</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full mt-3">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">Servicio</th>
                      <SortHeader
                        label="Total Tickets"
                        active={serviceSortField === "count"}
                        dir={serviceSortDir}
                        onClick={() => toggleServiceSort("count")}
                      />
                      <SortHeader
                        label="Ingresos Promedio"
                        active={serviceSortField === "revenue"}
                        dir={serviceSortDir}
                        onClick={() => toggleServiceSort("revenue")}
                      />
                      <th className="text-left text-xs font-medium text-text-tertiary px-5 py-3">Tiempo Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceData.map((svc) => (
                      <tr key={svc.service} className="table-row border-b border-border-light">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-primary-500" />
                            </div>
                            <p className="text-sm font-medium text-text-primary">{svc.service}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{svc.count}</span>
                            <div className="w-20 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-400 rounded-full"
                                style={{ width: `${maxServiceCount > 0 ? (svc.count / maxServiceCount) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-text-primary">
                          {svc.avgRevenue > 0 ? formatCurrency(svc.avgRevenue) : "—"}
                        </td>
                        <td className="px-5 py-3 text-sm text-text-secondary">
                          {svc.avgTime > 0 ? `${Math.round(svc.avgTime / 60)}h ${svc.avgTime % 60}m` : "—"}
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
              transition={{ delay: 0.25, duration: 0.4 }}
              className="card-static p-5"
            >
              <h2 className="font-semibold text-text-primary mb-1">Tickets por Tipo de Servicio</h2>
              <p className="text-xs text-text-tertiary mb-4">Distribución de tickets por categoría</p>
              <div className="flex items-end justify-between gap-2 h-48 px-2">
                {serviceData.map((svc) => {
                  const pct = maxServiceCount > 0 ? (svc.count / maxServiceCount) * 100 : 0;
                  return (
                    <div key={svc.service} className="flex flex-col items-center flex-1 h-full justify-end">
                      <span className="text-xs text-text-tertiary mb-1">{svc.count}</span>
                      <div
                        className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[10px] text-text-secondary mt-2 font-medium text-center leading-tight">
                        {svc.service}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
