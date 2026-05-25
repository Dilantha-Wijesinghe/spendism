import Papa from "papaparse";
import type { Transaction, AppData } from "./types";
import { generateId } from "./ids";

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

        result.data.forEach((row, i) => {
          const amount = parseFloat(row.amount);
          if (isNaN(amount) || amount <= 0) {
            errors.push(`Row ${i + 2}: invalid amount "${row.amount}"`);
            return;
          }
          if (!["expense", "income"].includes(row.type)) {
            errors.push(`Row ${i + 2}: invalid type "${row.type}"`);
            return;
          }
          if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
            errors.push(`Row ${i + 2}: invalid date "${row.date}"`);
            return;
          }

          transactions.push({
            id: row.id || generateId(),
            type: row.type as "expense" | "income",
            amount,
            categoryId: row.categoryId || "other",
            description: row.description || "",
            date: row.date,
            tags: row.tags ? row.tags.split(";").filter(Boolean) : [],
            recurrence: (row.recurrence as Transaction["recurrence"]) || "none",
            createdAt: row.createdAt || new Date().toISOString(),
            updatedAt: row.updatedAt || new Date().toISOString(),
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
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        resolve(data);
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
