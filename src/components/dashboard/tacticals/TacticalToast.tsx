"use client";

/**
 * COMPONENTE: TacticalToast
 * DESCRIÇÃO: Sistema de notificação customizado com estética militar/cyberpunk.
 * FUNCIONAMENTO: Integrado com a biblioteca 'sonner', suporta múltiplos estados críticos.
 */

import type { ReactNode, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

interface TacticalToastProps {
  t?: string | number; // CORREÇÃO: Tornado opcional para evitar erro ts(2741)
  title: string; // Título em caixa alta
  description?: string; // Detalhes técnicos da notificação
  icon?: ReactNode; // Ícone tático (Lucide)
  variant?: "danger" | "info" | "success" | "warning" | "neutral";
  onClose?: () => void; // Callback para suportar chamadas externas de fechamento
}

export function TacticalToast({
  t,
  title,
  description,
  icon,
  variant = "info",
  onClose,
}: TacticalToastProps) {
  // --- CONFIGURAÇÃO DE TEMAS ---
  const variants = {
    danger: {
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      accent: "bg-red-500",
      text: "text-red-500",
      shadow: "shadow-red-900/20",
    },
    info: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      accent: "bg-blue-500",
      text: "text-blue-500",
      shadow: "shadow-blue-900/20",
    },
    success: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      accent: "bg-emerald-500",
      text: "text-emerald-500",
      shadow: "shadow-emerald-900/20",
    },
    warning: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      accent: "bg-amber-500",
      text: "text-amber-500",
      shadow: "shadow-amber-900/20",
    },
    neutral: {
      border: "border-zinc-500/30",
      bg: "bg-zinc-500/5",
      accent: "bg-white",
      text: "text-white",
      shadow: "shadow-zinc-900/20",
    },
  };

  const theme = variants[variant];

  /**
   * INTERCEPTADOR DE DISMISS:
   * Prioriza o onClose (que geralmente contém toast.dismiss(t))
   * mas oferece fallback para toast.dismiss(t) caso 't' exista.
   */
  const handleDismiss = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClose) {
      onClose();
    } else if (t) {
      toast.dismiss(t);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
      className={`
        relative flex overflow-hidden rounded-lg
        bg-zinc-950/95 border ${theme.border}
        backdrop-blur-xl shadow-2xl ${theme.shadow}
        w-[calc(100vw-32px)] md:w-80 
        mx-auto md:mx-0 group
      `}
    >
      <div className={`w-1 ${theme.accent} shrink-0`} />

      <div className="flex gap-3 p-4 items-start w-full pr-10">
        {icon && (
          <div
            className={`
              flex items-center justify-center shrink-0 
              w-8 h-8 rounded border border-white/5 
              ${theme.bg} ${theme.text}
            `}
          >
            {icon}
          </div>
        )}

        <div className="flex flex-col gap-1 text-left min-w-0">
          <h4
            className={`text-[10px] font-black uppercase tracking-widest leading-none truncate ${theme.text}`}
          >
            {title}
          </h4>
          {description && (
            <p className="text-[10px] text-zinc-400 font-mono leading-tight uppercase tracking-tight opacity-90 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2 right-2 z-50 p-2 rounded-md cursor-pointer text-zinc-500 hover:text-white hover:bg-white/10 transition-all duration-200"
      >
        <X size={14} />
      </button>

      <div
        className={`absolute -top-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-10 ${theme.accent} pointer-events-none z-0`}
      />
    </motion.div>
  );
}
