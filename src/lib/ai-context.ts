import type { Ticket, Client, Quotation, Technician } from "./types";

export function buildDataContext(payload: {
  tickets: Ticket[];
  clients: Client[];
  quotations: Quotation[];
  technicians: Technician[];
}): string {
  const { tickets, clients, quotations, technicians } = payload;

  const statusCount: Record<string, number> = {};
  tickets.forEach((t) => {
    statusCount[t.status] = (statusCount[t.status] || 0) + 1;
  });

  const priorityCount: Record<string, number> = {};
  tickets.forEach((t) => {
    priorityCount[t.priority] = (priorityCount[t.priority] || 0) + 1;
  });

  const techLoad: Record<string, number> = {};
  tickets.forEach((t) => {
    if (t.technicianName) {
      techLoad[t.technicianName] = (techLoad[t.technicianName] || 0) + 1;
    }
  });

  const clientTicketCount: Record<string, number> = {};
  tickets.forEach((t) => {
    if (t.clientName) {
      clientTicketCount[t.clientName] =
        (clientTicketCount[t.clientName] || 0) + 1;
    }
  });

  const qStatusCount: Record<string, number> = {};
  quotations.forEach((q) => {
    qStatusCount[q.status] = (qStatusCount[q.status] || 0) + 1;
  });

  const today = new Date().toISOString().split("T")[0];
  const overdueTickets = tickets.filter(
    (t) =>
      t.scheduledDate < today &&
      !["completado", "cancelado"].includes(t.status)
  );
  const completedToday = tickets.filter(
    (t) => t.completedAt && t.completedAt.startsWith(today)
  );

  const totalRevenue = quotations
    .filter((q) => q.status === "aprobada" || q.status === "facturada")
    .reduce((sum, q) => sum + q.total, 0);

  const lines: string[] = [];

  lines.push(`RESUMEN GENERAL:`);
  lines.push(`- Total tickets: ${tickets.length}`);
  lines.push(`- Total clientes: ${clients.length}`);
  lines.push(`- Total cotizaciones: ${quotations.length}`);
  lines.push(`- Total técnicos: ${technicians.length}`);
  lines.push(`- Ingresos por cotizaciones aprobadas/facturadas: $${totalRevenue.toLocaleString("es-MX")}`);

  lines.push(`\nTICKETS POR ESTADO:`);
  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    scheduled: "Programado",
    en_camino: "En camino",
    iniciado: "Iniciado",
    pausado: "Pausado",
    completado: "Completado",
    cancelado: "Cancelado",
  };
  Object.entries(statusCount).forEach(([status, count]) => {
    lines.push(`- ${statusLabels[status] || status}: ${count}`);
  });

  lines.push(`\nTICKETS POR PRIORIDAD:`);
  const prioLabels: Record<string, string> = {
    urgente: "Urgente",
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  };
  Object.entries(priorityCount).forEach(([prio, count]) => {
    lines.push(`- ${prioLabels[prio] || prio}: ${count}`);
  });

  if (Object.keys(techLoad).length > 0) {
    lines.push(`\nCARGA POR TÉCNICO (tickets asignados):`);
    Object.entries(techLoad)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        lines.push(`- ${name}: ${count} tickets`);
      });
  }

  if (Object.keys(clientTicketCount).length > 0) {
    lines.push(`\nCLIENTES CON MÁS ACTIVIDAD:`);
    Object.entries(clientTicketCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([name, count]) => {
        lines.push(`- ${name}: ${count} tickets`);
      });
  }

  if (overdueTickets.length > 0) {
    lines.push(`\nTICKETS ATRASADOS (${overdueTickets.length}):`);
    overdueTickets.slice(0, 5).forEach((t) => {
      lines.push(
        `- ${t.id} "${t.title}" — programado para ${t.scheduledDate} [${statusLabels[t.status] || t.status}]`
      );
    });
  }

  if (completedToday.length > 0) {
    lines.push(`\nCOMPLETADOS HOY: ${completedToday.length}`);
  }

  lines.push(`\nCOTIZACIONES POR ESTADO:`);
  Object.entries(qStatusCount).forEach(([status, count]) => {
    lines.push(`- ${status}: ${count}`);
  });

  const techDetails = technicians.map(
    (t) =>
      `- ${t.name} (${t.specialty}, zona ${t.zone}, rating ${t.rating}, ${t.availability})`
  );
  if (techDetails.length > 0) {
    lines.push(`\nTÉCNICOS DISPONIBLES:`);
    techDetails.forEach((l) => lines.push(l));
  }

  return lines.join("\n");
}
