"use client";

import { cn } from "@/lib/utils";
import type { TimePeriod } from "@/lib/types";

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "daily", label: "Day" },
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" },
  { value: "yearly", label: "Year" },
  { value: "all", label: "All" },
];

interface TimeFilterProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  className?: string;
}

export function TimeFilter({ value, onChange, className }: TimeFilterProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl bg-muted p-1",
        className
      )}
    >
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
            value === period.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
