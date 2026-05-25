"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionItem, EmptyState } from "../components/transaction-list";
import { TimeFilter } from "../components/time-filter";
import { filterByPeriod } from "@/lib/calculations";
import { Plus, Search, X } from "lucide-react";
import type { Transaction, AppData, TimePeriod, TransactionType } from "@/lib/types";

interface TransactionsViewProps {
  data: AppData;
  onAddTransaction: (defaultType?: TransactionType) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionsView({
  data,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsViewProps) {
  const { transactions, categories, settings } = data;
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<TimePeriod>("monthly");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = filterByPeriod(transactions, period, settings.weekStartsOn);

    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          categories.find((c) => c.id === t.categoryId)?.name.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, period, typeFilter, categoryFilter, search, categories, settings.weekStartsOn]);

  const hasFilters = typeFilter !== "all" || categoryFilter !== "all" || search.trim();

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Transactions</h2>
        {/* Desktop add button — mobile uses FAB */}
        <Button onClick={() => onAddTransaction()} size="sm" className="gap-2 hidden sm:flex">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Filters — sticky so they stay visible while scrolling */}
      <Card className="shadow-[var(--shadow-card)] sticky top-[73px] sm:top-0 z-30 bg-card/95 backdrop-blur-sm">
        <CardHeader className="p-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Period pills — full width on mobile, inline with dropdowns on sm+ */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="overflow-x-auto no-scrollbar flex-1">
              <TimeFilter value={period} onChange={setPeriod} className="w-max" />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="h-8 text-xs w-[100px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 text-xs w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              <button onClick={clearFilters} className="text-primary hover:underline">
                Clear filters
              </button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Transaction list */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="p-2">
          {filtered.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No matching transactions" : "No transactions yet"}
              description={
                hasFilters
                  ? "Try adjusting your filters."
                  : "Start by adding an expense or income."
              }
              action={
                !hasFilters ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddTransaction("income")}
                      className="gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Income
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAddTransaction("expense")}
                      className="gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Expense
                    </Button>
                  </div>
                ) : undefined
              }
            />
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((t, i) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                return (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    category={cat}
                    settings={settings}
                    onEdit={() => onEditTransaction(t)}
                    onDelete={() => onDeleteTransaction(t.id)}
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
