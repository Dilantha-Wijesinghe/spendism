"use client";

import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { formatMoney } from "@/lib/money";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction, Category, AppSettings } from "@/lib/types";

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | undefined;
  settings: AppSettings;
  onEdit: () => void;
  onDelete: () => void;
  animationClass?: string;
}

export function TransactionItem({
  transaction,
  category,
  settings,
  onEdit,
  onDelete,
  animationClass,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-4 hover:bg-muted/40 rounded-xl transition-colors group",
        animationClass && `animate-[var(--animate-list-item)] ${animationClass}`
      )}
    >
      {category ? (
        <CategoryIcon category={category} size="md" />
      ) : (
        <span className="h-8 w-8 rounded-lg bg-muted shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {transaction.description || category?.name || "Transaction"}
          </p>
          {transaction.recurrence !== "none" && (
            <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(parseISO(transaction.date), "MMM d, yyyy")}
          {transaction.tags.length > 0 && (
            <span className="ml-2 text-muted-foreground/70">{transaction.tags.join(", ")}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "tabular-amount text-sm font-semibold",
            isIncome ? "text-sky-600" : "text-foreground"
          )}
        >
          {isIncome ? "+" : "-"}
          {formatMoney(transaction.amount, settings)}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">💸</span>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[220px] text-balance">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
