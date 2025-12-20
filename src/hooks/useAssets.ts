/**
 * @file useAssets.ts
 * @description Hook de integração de dados. Realiza a normalização entre
 * os diferentes datasets (BH/Nacional) e aplica a grade hexagonal.
 */

import { useQuery } from "@tanstack/react-query";
import bhData from "../data/dados_ficticios_bh.json";
import nacionalData from "../data/dados_ficticios.json";
import type { Asset, RiskLevel } from "../@types/asset";
import { CIDADE_COORDS } from "../utils/coords-map";
import { getSnappedCenter } from "../utils/grid";

interface RawAsset {
  id: number;
  nome: string;
  localizacao: string;
  risco_atual: RiskLevel;
  ultima_atualizacao: string;
  coordenadas?: { latitude: number; longitude: number };
  acoes_contingencia?: string[];
  tempo_estimado_impacto?: string;
}

export function useAssets(source: "bh" | "nacional") {
  return useQuery({
    queryKey: ["assets", source],
    queryFn: async () => {
      // Simulação de latência de rede para testar estados de Loading/Splash
      await new Promise((resolve) => setTimeout(resolve, 800));

      const rawData = (source === "bh" ? bhData : nacionalData) as RawAsset[];

      return rawData.map((item: RawAsset): Asset => {
        const fallback = CIDADE_COORDS[item.localizacao];

        // 1. Definição da coordenada base (vinda do JSON ou do Map de Capitais)
        const baseLat = item.coordenadas?.latitude ?? fallback?.lat ?? 0;
        const baseLng = item.coordenadas?.longitude ?? fallback?.lng ?? 0;

        // 2. Aplicação do Snapping Hexagonal (Grid)
        // Isso alinha visualmente os ativos para evitar sobreposição no mapa.
        const [snappedLat, snappedLng] = getSnappedCenter(baseLat, baseLng);

        return {
          ...item,
          coordenadas: {
            latitude: snappedLat,
            longitude: snappedLng,
          },
          acoes_contingencia: item.acoes_contingencia || [],
          tempo_estimado_impacto: item.tempo_estimado_impacto || "Em análise",
        };
      });
    },
    /** * Polling de 5 segundos: Simula a atualização constante de sensores.
     * Combinado com o 'staleTime' manteria o dashboard sempre vivo.
     */
    refetchInterval: 5000,
    staleTime: 2000,
  });
}
