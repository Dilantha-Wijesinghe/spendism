"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowLeftRight, Target, BarChart3, Settings } from "lucide-react";
import type { ViewId } from "@/lib/types";

const NAV_ITEMS = [
  { id: "dashboard" as ViewId, label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions" as ViewId, label: "Transactions", icon: ArrowLeftRight },
  { id: "budget" as ViewId, label: "Budget", icon: Target },
  { id: "reports" as ViewId, label: "Reports", icon: BarChart3 },
  { id: "settings" as ViewId, label: "Settings", icon: Settings },
];

interface NavBarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function NavBar({ activeView, onNavigate }: NavBarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col gap-1 w-[220px] shrink-0 h-full py-6 px-3">
        <div className="px-3 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            spend<span className="text-primary">ism</span>
          </h1>
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left w-full",
              activeView === id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/85 backdrop-blur-xl backdrop-saturate-150 border-t border-border">
        <div className="flex items-center justify-around px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-150 min-w-[52px]",
                activeView === id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <span className={cn(
                "flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-150",
                activeView === id && "bg-primary/10"
              )}>
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-all duration-150",
                    activeView === id ? "stroke-[2.25]" : "stroke-[1.75]"
                  )}
                />
              </span>
              <span className={cn(
                "text-[9px] font-semibold leading-none tracking-wide transition-all duration-150",
                activeView === id ? "opacity-100" : "opacity-70"
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
