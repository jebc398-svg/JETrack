import type { Ticket, Client, Quotation, Technician } from "./types";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  scheduled: "Programado",
  en_camino: "En camino",
  iniciado: "Iniciado",
  pausado: "Pausado",
  completado: "Completado",
  cancelado: "Cancelado",
};

const prioLabels: Record<string, string> = {
  urgente: "Urgente",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export function buildDataContext(payload: {
  tickets: Ticket[];
  clients: Client[];
  quotations: Quotation[];
  technicians: Technician[];
}): string {
  const { tickets, clients, quotations, technicians } = payload;
  const lines: string[] = [];
  const today = new Date().toISOString().split("T")[0];

  lines.push("=== DATOS COMPLETOS DEL SISTEMA JETRACK ===");
  lines.push(`Fecha de consulta: ${today}`);

  lines.push(`\nRESUMEN: ${tickets.length} tickets, ${clients.length} clientes, ${quotations.length} cotizaciones, ${technicians.length} técnicos`);

  const totalRevenue = quotations
    .filter((q) => q.status === "aprobada" || q.status === "facturada")
    .reduce((sum, q) => sum + q.total, 0);
  lines.push(`Ingresos totales (cotizaciones aprobadas/facturadas): $${totalRevenue.toLocaleString("es-MX")}`);

  if (tickets.length > 0) {
    lines.push(`\n=== LISTADO COMPLETO DE TICKETS ===`);
    tickets.forEach((t) => {
      const notes = t.notes && t.notes.length > 0
        ? ` | Notas: ${t.notes.map((n) => n.content).join("; ")}`
        : "";
      lines.push(
        `- [${t.id}] "${t.title}" | Cliente: ${t.clientName || "N/A"} | Técnico: ${t.technicianName || "Sin asignar"} | Estado: ${statusLabels[t.status] || t.status} | Prioridad: ${prioLabels[t.priority] || t.priority} | Fecha programada: ${t.scheduledDate} ${t.scheduledTime || ""} | Duración est.: ${t.estimatedDuration}min | Servicio: ${t.serviceType || "N/A"} | Ubicación: ${t.location || "N/A"} | Creado: ${t.createdAt}${notes}`
      );
    });
  }

  if (clients.length > 0) {
    lines.push(`\n=== LISTADO COMPLETO DE CLIENTES ===`);
    clients.forEach((c) => {
      const clientTickets = tickets.filter((t) => t.clientId === c.id);
      const clientQuotations = quotations.filter((q) => q.clientId === c.id);
      lines.push(
        `- [${c.id}] ${c.name} | Email: ${c.email || "N/A"} | Tel: ${c.phone || "N/A"} | Empresa: ${c.company || "N/A"} | Tickets: ${clientTickets.length} | Cotizaciones: ${clientQuotations.length}`
      );
    });
  }

  if (quotations.length > 0) {
    lines.push(`\n=== LISTADO COMPLETO DE COTIZACIONES ===`);
    quotations.forEach((q) => {
      const items = q.items.map((i) => `${i.description} x${i.quantity}=$${i.total}`).join("; ");
      lines.push(
        `- [${q.id}] #${q.number} "${q.title}" | Cliente: ${q.clientName || "N/A"} | Estado: ${q.status} | Total: $${q.total.toLocaleString("es-MX")} | Válido hasta: ${q.validUntil} | Ticket vinculado: ${q.ticketId || "N/A"} | Items: ${items || "N/A"}`
      );
    });
  }

  if (technicians.length > 0) {
    lines.push(`\n=== LISTADO COMPLETO DE TÉCNICOS ===`);
    technicians.forEach((t) => {
      const techTickets = tickets.filter((tk) => tk.technicianId === t.id);
      const activeTickets = techTickets.filter(
        (tk) => !["completado", "cancelado"].includes(tk.status)
      );
      lines.push(
        `- [${t.id}] ${t.name} | Especialidad: ${t.specialty} | Zona: ${t.zone} | Disponibilidad: ${t.availability} | Rating: ${t.rating}/5 | Trabajos completados: ${t.completedJobs} | Tickets activos: ${activeTickets.length}`
      );
    });
  }

  const overdueTickets = tickets.filter(
    (t) =>
      t.scheduledDate < today &&
      !["completado", "cancelado"].includes(t.status)
  );
  if (overdueTickets.length > 0) {
    lines.push(`\n=== TICKETS ATRASADOS (${overdueTickets.length}) ===`);
    overdueTickets.forEach((t) => {
      lines.push(
        `- ${t.id} "${t.title}" → Cliente: ${t.clientName} | Técnico: ${t.technicianName || "Sin asignar"} | Programado: ${t.scheduledDate} | Estado: ${statusLabels[t.status]}`
      );
    });
  }

  return lines.join("\n");
}
