"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_ICON_NAMES } from "@/lib/categories";
import type { Category } from "@/lib/types";

interface CategoryIconProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryIcon({ category, size = "md", className }: CategoryIconProps) {
  const colors = CATEGORY_COLORS[category.color] ?? CATEGORY_COLORS.slate;
  const iconSizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const containerSizes = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" };

  const safeIconName = CATEGORY_ICON_NAMES.includes(category.icon) ? category.icon : null;
  const IconComponent = safeIconName
    ? (LucideIcons as Record<string, unknown>)[safeIconName] as React.ComponentType<{ className?: string }> | undefined
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg shrink-0",
        colors.bg,
        containerSizes[size],
        className
      )}
    >
      {IconComponent ? (
        <IconComponent className={cn(iconSizes[size], colors.text)} />
      ) : (
        <span className={cn("text-xs font-bold", colors.text)}>
          {category.name[0]}
        </span>
      )}
    </span>
  );
}

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category.color] ?? CATEGORY_COLORS.slate;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", colors.dot)} />
      {category.name}
    </span>
  );
}
