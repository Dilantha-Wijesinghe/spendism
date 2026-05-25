import type { Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: "food", name: "Food & Dining", icon: "UtensilsCrossed", color: "orange", type: "expense", isDefault: true },
  { id: "transport", name: "Transport", icon: "Car", color: "blue", type: "expense", isDefault: true },
  { id: "housing", name: "Housing", icon: "Home", color: "purple", type: "expense", isDefault: true },
  { id: "health", name: "Health", icon: "HeartPulse", color: "red", type: "expense", isDefault: true },
  { id: "entertainment", name: "Entertainment", icon: "Tv", color: "pink", type: "expense", isDefault: true },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", color: "yellow", type: "expense", isDefault: true },
  { id: "education", name: "Education", icon: "GraduationCap", color: "indigo", type: "expense", isDefault: true },
  { id: "travel", name: "Travel", icon: "Plane", color: "sky", type: "expense", isDefault: true },
  { id: "utilities", name: "Utilities", icon: "Zap", color: "amber", type: "expense", isDefault: true },
  { id: "subscriptions", name: "Subscriptions", icon: "RefreshCw", color: "violet", type: "expense", isDefault: true },
  { id: "personal", name: "Personal Care", icon: "Sparkles", color: "rose", type: "expense", isDefault: true },
  // Income categories
  { id: "salary", name: "Salary", icon: "Banknote", color: "teal", type: "income", isDefault: true },
  { id: "freelance", name: "Freelance", icon: "Laptop", color: "green", type: "income", isDefault: true },
  { id: "investment", name: "Investment", icon: "TrendingUp", color: "emerald", type: "income", isDefault: true },
  { id: "gift", name: "Gift", icon: "Gift", color: "fuchsia", type: "income", isDefault: true },
  // Both
  { id: "other", name: "Other", icon: "CircleDot", color: "slate", type: "both", isDefault: true },
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  orange:  { bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-500" },
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  purple:  { bg: "bg-purple-100",  text: "text-purple-700",  dot: "bg-purple-500" },
  red:     { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500" },
  pink:    { bg: "bg-pink-100",    text: "text-pink-700",    dot: "bg-pink-500" },
  yellow:  { bg: "bg-yellow-100",  text: "text-yellow-700",  dot: "bg-yellow-500" },
  indigo:  { bg: "bg-indigo-100",  text: "text-indigo-700",  dot: "bg-indigo-500" },
  sky:     { bg: "bg-sky-100",     text: "text-sky-700",     dot: "bg-sky-500" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700",  dot: "bg-violet-500" },
  rose:    { bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-500" },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700",    dot: "bg-teal-600" },
  green:   { bg: "bg-green-100",   text: "text-green-700",   dot: "bg-green-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-700", dot: "bg-fuchsia-500" },
  slate:   { bg: "bg-slate-100",   text: "text-slate-700",   dot: "bg-slate-500" },
};

export const AVAILABLE_COLORS = Object.keys(CATEGORY_COLORS);

export const CATEGORY_ICON_NAMES = [
  "UtensilsCrossed", "Car", "Home", "HeartPulse", "Tv", "ShoppingBag",
  "GraduationCap", "Plane", "Zap", "RefreshCw", "Sparkles", "Banknote",
  "Laptop", "TrendingUp", "Gift", "CircleDot", "Coffee", "Music",
  "Gamepad2", "Camera", "Book", "Bike", "Bus", "Train", "Wallet",
  "CreditCard", "PiggyBank", "DollarSign", "Building", "Trees",
];
