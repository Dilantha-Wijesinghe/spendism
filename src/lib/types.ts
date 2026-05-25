export type ViewId = "dashboard" | "transactions" | "budget" | "reports" | "settings";

export type TransactionType = "expense" | "income";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type BudgetPeriod = "monthly" | "yearly";
export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly" | "all";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | "both";
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  tags: string[];
  recurrence: RecurrenceType;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  year: number;
  month?: number;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  weekStartsOn: 0 | 1;
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: AppSettings;
  version: number;
}

export interface BudgetProgress {
  budget: Budget;
  category: Category;
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
}
