"use client";

import type { ElementType, ReactNode, ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- MetricCard Reutilizável ---
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  color?: string;
  className?: string;
}

export const MetricCard = ({
  label,
  value,
  icon: Icon,
  color = "#fff",
  className,
}: MetricCardProps) => (
  <div
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

// --- Botão de Comando Customizado ---
// Extendemos ButtonHTMLAttributes para herdar 'disabled', 'className' e eventos nativos
interface CommandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  icon: ElementType;
  children: ReactNode;
  color?: string;
}

export const CommandButton = ({
  onClick,
  variant = "primary",
  icon: Icon,
  children,
  color,
  disabled,
  className,
  ...props // Captura demais atributos como type, aria-label, etc.
}: CommandButtonProps) => {
  // Estilo comum para ambos os tipos de botão
  const commonStyles =
    "h-11 text-[11px] font-black uppercase transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

  if (variant === "outline") {
    return (
      <Button
        {...props}
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        className={cn(
          "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 gap-2 text-zinc-400 hover:text-white",
          commonStyles,
          className
        )}
      >
        <Icon size={16} className={cn(disabled && "animate-spin")} />
        {children}
      </Button>
    );
  }

  return (
    <Button
      {...props}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative gap-0 text-white border-none shadow-lg shadow-black/40 overflow-hidden",
        commonStyles,
        className
      )}
      style={{
        // Se desativado, usa cinza zinco, caso contrário usa a cor temática
        backgroundColor: disabled ? "#27272a" : color,
      }}
    >
      {/* Efeito de hover apenas se não estiver desativado */}
      {!disabled && (
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      )}

      <Icon
        size={16}
        className={cn(
          "mr-2 fill-current",
          disabled ? "animate-spin" : "animate-pulse"
        )}
      />
      {children}
    </Button>
  );
};
