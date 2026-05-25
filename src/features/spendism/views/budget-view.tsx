"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import { BudgetCard } from "../components/budget-card";
import { CategoryIcon } from "../components/category-icon";
import { getBudgetProgress } from "@/lib/calculations";
import { generateId } from "@/lib/ids";
import { Plus, Target } from "lucide-react";
import type { AppData, Budget, BudgetPeriod } from "@/lib/types";

interface BudgetViewProps {
  data: AppData;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  editingBudgetId?: string | null;
  onClearEditingBudget: () => void;
}

interface BudgetFormState {
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
}

export function BudgetView({
  data,
  onSaveBudget,
  onDeleteBudget,
  editingBudgetId,
  onClearEditingBudget,
}: BudgetViewProps) {
  const { budgets, transactions, categories, settings } = data;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetFormState>({
    categoryId: "",
    amount: "",
    period: "monthly",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progress = useMemo(
    () => getBudgetProgress(budgets, transactions, categories, year, month),
    [budgets, transactions, categories, year, month]
  );

  // Handle external edit trigger
  useMemo(() => {
    if (editingBudgetId) {
      const budget = budgets.find((b) => b.id === editingBudgetId);
      if (budget) openEdit(budget);
      onClearEditingBudget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingBudgetId]);

  function openAdd() {
    setEditingId(null);
    setForm({ categoryId: "", amount: "", period: "monthly" });
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(budget: Budget) {
    setEditingId(budget.id);
    setForm({
      categoryId: budget.categoryId,
      amount: String(budget.amount),
      period: budget.period,
    });
    setErrors({});
    setFormOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const parsed = parseFloat(form.amount);
    if (!form.categoryId) errs.categoryId = "Select a category";
    if (!form.amount || isNaN(parsed) || parsed <= 0) errs.amount = "Enter a valid amount";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const budget: Budget = {
      id: editingId ?? generateId(),
      categoryId: form.categoryId,
      amount: parseFloat(parsed.toFixed(2)),
      period: form.period,
      year,
      month: form.period === "monthly" ? month : undefined,
    };

    onSaveBudget(budget);
    setFormOpen(false);
  }

  const budgetedCategoryIds = new Set(
    budgets
      .filter((b) => {
        if (b.period === "yearly") return b.year === year;
        return b.year === year && b.month === month;
      })
      .map((b) => b.categoryId)
  );

  const availableCategories = categories.filter(
    (c) => c.type === "expense" || c.type === "both"
  );

  const overBudgetCount = progress.filter((p) => p.isOverBudget).length;
  const nearLimitCount = progress.filter((p) => p.isNearLimit).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Budget</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {now.toLocaleString("default", { month: "long" })} {year}
          </p>
        </div>
        {/* Desktop add button — mobile uses FAB */}
        <Button onClick={openAdd} size="sm" className="gap-2 hidden sm:flex">
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Alert summary */}
      {(overBudgetCount > 0 || nearLimitCount > 0) && (
        <div className="flex gap-2 flex-wrap">
          {overBudgetCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
              <p className="text-xs font-medium text-destructive">
                {overBudgetCount} {overBudgetCount === 1 ? "category" : "categories"} over budget
              </p>
            </div>
          )}
          {nearLimitCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <p className="text-xs font-medium text-amber-700">
                {nearLimitCount} {nearLimitCount === 1 ? "category" : "categories"} nearing limit
              </p>
            </div>
          )}
        </div>
      )}

      {/* Budget cards */}
      {progress.length === 0 ? (
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">No budgets set</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[220px] text-balance">
              Set spending limits for categories to track your progress.
            </p>
            <Button onClick={openAdd} size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Add your first budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {progress.map((p) => (
            <BudgetCard
              key={p.budget.id}
              progress={p}
              settings={settings}
              onEdit={() => openEdit(p.budget)}
              onDelete={() => onDeleteBudget(p.budget.id)}
            />
          ))}
        </div>
      )}

      {/* Budget form — bottom sheet on mobile, centered dialog on desktop */}
      <BottomSheet open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <BottomSheetContent>
          <div className="px-6 pb-6">
            <BottomSheetHeader className="mb-4">
              <BottomSheetTitle>
                {editingId ? "Edit Budget" : "Add Budget"}
              </BottomSheetTitle>
            </BottomSheetHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger className={`h-11 ${errors.categoryId ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => {
                      const alreadyBudgeted = !editingId && budgetedCategoryIds.has(cat.id);
                      return (
                        <SelectItem key={cat.id} value={cat.id} disabled={alreadyBudgeted}>
                          <div className="flex items-center gap-2">
                            <CategoryIcon category={cat} size="sm" />
                            {cat.name}
                            {alreadyBudgeted && (
                              <span className="text-muted-foreground text-[10px]">(budgeted)</span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive">{errors.categoryId}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget-amount">Limit ({settings.currencySymbol})</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className={`tabular-amount h-11 text-lg font-semibold ${errors.amount ? "border-destructive" : ""}`}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Period</Label>
                <div className="flex rounded-xl bg-muted p-1 gap-1">
                  {(["monthly", "yearly"] as BudgetPeriod[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, period: p }))}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                        form.period === p
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p === "monthly" ? "Monthly" : "Yearly"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-12">
                  {editingId ? "Save Changes" : "Add Budget"}
                </Button>
              </div>
            </form>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}
