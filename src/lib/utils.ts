import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBudgetRange(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not specified";
  if (min && !max) return `${formatCurrency(min)}` + "+";
  if (!min && max) return `Up to ${formatCurrency(max)}`;
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  return "Not specified"; // fallback
}
export function getEnumDisplayValue(value: string): string {
  switch (value) {
    case "ZeroToThreeMonths":
      return "0-3 months";
    case "ThreeToSixMonths":
      return "3-6 months";
    case "MoreThanSixMonths":
      return ">6 months";
    case "WalkIn":
      return "Walk-in";
    default:
      return value.replace(/([A-Z])/g, " $1").trim();
  }
}
