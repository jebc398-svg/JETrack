import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function formatDate(date: Date | string, timezone?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const tz = timezone || (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Mexico_City");
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: tz,
  });
}

export function formatDateTime(date: Date | string, timezone?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const tz = timezone || (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Mexico_City");
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
