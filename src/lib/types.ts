export type UserRole = "admin" | "supervisor" | "technician" | "client";

export type TicketStatus =
  | "pending"
  | "scheduled"
  | "en_camino"
  | "iniciado"
  | "pausado"
  | "completado"
  | "cancelado";

export type QuotationStatus =
  | "borrador"
  | "enviada"
  | "aprobada"
  | "rechazada"
  | "facturada";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface Technician extends User {
  specialty: string;
  zone: string;
  availability: "disponible" | "en_trabajo" | "fuera";
  rating: number;
  completedJobs: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: "baja" | "media" | "alta" | "urgente";
  clientId: string;
  clientName: string;
  technicianId?: string;
  technicianName?: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  location: string;
  estimatedDuration: number;
  actualDuration?: number;
  photos: TicketPhoto[];
  signature?: string;
  notes: TicketNote[];
  quotationId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TicketPhoto {
  id: string;
  url: string;
  type: "antes" | "durante" | "despues";
  caption?: string;
  uploadedAt: string;
}

export interface TicketNote {
  id: string;
  content: string;
  author: string;
  authorRole: UserRole;
  createdAt: string;
  isInternal: boolean;
}

export interface Quotation {
  id: string;
  number: string;
  title: string;
  status: QuotationStatus;
  clientId: string;
  clientName: string;
  technicianId?: string;
  technicianName?: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes?: string;
  ticketId?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  technicianId: string;
  technicianName: string;
  clientId: string;
  clientName: string;
  ticketId: string;
  status: TicketStatus;
  color: string;
}

export interface DashboardMetrics {
  totalTickets: number;
  activeTickets: number;
  completedToday: number;
  pendingTickets: number;
  revenue: number;
  avgCompletionTime: number;
  clientSatisfaction: number;
  technicianUtilization: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}
