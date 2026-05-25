"use client";

import { useState, useCallback, useEffect } from "react";
import { NavBar } from "./components/nav-bar";
import { TransactionForm } from "./components/transaction-form";
import { DashboardView } from "./views/dashboard-view";
import { TransactionsView } from "./views/transactions-view";
import { BudgetView } from "./views/budget-view";
import { ReportsView } from "./views/reports-view";
import { SettingsView } from "./views/settings-view";
import { loadData, saveData, clearData } from "@/lib/storage";
import { Plus } from "lucide-react";
import type { AppData, Transaction, Budget, AppSettings, TransactionType, ViewId } from "@/lib/types";

export type { ViewId };

export function SpendismApp() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultFormType, setDefaultFormType] = useState<TransactionType>("expense");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  function handleSaveTransaction(transaction: Transaction) {
    updateData((prev) => {
      const exists = prev.transactions.find((t) => t.id === transaction.id);
      return {
        ...prev,
        transactions: exists
          ? prev.transactions.map((t) => (t.id === transaction.id ? transaction : t))
          : [transaction, ...prev.transactions],
      };
    });
  }

  function handleDeleteTransaction(id: string) {
    updateData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }

  function handleSaveBudget(budget: Budget) {
    updateData((prev) => {
      const exists = prev.budgets.find((b) => b.id === budget.id);
      return {
        ...prev,
        budgets: exists
          ? prev.budgets.map((b) => (b.id === budget.id ? budget : b))
          : [...prev.budgets, budget],
      };
    });
  }

  function handleDeleteBudget(id: string) {
    updateData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== id),
    }));
  }

  function handleUpdateSettings(settings: AppSettings) {
    updateData((prev) => ({ ...prev, settings }));
  }

  function handleImportTransactions(incoming: Transaction[]) {
    updateData((prev) => {
      const existingIds = new Set(prev.transactions.map((t) => t.id));
      const newOnes = incoming.filter((t) => !existingIds.has(t.id));
      return {
        ...prev,
        transactions: [...prev.transactions, ...newOnes],
      };
    });
  }

  function handleRestoreData(restored: AppData) {
    setData(restored);
  }

  function handleResetData() {
    clearData();
    setData(loadData());
  }

  function openAddTransaction(type: TransactionType = "expense") {
    setEditingTransaction(null);
    setDefaultFormType(type);
    setFormOpen(true);
  }

  function openEditTransaction(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormOpen(true);
  }

  return (
    <div className="flex min-h-screen">
      <NavBar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 min-w-0 lg:py-8 lg:pr-8 pb-24 lg:pb-8">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center px-4 py-4">
          <h1 className="text-lg font-bold tracking-tight">
            spend<span className="text-primary">ism.</span>
          </h1>
        </header>

        <div className="px-4 lg:px-0 max-w-5xl">
          {activeView === "dashboard" && (
            <DashboardView
              data={data}
              onNavigate={setActiveView}
              onAddTransaction={() => openAddTransaction("expense")}
              onEditBudget={(id) => {
                setEditingBudgetId(id);
                setActiveView("budget");
              }}
              onDeleteBudget={handleDeleteBudget}
            />
          )}
          {activeView === "transactions" && (
            <TransactionsView
              data={data}
              onAddTransaction={openAddTransaction}
              onEditTransaction={openEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
          {activeView === "budget" && (
            <BudgetView
              data={data}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
              editingBudgetId={editingBudgetId}
              onClearEditingBudget={() => setEditingBudgetId(null)}
            />
          )}
          {activeView === "reports" && <ReportsView data={data} />}
          {activeView === "settings" && (
            <SettingsView
              data={data}
              onUpdateSettings={handleUpdateSettings}
              onImportTransactions={handleImportTransactions}
              onRestoreData={handleRestoreData}
              onResetData={handleResetData}
            />
          )}
        </div>
      </main>

      {/* Mobile FAB — floating action button above bottom nav */}
      <button
        onClick={() => openAddTransaction("expense")}
        className="lg:hidden fixed bottom-[76px] right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 transition-all duration-200 active:scale-95 hover:shadow-xl hover:shadow-primary/40 hover:brightness-105"
        aria-label="Add transaction"
      >
        <Plus className="h-6 w-6" />
      </button>

      <TransactionForm
        key={`${formOpen ? "open" : "closed"}-${editingTransaction?.id ?? "new"}-${defaultFormType}`}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={data.categories}
        initialTransaction={editingTransaction}
        defaultType={defaultFormType}
      />
    </div>
  );
}
