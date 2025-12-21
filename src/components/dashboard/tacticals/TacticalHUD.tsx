/**
 * @file TacticalHUD.tsx
 * @description Telemetria de risco simplificada.
 * Exibe a distribuição percentual de ativos por nível de severidade.
 */

import { useMemo } from "react";
import type { Asset, RiskLevel } from "@/@types/asset";

interface TacticalHUDProps {
  assets: Asset[];
}

/**
 * @component TacticalHUD
 * @description Painel inferior discreto que resume o estado de saúde da infraestrutura.
 */
export function TacticalHUD({ assets }: TacticalHUDProps) {
  /**
   * @memo stats
   * Agrupa os ativos por nível de risco e calcula a representatividade percentual.
   */
  const stats = useMemo(() => {
    const total = assets.length || 1;
    const counts = assets.reduce((acc, a) => {
      acc[a.risco_atual] = (acc[a.risco_atual] || 0) + 1;
      return acc;
    }, {} as Record<RiskLevel, number>);

    // Ordem de prioridade tática para leitura rápida
    const order: RiskLevel[] = ["Crítico", "Alto", "Moderado", "Baixo"];

    return order.map((level) => ({
      level,
      count: counts[level] || 0,
      percent: Math.round(((counts[level] || 0) / total) * 100),
      // Cores semânticas consistentes com o sistema de alertas
      color: {
        Crítico: "bg-red-500",
        Alto: "bg-orange-500",
        Moderado: "bg-yellow-500",
        Baixo: "bg-emerald-500",
      }[level],
      textColor: {
        Crítico: "text-red-400",
        Alto: "text-orange-400",
        Moderado: "text-yellow-400",
        Baixo: "text-emerald-400",
      }[level],
    }));
  }, [assets]);

  return (
    <div
      className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-500 
                  bg-zinc-950/60 backdrop-blur-md p-1 border border-zinc-800/40 
                 rounded-xl shadow-2xl transition-all"
    >
      {stats.map(({ level, percent, count, color, textColor }) => (
        <div
          key={level}
          title={`${count} ativos com risco ${level}`} // Tooltip explicativo nativo
          className="flex items-center gap-2.5 px-3 py-1 rounded-xl transition-all
                     cursor-default group"
        >
          {/* Indicador Lateral Discreto (Dot) */}
          <div
            className={`w-1 h-3 rounded-full ${color} opacity-70 group-hover:opacity-100 transition-opacity`}
          />

          <div className="flex flex-col min-w-11.25">
            {/* Label de Risco */}
            <span
              className={`text-[7px] font-black uppercase tracking-[0.15em] leading-none mb-1 ${textColor} opacity-80`}
            >
              {level}
            </span>

            {/* Valor Percentual */}
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-mono font-bold text-zinc-100 leading-none">
                {percent}
              </span>
              <span className="text-[9px] font-medium text-zinc-500">%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
