"use client";

import { useState } from "react";
import type { ElementType, ReactNode, ButtonHTMLAttributes } from "react";
import { Play, Lock, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TYPES & INTERFACES ---

export type OperationStatus = "idle" | "loading" | "success" | "error";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  color?: string;
  className?: string;
}

interface CommandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  icon: ElementType;
  children: ReactNode;
  color?: string;
  risco?: string;
}

interface ContingencyPanelProps {
  actions: string[];
  onExecuteAction: (action: string) => void;
  disabled?: boolean;
  risco?: string;
  isGlobalLoading?: boolean;
}

// --- SUB-COMPONENT: METRIC CARD ---

export const MetricCard = ({
  label,
  value,
  icon: Icon,
  color = "#fff",
  className,
}: MetricCardProps) => (
  <div
    title={`${label}: ${value}`}
    className={cn(
      "space-y-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-left transition-colors hover:border-zinc-700",
      className
    )}
  >
    <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1 tracking-wider">
      <Icon size={10} /> {label}
    </span>
    <div
      className="text-xs font-black italic uppercase tracking-tighter truncate"
      style={{ color }}
    >
      {value}
    </div>
  </div>
);

// --- SUB-COMPONENT: CONTINGENCY PANEL ---

export const ContingencyPanel = ({
  actions,
  onExecuteAction,
  disabled,
  risco,
  isGlobalLoading,
}: ContingencyPanelProps) => {
  const isLockedByRisk = risco === "Moderado" || risco === "Baixo";
  const [lastClickedAction, setLastClickedAction] = useState<string | null>(
    null
  );

  const handleInternalClick = (action: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita conflito com swipe do toast
    if (disabled || isLockedByRisk) return;
    setLastClickedAction(action);
    onExecuteAction(action);
  };

  return (
    <ScrollArea className="h-full max-h-75 pr-3">
      <div className="grid gap-2.5">
        {actions.map((action, index) => {
          const isThisLoading =
            disabled && (isGlobalLoading || lastClickedAction === action);

          return (
            <button
              key={index}
              disabled={disabled || isLockedByRisk}
              onClick={(e) => handleInternalClick(action, e)}
              className={cn(
                "group relative flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300",
                "bg-zinc-900/40 border-zinc-800/80",
                !disabled && !isLockedByRisk
                  ? "cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-800/60"
                  : "disabled:pointer-events-auto cursor-not-allowed opacity-50",
                isThisLoading &&
                  "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
                isLockedByRisk && "grayscale opacity-30"
              )}
            >
              <div
                className={cn(
                  "absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-emerald-500 rounded-full opacity-0 transition-opacity",
                  isThisLoading && "opacity-100"
                )}
              />

              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tight transition-colors",
                  isThisLoading
                    ? "text-emerald-400"
                    : "text-zinc-400 group-hover:text-zinc-100"
                )}
              >
                {action}
              </span>

              <div className="shrink-0 ml-4">
                {isLockedByRisk ? (
                  <Lock size={14} className="text-zinc-700" />
                ) : isThisLoading ? (
                  <Loader2
                    size={14}
                    className="text-emerald-500 animate-spin"
                  />
                ) : (
                  <div className="p-1.5 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500 transition-all shadow-inner">
                    <Play
                      size={10}
                      className="text-emerald-500 group-hover:text-black transition-colors fill-current"
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

// --- SUB-COMPONENT: COMMAND BUTTON ---

export const CommandButton = ({
  onClick,
  variant: _variant, // Renomeado com underscore para ignorar erro de lint "unused-vars"
  icon: Icon,
  children,
  color,
  disabled,
  risco,
  className,
  ...props
}: CommandButtonProps) => {
  const isLockedByRisk = risco === "Moderado" || risco === "Baixo";
  const isEffectivelyDisabled = disabled || isLockedByRisk;

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Evita conflito com swipe do toast
    if (onClick) onClick(e);
  };

  return (
    <Button
      {...props}
      onClick={handleButtonClick}
      disabled={isEffectivelyDisabled}
      className={cn(
        "group relative h-11 text-[11px] font-black uppercase transition-all active:scale-95 gap-2",
        "text-white border-none shadow-lg shadow-black/40 overflow-hidden",
        "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      style={{
        backgroundColor: isEffectivelyDisabled ? "#27272a" : color,
      }}
    >
      <Icon
        size={16}
        className={cn(
          "fill-current",
          !isEffectivelyDisabled && "animate-pulse"
        )}
      />
      {children}
    </Button>
  );
};
