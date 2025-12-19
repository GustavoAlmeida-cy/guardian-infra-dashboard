import { useQuery } from "@tanstack/react-query";
import bhData from "../data/dados_ficticios_bh.json";
import nacionalData from "../data/dados_ficticios.json";
import type { Asset, RiskLevel } from "../@types/asset";
import { CIDADE_COORDS } from "../utils/coords-map";

// Interface para os dados crus vindo do JSON
interface RawAsset {
  id: number;
  nome: string;
  localizacao: string;
  risco_atual: RiskLevel;
  ultima_atualizacao: string;
  // Propriedades que podem ou não existir no JSON original
  coordenadas?: { latitude: number; longitude: number };
  acoes_contingencia?: string[];
  tempo_estimado_impacto?: string;
}

export function useAssets(source: "bh" | "nacional") {
  return useQuery({
    queryKey: ["assets", source],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Tipamos o array vindo do JSON para evitar o 'any'
      const rawData = (source === "bh" ? bhData : nacionalData) as RawAsset[];

      return rawData.map((item: RawAsset): Asset => {
        // Resolvemos a diferença de nomenclatura (lat/lng vs latitude/longitude)
        const fallback = CIDADE_COORDS[item.localizacao];

        return {
          ...item,
          coordenadas: item.coordenadas || {
            latitude: fallback?.lat ?? 0,
            longitude: fallback?.lng ?? 0,
          },
          acoes_contingencia: item.acoes_contingencia || [],
          tempo_estimado_impacto: item.tempo_estimado_impacto || "Em análise",
        };
      });
    },
    refetchInterval: 5000,
  });
}
