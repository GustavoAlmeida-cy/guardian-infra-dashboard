/**
 * @file TacticalTooltip.tsx
 * @description Componente de conteúdo padronizado para Tooltips do mapa.
 */

import type { RiskLevel } from "@/@types/asset";

const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

interface TacticalTooltipProps {
  nome: string;
  risco: RiskLevel;
}

export function TacticalTooltipContent({ nome, risco }: TacticalTooltipProps) {
  const isCritical = risco === "Crítico";
  const color = RISK_COLORS[risco];

  return (
    <div className="flex flex-col gap-1 p-1 min-w-25">
      <span className="text-zinc-500 text-[8px] uppercase tracking-widest font-bold">
        {isCritical ? "⚠️ ALERTA" : "NORMAL"}
      </span>

      <span className="font-bold border-b border-white/10 pb-1 text-white">
        {nome}
      </span>

      <span className="flex items-center gap-1.5 mt-1 font-bold text-white uppercase">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {risco}
      </span>
    </div>
  );
}

// Exportamos também as classes de estilo para garantir que o Tooltip do Leaflet
// tenha a mesma aparência em todos os lugares
export const TACTICAL_TOOLTIP_CLASS =
  "bg-zinc-950/90! border-zinc-800! text-white! font-mono text-[10px]! rounded-md! shadow-2xl!";
