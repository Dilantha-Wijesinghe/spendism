import type { AppSettings } from "./types";

export function formatMoney(amount: number, settings: AppSettings): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: settings.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMoneyCompact(amount: number, settings: AppSettings): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${settings.currencySymbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${settings.currencySymbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return formatMoney(amount, settings);
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
] as const;
