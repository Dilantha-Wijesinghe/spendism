import type { AppData, AppSettings } from "./types";
import { DEFAULT_CATEGORIES } from "./categories";

const STORAGE_KEY = "spendism_data";
const CURRENT_VERSION = 1;

const DEFAULT_SETTINGS: AppSettings = {
  currency: "USD",
  currencySymbol: "$",
  weekStartsOn: 1,
};

const DEFAULT_DATA: AppData = {
  transactions: [],
  budgets: [],
  categories: DEFAULT_CATEGORIES,
  settings: DEFAULT_SETTINGS,
  version: CURRENT_VERSION,
};

export function loadData(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA, categories: [...DEFAULT_CATEGORIES] };
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.transactions) ||
      !Array.isArray(parsed.budgets) ||
      !Array.isArray(parsed.categories)
    ) {
      return { ...DEFAULT_DATA, categories: [...DEFAULT_CATEGORIES] };
    }
    return migrate(parsed as AppData);
  } catch {
    return { ...DEFAULT_DATA, categories: [...DEFAULT_CATEGORIES] };
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage might be full — fail silently
  }
}

export function clearData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function migrate(data: AppData): AppData {
  // Future migrations go here
  if (!data.version) {
    data.version = CURRENT_VERSION;
  }
  // Ensure default categories are present
  if (!data.categories || data.categories.length === 0) {
    data.categories = [...DEFAULT_CATEGORIES];
  }
  if (!data.settings) {
    data.settings = { ...DEFAULT_SETTINGS };
  }
  if (!data.transactions) data.transactions = [];
  if (!data.budgets) data.budgets = [];
  return data;
}
