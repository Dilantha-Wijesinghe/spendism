"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  variant?: "default" | "positive" | "negative" | "accent";
  trend?: { value: number; label: string };
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  positive: {
    icon: "bg-[#BDD3CE]/40 text-[#013D5A]",
    value: "text-[#013D5A]",
  },
  negative: {
    icon: "bg-red-100 text-red-700",
    value: "text-red-700",
  },
  accent: {
    icon: "bg-accent/15 text-accent-foreground",
    value: "text-foreground",
  },
};

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  variant = "default",
  trend,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200",
        className
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest truncate">
              {label}
            </p>
            <p className={cn("text-xl sm:text-2xl font-bold tabular-amount mt-1 leading-tight", styles.value)}>
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{subValue}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  trend.value >= 0 ? "text-[#013D5A]" : "text-red-600"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value.toFixed(1)}% {trend.label}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
