"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "./category-icon";
import type { BudgetProgress } from "@/lib/types";
import type { AppSettings } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BudgetCardProps {
  progress: BudgetProgress;
  settings: AppSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function BudgetCard({ progress, settings, onEdit, onDelete, className }: BudgetCardProps) {
  const { category, spent, budget, percentage, isOverBudget, isNearLimit } = progress;
  const clampedPct = Math.min(percentage, 100);

  const ringColor = isOverBudget
    ? "stroke-destructive"
    : isNearLimit
    ? "stroke-amber-500"
    : "stroke-primary";

  const statusColor = isOverBudget
    ? "text-destructive"
    : isNearLimit
    ? "text-amber-600"
    : "text-muted-foreground";

  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clampedPct / 100) * circ;

  return (
    <Card
      className={cn(
        "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200",
        isOverBudget && "border-destructive/30",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Ring progress */}
          <div className="relative shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
              <circle
                cx="32" cy="32" r={r}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="5"
              />
              <circle
                cx="32" cy="32" r={r}
                fill="none"
                className={ringColor}
                strokeWidth="5"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <CategoryIcon category={category} size="sm" />
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{category.name}</p>
                <p className={cn("text-xs font-medium mt-0.5", statusColor)}>
                  {isOverBudget
                    ? `Over by ${formatMoney(spent - budget.amount, settings)}`
                    : isNearLimit
                    ? `${formatMoney(progress.remaining, settings)} left`
                    : `${clampedPct.toFixed(0)}% used`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onEdit}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="tabular-amount">{formatMoney(spent, settings)}</span>
                <span className="tabular-amount">{formatMoney(budget.amount, settings)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isOverBudget ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-primary"
                  )}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
              {budget.period === "monthly" ? "Monthly" : "Yearly"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
