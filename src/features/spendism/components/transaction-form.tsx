"use client";

import { useState, useEffect } from "react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/ids";
import { CATEGORY_COLORS } from "@/lib/categories";
import { CategoryIcon } from "./category-icon";
import type { Transaction, Category, RecurrenceType, TransactionType } from "@/lib/types";
import { format } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  initialTransaction?: Transaction | null;
  defaultType?: TransactionType;
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function TransactionForm({
  open,
  onClose,
  onSave,
  categories,
  initialTransaction,
  defaultType = "expense",
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialTransaction;

  useEffect(() => {
    if (open) {
      if (initialTransaction) {
        setType(initialTransaction.type);
        setAmount(String(initialTransaction.amount));
        setCategoryId(initialTransaction.categoryId);
        setDescription(initialTransaction.description);
        setDate(initialTransaction.date);
        setRecurrence(initialTransaction.recurrence);
        setTags(initialTransaction.tags.join(", "));
      } else {
        setType(defaultType);
        setAmount("");
        setCategoryId("");
        setDescription("");
        setDate(format(new Date(), "yyyy-MM-dd"));
        setRecurrence("none");
        setTags("");
      }
      setErrors({});
    }
  }, [open, initialTransaction, defaultType]);

  const availableCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  function validate() {
    const errs: Record<string, string> = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) errs.amount = "Enter a valid amount";
    if (!categoryId) errs.categoryId = "Select a category";
    if (!date) errs.date = "Select a date";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: initialTransaction?.id ?? generateId(),
      type,
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      categoryId,
      description: description.trim(),
      date,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      recurrence,
      createdAt: initialTransaction?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(transaction);
    onClose();
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <BottomSheet open={open} onOpenChange={(v) => !v && onClose()}>
      <BottomSheetContent>
        <div className="px-6 pb-6">
          <BottomSheetHeader className="mb-4">
            <BottomSheetTitle>
              {isEditing ? "Edit Transaction" : "Add Transaction"}
            </BottomSheetTitle>
          </BottomSheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type toggle */}
            <div className="flex rounded-xl bg-muted p-1 gap-1">
              {(["expense", "income"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategoryId("");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150",
                    type === t
                      ? t === "expense"
                        ? "bg-destructive/10 text-destructive shadow-sm"
                        : "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "expense" ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  {t === "expense" ? "Expense" : "Income"}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn("tabular-amount text-lg font-semibold h-12", errors.amount && "border-destructive")}
                autoFocus
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  setErrors((e) => ({ ...e, categoryId: "" }));
                }}
              >
                <SelectTrigger className={cn("h-11", errors.categoryId && "border-destructive")}>
                  <SelectValue placeholder="Select category">
                    {selectedCategory && (
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            CATEGORY_COLORS[selectedCategory.color]?.dot
                          )}
                        />
                        {selectedCategory.name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={cat} size="sm" />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-16"
              />
            </div>

            {/* Date and Recurrence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={cn("h-11", errors.date && "border-destructive")}
                />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Recurrence</Label>
                <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="tags">
                Tags{" "}
                <span className="text-muted-foreground font-normal">(optional, comma-separated)</span>
              </Label>
              <Input
                id="tags"
                placeholder="e.g. work, reimbursable"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-12">
                {isEditing ? "Save Changes" : "Add Transaction"}
              </Button>
            </div>
          </form>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
