import Papa from "papaparse";
import { z } from "zod";
import type { Transaction, AppData } from "./types";
import { generateId } from "./ids";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function isValidISODate(s: string): boolean {
  return !isNaN(Date.parse(s));
}

const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(["expense", "income"]),
  amount: z.number().positive().max(999_999_999),
  categoryId: z.string().min(1).max(100),
  description: z.string().max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string().max(50)).max(10),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const budgetSchema = z.object({
  id: z.string(),
  categoryId: z.string().min(1).max(100),
  amount: z.number().positive().max(999_999_999),
  period: z.enum(["monthly", "yearly"]),
  year: z.number().int().min(1900).max(2200),
  month: z.number().int().min(0).max(11).optional(),
});

const categorySchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  icon: z.string().max(100),
  color: z.string().max(50),
  type: z.enum(["expense", "income", "both"]),
  isDefault: z.boolean(),
});

const settingsSchema = z.object({
  currency: z.string().min(1).max(10),
  currencySymbol: z.string().min(1).max(10),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
});

const appDataSchema = z.object({
  transactions: z.array(transactionSchema).max(100_000),
  budgets: z.array(budgetSchema).max(10_000),
  categories: z.array(categorySchema).max(1_000),
  settings: settingsSchema,
  version: z.number().int().positive(),
});

const TRANSACTION_HEADERS = [
  "id", "type", "amount", "categoryId", "description",
  "date", "tags", "recurrence", "createdAt", "updatedAt",
];

export function exportTransactionsCSV(transactions: Transaction[]): void {
  const rows = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    categoryId: t.categoryId,
    description: t.description,
    date: t.date,
    tags: t.tags.join(";"),
    recurrence: t.recurrence,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  const csv = Papa.unparse(rows, { columns: TRANSACTION_HEADERS });
  downloadFile(csv, `spendism-transactions-${formatDateForFilename()}.csv`, "text/csv");
}

export function exportFullDataJSON(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `spendism-backup-${formatDateForFilename()}.json`, "application/json");
}

export function importTransactionsCSV(
  file: File
): Promise<{ transactions: Transaction[]; errors: string[] }> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const errors: string[] = [];
        const transactions: Transaction[] = [];

        const VALID_RECURRENCES = ["none", "daily", "weekly", "monthly", "yearly"];

        result.data.forEach((row, i) => {
          const amount = parseFloat(row.amount);
          if (isNaN(amount) || amount <= 0 || amount > 999_999_999) {
            errors.push(`Row ${i + 2}: invalid amount`);
            return;
          }
          if (!["expense", "income"].includes(row.type)) {
            errors.push(`Row ${i + 2}: invalid type (must be "expense" or "income")`);
            return;
          }
          if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
            errors.push(`Row ${i + 2}: invalid date format (must be YYYY-MM-DD)`);
            return;
          }
          if (row.recurrence && !VALID_RECURRENCES.includes(row.recurrence)) {
            errors.push(`Row ${i + 2}: invalid recurrence`);
            return;
          }

          const now = new Date().toISOString();
          transactions.push({
            id: row.id || generateId(),
            type: row.type as "expense" | "income",
            amount,
            categoryId: (row.categoryId || "other").slice(0, 100),
            description: (row.description || "").slice(0, 500),
            date: row.date,
            tags: (row.tags ? row.tags.split(";").filter(Boolean) : [])
              .map((t) => t.trim().slice(0, 50))
              .slice(0, 10),
            recurrence: (VALID_RECURRENCES.includes(row.recurrence) ? row.recurrence : "none") as Transaction["recurrence"],
            createdAt: (row.createdAt && isValidISODate(row.createdAt)) ? row.createdAt : now,
            updatedAt: (row.updatedAt && isValidISODate(row.updatedAt)) ? row.updatedAt : now,
          });
        });

        resolve({ transactions, errors });
      },
      error: (err) => {
        resolve({ transactions: [], errors: [err.message] });
      },
    });
  });
}

export function importFullDataJSON(file: File): Promise<AppData | null> {
  if (file.size > MAX_FILE_SIZE) return Promise.resolve(null);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const result = appDataSchema.safeParse(raw);
        resolve(result.success ? result.data : null);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDateForFilename(): string {
  return new Date().toISOString().slice(0, 10);
}
