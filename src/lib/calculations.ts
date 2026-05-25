import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  isWithinInterval, parseISO, format, subMonths,
} from "date-fns";
import type {
  Transaction, Budget, Category, AppData,
  BudgetProgress, MonthlyTrendPoint, CategoryBreakdown,
  PeriodSummary, TimePeriod,
} from "./types";

export function getDateRange(period: TimePeriod, weekStartsOn: 0 | 1 = 1): { start: Date; end: Date } | null {
  const now = new Date();
  switch (period) {
    case "daily":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "weekly":
      return { start: startOfWeek(now, { weekStartsOn }), end: endOfWeek(now, { weekStartsOn }) };
    case "monthly":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "yearly":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "all":
      return null;
  }
}

export function filterByPeriod(
  transactions: Transaction[],
  period: TimePeriod,
  weekStartsOn: 0 | 1 = 1
): Transaction[] {
  const range = getDateRange(period, weekStartsOn);
  if (!range) return transactions;
  return transactions.filter((t) => {
    const date = parseISO(t.date);
    return isWithinInterval(date, range);
  });
}

export function getPeriodSummary(transactions: Transaction[]): PeriodSummary {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  return {
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate,
    transactionCount: transactions.length,
  };
}

export function getBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number
): BudgetProgress[] {
  return budgets
    .filter((b) => {
      if (b.period === "yearly") return b.year === year;
      return b.year === year && b.month === month;
    })
    .map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      if (!category) return null;

      const relevant = transactions.filter((t) => {
        const d = parseISO(t.date);
        if (budget.period === "monthly") {
          return t.categoryId === budget.categoryId &&
            t.type === "expense" &&
            d.getFullYear() === year &&
            d.getMonth() === month;
        }
        return t.categoryId === budget.categoryId &&
          t.type === "expense" &&
          d.getFullYear() === year;
      });

      const spent = relevant.reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        budget,
        category,
        spent,
        percentage,
        remaining: budget.amount - spent,
        isOverBudget: spent > budget.amount,
        isNearLimit: percentage >= 80 && percentage <= 100,
      } satisfies BudgetProgress;
    })
    .filter((x): x is BudgetProgress => x !== null);
}

export function getMonthlyTrend(transactions: Transaction[], months = 6): MonthlyTrendPoint[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(now, months - 1 - i);
    const label = format(date, "MMM");
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthTx = transactions.filter((t) => {
      const d = parseISO(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { month: label, income, expenses, net: income - expenses };
  });
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: "expense" | "income" = "expense"
): CategoryBreakdown[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const grouped = filtered.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return null;
      return {
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        count: filtered.filter((t) => t.categoryId === categoryId).length,
      } satisfies CategoryBreakdown;
    })
    .filter((x): x is CategoryBreakdown => x !== null)
    .sort((a, b) => b.amount - a.amount);
}

export function getNetBalance(data: AppData): number {
  return data.transactions.reduce((sum, t) => {
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
}
