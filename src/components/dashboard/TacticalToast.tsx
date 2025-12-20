import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface TacticalToastProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: "danger" | "info" | "success" | "warning";
}

export function TacticalToast({
  title,
  description,
  icon,
  variant = "info",
}: TacticalToastProps) {
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
  };

  const theme = variants[variant];

  return (
    <motion.div
      // Usamos apenas Y para a entrada, garantindo compatibilidade total
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
      className={`
        relative flex overflow-hidden rounded-lg
        bg-zinc-950/95 border ${theme.border}
        backdrop-blur-xl shadow-2xl ${theme.shadow}
        
        /* Largura Mobile: Quase full | Largura Desktop: Fixa */
        w-[calc(100vw-32px)] md:w-80 
        mx-auto md:mx-0
      `}
    >
      <div className={`w-1 ${theme.accent} shrink-0`} />

      <div className="flex gap-3 p-4 items-start w-full">
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

      <div
        className={`absolute -top-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-20 ${theme.accent}`}
      />
    </motion.div>
  );
}
