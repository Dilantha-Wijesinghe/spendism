"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../components/stat-card";
import { CategoryIcon } from "../components/category-icon";
import { getMonthlyTrend, getCategoryBreakdown, getPeriodSummary, filterByPeriod } from "@/lib/calculations";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { TrendingUp, TrendingDown, PiggyBank, Activity } from "lucide-react";
import { TimeFilter } from "../components/time-filter";
import type { AppData, TimePeriod } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(200 98% 18%)",
  "hsl(27 94% 66%)",
  "hsl(108 27% 48%)",
  "hsl(166 26% 55%)",
  "hsl(200 70% 35%)",
  "hsl(4 78% 50%)",
  "hsl(45 90% 50%)",
  "hsl(200 50% 45%)",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-[var(--shadow-card)] text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color }} className="tabular-amount">
          {entry.name}: ${entry.value.toFixed(0)}
        </p>
      ))}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PieTooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-[var(--shadow-card)] text-xs">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="tabular-amount text-foreground">${payload[0].value.toFixed(2)}</p>
      <p className="text-muted-foreground">{payload[0].payload.percentage.toFixed(1)}%</p>
    </div>
  );
};

interface ReportsViewProps {
  data: AppData;
}

export function ReportsView({ data }: ReportsViewProps) {
  const { transactions, categories, settings } = data;
  const [period, setPeriod] = useState<TimePeriod>("monthly");
  const [breakdownType, setBreakdownType] = useState<"expense" | "income">("expense");

  const filteredTransactions = useMemo(
    () => filterByPeriod(transactions, period, settings.weekStartsOn),
    [transactions, period, settings.weekStartsOn]
  );

  const summary = useMemo(() => getPeriodSummary(filteredTransactions), [filteredTransactions]);
  const trendData = useMemo(() => getMonthlyTrend(transactions, 6), [transactions]);
  const breakdown = useMemo(
    () => getCategoryBreakdown(filteredTransactions, categories, breakdownType),
    [filteredTransactions, categories, breakdownType]
  );

  const pieData = breakdown.slice(0, 8).map((b) => ({
    name: b.category.name,
    value: b.amount,
    percentage: b.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight">Reports</h2>
        <div className="overflow-x-auto no-scrollbar">
          <TimeFilter value={period} onChange={setPeriod} className="w-max" />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Income"
          value={formatMoneyCompact(summary.totalIncome, settings)}
          icon={TrendingUp}
          variant="positive"
        />
        <StatCard
          label="Expenses"
          value={formatMoneyCompact(summary.totalExpenses, settings)}
          icon={TrendingDown}
          variant="negative"
        />
        <StatCard
          label="Net"
          value={formatMoneyCompact(summary.netBalance, settings)}
          icon={Activity}
          variant={summary.netBalance >= 0 ? "default" : "negative"}
        />
        <StatCard
          label="Savings Rate"
          value={`${Math.max(0, summary.savingsRate).toFixed(1)}%`}
          icon={PiggyBank}
          variant="accent"
        />
      </div>

      {/* Trend chart */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">6-Month Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {trendData.some((d) => d.income > 0 || d.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="income" name="Income" fill="hsl(200 98% 18%)" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" name="Expenses" fill="hsl(4 78% 50% / 0.7)" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-sm text-muted-foreground">No data to display</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Category Breakdown</CardTitle>
              <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBreakdownType(t)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                      breakdownType === t
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "expense" ? "Expenses" : "Income"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-sm text-muted-foreground">
                  No {breakdownType} data for this period
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipContent />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top categories table */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">
              Top {breakdownType === "expense" ? "Expenses" : "Income Sources"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div className="space-y-2">
                {breakdown.slice(0, 7).map((item, i) => (
                  <div
                    key={item.category.id}
                    className={cn(
                      "flex items-center gap-3 animate-[var(--animate-list-item)]",
                      `stagger-${Math.min(i + 1, 8)}`
                    )}
                  >
                    <CategoryIcon category={item.category} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xs font-medium truncate">{item.category.name}</p>
                        <span className="tabular-amount text-xs font-semibold shrink-0">
                          {formatMoney(item.amount, settings)}
                        </span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.percentage.toFixed(1)}% · {item.count} transactions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
