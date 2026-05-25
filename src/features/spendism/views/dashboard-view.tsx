"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../components/stat-card";
import { BudgetCard } from "../components/budget-card";
import { TransactionItem, EmptyState } from "../components/transaction-list";
import {
  getPeriodSummary, getBudgetProgress, getMonthlyTrend, getNetBalance,
} from "@/lib/calculations";
import { formatMoneyCompact } from "@/lib/money";
import { Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import type { AppData, ViewId } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-[var(--shadow-card)] text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color }} className="tabular-amount">
          {entry.name}: {entry.value.toFixed(0)}
        </p>
      ))}
    </div>
  );
};

interface DashboardViewProps {
  data: AppData;
  onNavigate: (view: ViewId) => void;
  onAddTransaction: () => void;
  onEditBudget: (budgetId: string) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export function DashboardView({
  data,
  onNavigate,
  onAddTransaction,
  onEditBudget,
  onDeleteBudget,
}: DashboardViewProps) {
  const { transactions, budgets, categories, settings } = data;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthlyTransactions = useMemo(
    () => transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [transactions, year, month]
  );

  const monthlySummary = useMemo(() => getPeriodSummary(monthlyTransactions), [monthlyTransactions]);
  const netBalance = useMemo(() => getNetBalance(data), [data]);
  const budgetProgress = useMemo(
    () => getBudgetProgress(budgets, transactions, categories, year, month),
    [budgets, transactions, categories, year, month]
  );
  const trendData = useMemo(() => getMonthlyTrend(transactions, 6), [transactions]);
  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Desktop add button */}
      <div className="hidden sm:flex justify-end">
        <Button onClick={onAddTransaction} size="sm" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Add transaction
        </Button>
      </div>

      {/* Net Balance hero — indigo gradient */}
      <Card
        className="shadow-[var(--shadow-card)] relative overflow-hidden border-0"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(200 70% 30%))" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <CardContent className="p-5 relative">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">
            Net Balance
          </p>
          <p className="text-4xl font-bold tabular-amount mt-2 text-white">
            {netBalance < 0 ? "-" : ""}
            {formatMoneyCompact(Math.abs(netBalance), settings)}
          </p>
          <p className="text-xs text-white/60 mt-1">All-time income minus expenses</p>
        </CardContent>
      </Card>

      {/* Month stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Income"
          value={formatMoneyCompact(monthlySummary.totalIncome, settings)}
          icon={TrendingUp}
          variant="positive"
        />
        <StatCard
          label="Expenses"
          value={formatMoneyCompact(monthlySummary.totalExpenses, settings)}
          icon={TrendingDown}
          variant="negative"
        />
        <StatCard
          label="Net"
          value={formatMoneyCompact(monthlySummary.netBalance, settings)}
          icon={Wallet}
          variant={monthlySummary.netBalance >= 0 ? "default" : "negative"}
        />
        <StatCard
          label="Savings Rate"
          value={`${Math.max(0, monthlySummary.savingsRate).toFixed(0)}%`}
          icon={PiggyBank}
          variant="accent"
        />
      </div>

      {/* Trend chart + Budgets */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        {/* 6-Month Trend */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {trendData.some((d) => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={trendData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Income" fill="hsl(200 98% 18%)" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expenses" name="Expenses" fill="hsl(4 78% 50% / 0.7)" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[180px]">
                <p className="text-sm text-muted-foreground">No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budgets */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">Budgets</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onNavigate("budget")}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            {budgetProgress.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-muted-foreground">No budgets set</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 text-xs"
                  onClick={() => onNavigate("budget")}
                >
                  Set budgets →
                </Button>
              </div>
            ) : (
              budgetProgress.slice(0, 3).map((progress) => (
                <BudgetCard
                  key={progress.budget.id}
                  progress={progress}
                  settings={settings}
                  onEdit={() => onEditBudget(progress.budget.id)}
                  onDelete={() => onDeleteBudget(progress.budget.id)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader className="pb-0 pt-4 px-4 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onNavigate("transactions")}
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="px-2 pt-1 pb-2">
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add your first expense or income to get started."
            />
          ) : (
            <div className="divide-y divide-border/50">
              {recentTransactions.map((t, i) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                return (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    category={cat}
                    settings={settings}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    animationClass={`stagger-${Math.min(i + 1, 8)}`}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
