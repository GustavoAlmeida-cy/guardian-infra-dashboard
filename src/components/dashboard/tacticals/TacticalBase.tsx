"use client";

/**
 * COMPONENTES: TacticalBase
 * DESCRIÇÃO: Elementos atômicos da interface (Cards e Botões).
 * ATUALIZAÇÃO: Inserida lógica de bloqueio de segurança para riscos Moderado/Baixo.
 */

import type { ElementType, ReactNode, ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- MetricCard: Exibe dados técnicos (Impacto, Severidade, etc) ---
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

// --- CommandButton: Abstração com trava de segurança baseada em risco ---
interface CommandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  icon: ElementType;
  children: ReactNode;
  color?: string;
  risco?: "Crítico" | "Alto" | "Moderado" | "Baixo" | string; // Prop para controle de lógica
}

export const CommandButton = ({
  onClick,
  variant = "primary",
  icon: Icon,
  children,
  color,
  disabled,
  risco,
  className,
  ...props
}: CommandButtonProps) => {
  // Lógica de Bloqueio: Botões ficam inativos para risco Moderado e Baixo
  const isLockedByRisk = risco === "Moderado" || risco === "Baixo";
  const isEffectivelyDisabled = disabled || isLockedByRisk;

  const commonStyles = cn(
    "h-11 text-[11px] font-black uppercase transition-all active:scale-95",
    "disabled:cursor-not-allowed disabled:opacity-40",
    className
  );

  // Mensagem de auxílio no hover caso esteja travado
  const tooltipTitle = isLockedByRisk
    ? "Ação bloqueada: Nível de risco insuficiente"
    : typeof children === "string"
    ? children
    : undefined;

  // VARIANTE OUTLINE
  if (variant === "outline") {
    return (
      <Button
        {...props}
        title={tooltipTitle}
        onClick={onClick}
        disabled={isEffectivelyDisabled}
        variant="outline"
        className={cn(
          "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 gap-2 text-zinc-400 hover:text-white",
          commonStyles
        )}
      >
        <Icon
          size={16}
          className={cn(
            isEffectivelyDisabled && !isLockedByRisk && "animate-spin"
          )}
        />
        {children}
      </Button>
    );
  }

  // VARIANTE PRIMARY
  return (
    <Button
      {...props}
      title={tooltipTitle}
      onClick={onClick}
      disabled={isEffectivelyDisabled}
      className={cn(
        "group relative gap-0 text-white border-none shadow-lg shadow-black/40 overflow-hidden",
        commonStyles
      )}
      style={{
        backgroundColor: isEffectivelyDisabled ? "#27272a" : color,
      }}
    >
      {/* Efeito de brilho apenas se estiver ativo */}
      {!isEffectivelyDisabled && (
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      )}

      <Icon
        size={16}
        className={cn(
          "mr-2 fill-current",
          isEffectivelyDisabled ? "opacity-50" : "animate-pulse"
        )}
      />
      {children}
    </Button>
  );
};
