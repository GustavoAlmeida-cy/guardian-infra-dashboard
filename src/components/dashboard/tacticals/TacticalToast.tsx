"use client";

import { useEffect, useState } from "react";
import type { ReactNode, MouseEvent } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

interface TacticalToastProps {
  t?: string | number;
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: "danger" | "info" | "success" | "warning" | "neutral";
  onClose?: () => void;
}

export function TacticalToast({
  t,
  title,
  description,
  icon,
  variant = "info",
  onClose,
}: TacticalToastProps) {
  // --- ESTADOS E RESPONSIVIDADE ---
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => setIsMobileOrTablet(window.innerWidth < 1024);
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // --- LÓGICA DE MOVIMENTO (FRAMER MOTION) ---
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  // --- TEMAS VISUAIS ---
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

  // --- HANDLERS DE FECHAMENTO ---
  const triggerClose = () => {
    if (onClose) onClose();
    else if (t) toast.dismiss(t);
  };

  const handleDismiss = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Impede abertura do ativo ao clicar no botão fechar
    triggerClose();
  };

  return (
    <motion.div
      // Comportamento de arrasto apenas em dispositivos touch
      drag={isMobileOrTablet ? "x" : false}
      dragListener={isMobileOrTablet}
      style={{ x, opacity: isMobileOrTablet ? opacity : 1 }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (isMobileOrTablet && Math.abs(info.offset.x) > 80) triggerClose();
      }}
      // Feedback de entrada/toque
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative flex overflow-hidden rounded-xl
        bg-zinc-950/98 border ${theme.border}
        backdrop-blur-2xl shadow-2xl ${theme.shadow}
        w-[calc(100vw-24px)] max-w-95 md:w-80
        mx-auto md:mx-0 group select-none
        ${
          isMobileOrTablet
            ? "touch-none cursor-grab active:cursor-grabbing"
            : "cursor-pointer"
        }
      `}
    >
      {/* Indicador Lateral */}
      <div className={`w-1.5 ${theme.accent} shrink-0`} />

      {/* Conteúdo da Notificação */}
      <div className="flex gap-4 p-4 items-start w-full pr-12">
        {icon && (
          <div
            className={`flex items-center justify-center shrink-0 w-9 h-9 rounded-lg border border-white/5 ${theme.bg} ${theme.text} shadow-inner`}
          >
            {icon}
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-left min-w-0 py-0.5">
          <h4
            className={`text-[11px] font-black uppercase tracking-[0.15em] leading-none truncate ${theme.text}`}
          >
            {title}
          </h4>
          {description && (
            <p className="text-[10px] text-zinc-400 font-mono leading-relaxed uppercase tracking-tight opacity-80 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Botão de Fechar (Interação Isolada) */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute cursor-pointer top-0 right-1.5 bottom-0 px-3 flex items-center justify-center text-zinc-600 hover:text-white transition-colors z-50"
      >
        <div className="p-1.5 rounded-full bg-zinc-900/50 group-hover:bg-zinc-800 transition-colors">
          <X size={14} />
        </div>
      </button>

      {/* Detalhe Estético (Glow) */}
      <div
        className={`absolute -top-6 -right-6 w-16 h-16 rounded-full blur-3xl opacity-20 ${theme.accent} pointer-events-none`}
      />
    </motion.div>
  );
}
