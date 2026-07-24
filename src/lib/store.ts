import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Client,
  Technician,
  Ticket,
  Quotation,
  Notification,
  SystemUser,
  User,
  UserRole,
} from "./types";
import {
  mockTechnicians,
} from "./data";

export interface TicketFilters {
  status: string;
  technician: string;
  client: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  priority: string;
}

export interface ModalState {
  [key: string]: { open: boolean; data?: any };
}

interface AppState {
  isAuthenticated: boolean;
  user: User;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  activePage: string;

  tickets: Ticket[];
  clients: Client[];
  technicians: Technician[];
  quotations: Quotation[];
  notifications: Notification[];
  systemUsers: SystemUser[];

  ticketFilters: TicketFilters;
  modals: ModalState;

  login: (email: string, name: string, role: string, userId?: string) => void;
  logout: () => void;
  setActivePage: (page: string) => void;
  toggleSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;

  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;

  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addTechnician: (tech: Technician) => void;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;

  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  addSystemUser: (user: SystemUser) => void;
  updateSystemUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteSystemUser: (id: string) => void;
  toggleSystemUserActive: (id: string) => void;

  setTicketFilters: (filters: Partial<TicketFilters>) => void;
  resetTicketFilters: () => void;

  openModal: (name: string, data?: any) => void;
  closeModal: (name: string) => void;
}

const emptyUser: User = {
  id: "",
  name: "",
  email: "",
  role: "client" as UserRole,
  avatar: undefined,
  phone: "",
  active: false,
};

const defaultFilters: TicketFilters = {
  status: "",
  technician: "",
  client: "",
  dateFrom: "",
  dateTo: "",
  search: "",
  priority: "",
};

const SESSION_KEY = "jetrack_session";

function loadSession(): { user: User; isAuthenticated: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.user?.id && data?.isAuthenticated) return data;
    return null;
  } catch {
    return null;
  }
}

function saveSession(user: User) {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user, isAuthenticated: true })
    );
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("jetrack_remember");
  } catch {}
}

const initialSession = typeof window !== "undefined" ? loadSession() : null;

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      isAuthenticated: initialSession?.isAuthenticated ?? false,
      user: initialSession?.user ?? { ...emptyUser },

      sidebarOpen: true,
      mobileSidebarOpen: false,
      activePage: "dashboard",

      tickets: [],
      clients: [],
      technicians: mockTechnicians,
      quotations: [],
      notifications: [],
      systemUsers: [
        { id: "u1", name: "María López", email: "maria@jetrack.mx", password: "admin123", role: "admin", active: true, phone: "81-1234-5678" },
        { id: "u2", name: "Carlos Mendoza", email: "carlos@jetrack.mx", password: "tech123", role: "technician", active: true, phone: "81-2345-6789" },
        { id: "u3", name: "Roberto García", email: "roberto@jetrack.mx", password: "tech123", role: "technician", active: true, phone: "81-3456-7890" },
        { id: "u4", name: "Ana Torres", email: "ana@jetrack.mx", password: "super123", role: "supervisor", active: true, phone: "81-4567-8901" },
      ],

      ticketFilters: { ...defaultFilters },
      modals: {},

      login: (email, name, role, userId) =>
        set((state) => {
          const id = userId || email.split("@")[0];
          state.isAuthenticated = true;
          state.user = {
            id,
            name,
            email,
            role: role as UserRole,
            avatar: undefined,
            phone: "",
            active: true,
          };
          state.activePage = "dashboard";
          saveSession(state.user);
        }),

      logout: () =>
        set((state) => {
          state.isAuthenticated = false;
          state.user = { ...emptyUser };
          state.activePage = "dashboard";
          state.mobileSidebarOpen = false;
          state.modals = {};
          clearSession();
        }),

      setActivePage: (page) =>
        set((state) => {
          state.activePage = page;
          state.mobileSidebarOpen = false;
        }),

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      setMobileSidebar: (open) =>
        set((state) => {
          state.mobileSidebarOpen = open;
        }),

      addTicket: (ticket) =>
        set((state) => {
          state.tickets.push(ticket);
        }),

      updateTicket: (id, updates) =>
        set((state) => {
          const ticket = state.tickets.find((t) => t.id === id);
          if (ticket) {
            Object.assign(ticket, updates);
            ticket.updatedAt = new Date().toISOString();
          }
        }),

      deleteTicket: (id) =>
        set((state) => {
          state.tickets = state.tickets.filter((t) => t.id !== id);
        }),

      addClient: (client) =>
        set((state) => {
          state.clients.push(client);
        }),

      updateClient: (id, updates) =>
        set((state) => {
          const client = state.clients.find((c) => c.id === id);
          if (client) {
            Object.assign(client, updates);
          }
        }),

      deleteClient: (id) =>
        set((state) => {
          state.clients = state.clients.filter((c) => c.id !== id);
        }),

      addTechnician: (tech) =>
        set((state) => {
          state.technicians.push(tech);
        }),

      updateTechnician: (id, updates) =>
        set((state) => {
          const tech = state.technicians.find((t) => t.id === id);
          if (tech) {
            Object.assign(tech, updates);
          }
        }),

      deleteTechnician: (id) =>
        set((state) => {
          state.technicians = state.technicians.filter((t) => t.id !== id);
        }),

      addQuotation: (quotation) =>
        set((state) => {
          state.quotations.push(quotation);
        }),

      updateQuotation: (id, updates) =>
        set((state) => {
          const quotation = state.quotations.find((q) => q.id === id);
          if (quotation) {
            Object.assign(quotation, updates);
            quotation.updatedAt = new Date().toISOString();
          }
        }),

      deleteQuotation: (id) =>
        set((state) => {
          state.quotations = state.quotations.filter((q) => q.id !== id);
        }),

      markNotificationRead: (id) =>
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          if (notif) {
            notif.read = true;
          }
        }),

    markAllNotificationsRead: () =>
      set((state) => {
        state.notifications.forEach((n) => {
          n.read = true;
        });
      }),

    addSystemUser: (user) =>
      set((state) => {
        state.systemUsers.push(user);
      }),

    updateSystemUser: (id, updates) =>
      set((state) => {
        const user = state.systemUsers.find((u) => u.id === id);
        if (user) Object.assign(user, updates);
      }),

    deleteSystemUser: (id) =>
      set((state) => {
        state.systemUsers = state.systemUsers.filter((u) => u.id !== id);
      }),

    toggleSystemUserActive: (id) =>
      set((state) => {
        const user = state.systemUsers.find((u) => u.id === id);
        if (user) user.active = !user.active;
      }),

    setTicketFilters: (filters) =>
        set((state) => {
          Object.assign(state.ticketFilters, filters);
        }),

      resetTicketFilters: () =>
        set((state) => {
          state.ticketFilters = { ...defaultFilters };
        }),

      openModal: (name, data) =>
        set((state) => {
          state.modals[name] = { open: true, data };
        }),

      closeModal: (name) =>
        set((state) => {
          state.modals[name] = { open: false };
        }),
    })),
    {
      name: "jetrack-data",
      partialize: (state) => ({
        tickets: state.tickets,
        clients: state.clients,
        technicians: state.technicians,
        quotations: state.quotations,
        notifications: state.notifications,
        systemUsers: state.systemUsers,
      }),
    }
  )
);
