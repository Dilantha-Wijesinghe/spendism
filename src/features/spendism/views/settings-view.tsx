"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  exportTransactionsCSV,
  exportFullDataJSON,
  importTransactionsCSV,
  importFullDataJSON,
} from "@/lib/csv";
import { CURRENCIES } from "@/lib/money";
import { Download, Upload, Trash2, FileText, Database, AlertTriangle } from "lucide-react";
import type { AppData, AppSettings } from "@/lib/types";

interface SettingsViewProps {
  data: AppData;
  onUpdateSettings: (settings: AppSettings) => void;
  onImportTransactions: (transactions: AppData["transactions"]) => void;
  onRestoreData: (data: AppData) => void;
  onResetData: () => void;
}

export function SettingsView({
  data,
  onUpdateSettings,
  onImportTransactions,
  onRestoreData,
  onResetData,
}: SettingsViewProps) {
  const { transactions, settings } = data;
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(null);
    const { transactions: imported, errors } = await importTransactionsCSV(file);
    if (errors.length > 0 && imported.length === 0) {
      setImportMessage({ type: "error", text: `Import failed: ${errors[0]}` });
    } else {
      onImportTransactions(imported);
      setImportMessage({
        type: "success",
        text: `Imported ${imported.length} transactions${errors.length > 0 ? ` (${errors.length} rows skipped)` : ""}`,
      });
    }
    e.target.value = "";
  }

  async function handleJSONImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(null);
    const restored = await importFullDataJSON(file);
    if (!restored) {
      setImportMessage({ type: "error", text: "Invalid backup file" });
    } else {
      onRestoreData(restored);
      setImportMessage({ type: "success", text: "Backup restored successfully" });
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight">Settings</h2>

      {/* Preferences */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(code) => {
                const currency = CURRENCIES.find((c) => c.code === code);
                if (currency) {
                  onUpdateSettings({
                    ...settings,
                    currency: currency.code,
                    currencySymbol: currency.symbol,
                  });
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="font-mono mr-2 text-muted-foreground">{c.symbol}</span>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Week Starts On</Label>
            <div className="flex rounded-xl bg-muted p-1 gap-1 w-fit">
              {([{ value: 1, label: "Monday" }, { value: 0, label: "Sunday" }] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdateSettings({ ...settings, weekStartsOn: opt.value })}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    settings.weekStartsOn === opt.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Data Management</CardTitle>
          <CardDescription className="text-xs">
            All data is stored locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {importMessage && (
            <div
              className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${
                importMessage.type === "success"
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {importMessage.text}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Export</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => exportTransactionsCSV(transactions)}
                disabled={transactions.length === 0}
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                Export Transactions CSV
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => exportFullDataJSON(data)}
              >
                <Database className="h-4 w-4 text-muted-foreground" />
                Export Full Backup JSON
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Import</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => csvInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 text-muted-foreground" />
                Import Transactions CSV
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => jsonInputRef.current?.click()}
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                Restore from Backup
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              CSV import merges transactions. JSON restore replaces all data.
            </p>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVImport}
          />
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleJSONImport}
          />

          <Separator />

          {/* Danger zone */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Danger Zone</p>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Reset all data</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete all transactions, budgets, and categories.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => setResetDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="py-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Spendism</p>
              <p className="text-xs text-muted-foreground">Personal finance, offline-first</p>
            </div>
            <p className="text-xs text-muted-foreground tabular-amount">v1.0</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} stored locally
          </p>
        </CardContent>
      </Card>

      {/* Reset confirmation dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reset All Data
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all your transactions, budgets, and custom categories.
            This action cannot be undone.
          </p>
          <p className="text-sm font-medium">Consider exporting a backup first.</p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                onResetData();
                setResetDialogOpen(false);
              }}
            >
              Yes, reset everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
