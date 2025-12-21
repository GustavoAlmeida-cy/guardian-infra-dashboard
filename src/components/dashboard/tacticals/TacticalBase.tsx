"use client";

/**
 * COMPONENTES: TacticalBase
 * DESCRIÇÃO: Elementos atômicos da interface (Cards e Botões).
 * FOCO: Alta performance e fidelidade visual ao tema "Cyber/Military" Dark.
 */

import type { ElementType, ReactNode, ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- MetricCard: Exibe dados técnicos (Impacto, Severidade, etc) ---
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  color?: string; // Cor dinâmica para o valor (ex: vermelho para crítico)
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
    {/* Label: Texto ultra-reduzido e em caixa alta para estética tática */}
    <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1 tracking-wider">
      <Icon size={10} /> {label}
    </span>

    {/* Value: Destaque visual com suporte a cores temáticas */}
    <div
      className="text-xs font-black italic uppercase tracking-tighter truncate"
      style={{ color }}
    >
      {value}
    </div>
  </div>
);

// --- CommandButton: Abstração sobre o botão do Shadcn para ações de alto risco ---
// Nota: 'ButtonHTMLAttributes' garante que o botão suporte 'type="submit"', 'id', etc.
interface CommandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  icon: ElementType;
  children: ReactNode;
  color?: string; // Cor do tema (riskTheme.color) injetada pelo hook
}

export const CommandButton = ({
  onClick,
  variant = "primary",
  icon: Icon,
  children,
  color,
  disabled,
  className,
  ...props
}: CommandButtonProps) => {
  // Estilos de comportamento (feedback de clique e estado desativado)
  const commonStyles =
    "h-11 text-[11px] font-black uppercase transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

  // VARIANTE OUTLINE: Usada para ações secundárias (ex: Auditoria/Protocolo)
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
        {/* Feedback visual: Ícone gira se o botão estiver em estado de loading/disabled */}
        <Icon size={16} className={cn(disabled && "animate-spin")} />
        {children}
      </Button>
    );
  }

  // VARIANTE PRIMARY: Usada para a ação principal (ex: Acionar Resposta)
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
        // Fallback para zinco se desativado, caso contrário assume a cor do risco
        backgroundColor: disabled ? "#27272a" : color,
      }}
    >
      {/* EFEITO DE HOVER: Overlay de brilho que desliza de baixo para cima */}
      {!disabled && (
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      )}

      {/* Ícone com animação de pulso para indicar "Sistema Ativo/Pronto" */}
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
