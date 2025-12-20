import { create } from "zustand";
import type { Asset } from "@/@types/asset";

interface AssetStore {
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;
  dataSource: string; // Dinâmico: aceita qualquer ID de cenário
  setDataSource: (source: string) => void;
  lastUpdate: Date;
  refreshLastUpdate: () => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  selectedAsset: null,
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  dataSource: "nacional", // Fallback inicial
  lastUpdate: new Date(),

  setDataSource: (source) =>
    set({
      dataSource: source,
      selectedAsset: null, // Reset de segurança ao mudar contexto
      lastUpdate: new Date(),
    }),

  refreshLastUpdate: () => set({ lastUpdate: new Date() }),
}));
