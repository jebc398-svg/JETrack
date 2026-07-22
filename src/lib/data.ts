import {
  Client,
  Technician,
  Ticket,
  Quotation,
  DashboardMetrics,
  Notification,
} from "./types";

export const mockClients: Client[] = [];

export const mockTechnicians: Technician[] = [
  {
    id: "t1",
    name: "Carlos Mendoza",
    email: "carlos@jetrack.mx",
    phone: "81-1111-2222",
    role: "technician",
    specialty: "Electrónica Industrial",
    zone: "Norte",
    availability: "disponible",
    rating: 4.8,
    completedJobs: 0,
    active: true,
  },
  {
    id: "t2",
    name: "Roberto García",
    email: "roberto@jetrack.mx",
    phone: "81-2222-3333",
    role: "technician",
    specialty: "Plomería",
    zone: "Sur",
    availability: "disponible",
    rating: 4.6,
    completedJobs: 0,
    active: true,
  },
  {
    id: "t3",
    name: "Miguel Torres",
    email: "miguel@jetrack.mx",
    phone: "81-3333-4444",
    role: "technician",
    specialty: "Climatización",
    zone: "Este",
    availability: "disponible",
    rating: 4.9,
    completedJobs: 0,
    active: true,
  },
  {
    id: "t4",
    name: "Juan Luis Pérez",
    email: "juan@jetrack.mx",
    phone: "81-4444-5555",
    role: "technician",
    specialty: "Mantenimiento General",
    zone: "Centro",
    availability: "disponible",
    rating: 4.5,
    completedJobs: 0,
    active: true,
  },
  {
    id: "t5",
    name: "Alejandro Ruiz",
    email: "alex@jetrack.mx",
    phone: "81-5555-6666",
    role: "technician",
    specialty: "Electricidad",
    zone: "Oeste",
    availability: "disponible",
    rating: 4.7,
    completedJobs: 0,
    active: true,
  },
];

export const mockTickets: Ticket[] = [];

export const mockQuotations: Quotation[] = [];

export const mockMetrics: DashboardMetrics = {
  totalTickets: 0,
  activeTickets: 0,
  completedToday: 0,
  pendingTickets: 0,
  revenue: 0,
  avgCompletionTime: 0,
  clientSatisfaction: 0,
  technicianUtilization: 0,
};

export const mockNotifications: Notification[] = [];

export const serviceTypes = [
  "Climatización",
  "Electricidad",
  "Plomería",
  "Mantenimiento",
  "Seguridad",
  "Eléctrico Solar",
  "Telecomunicaciones",
  "Carpintería",
  "Pintura",
  "Limpieza Industrial",
];
