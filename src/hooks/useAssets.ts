// src/hooks/useAssets.ts
import { useQuery } from "@tanstack/react-query";
import data from "../data/dados_ficticios_bh.json"; // Ou o nacional
import type { Asset } from "../@types/asset";

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      // Simula latência de rede
      await new Promise((resolve) => setTimeout(resolve, 500));
      return data as Asset[];
    },
    refetchInterval: 5000, // Polling de 5 segundos
  });
}
