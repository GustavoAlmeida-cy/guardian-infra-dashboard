import { create } from "zustand";
import type { Asset } from "@/@types/asset";

interface AssetStore {
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;
  dataSource: "bh" | "nacional";
  setDataSource: (source: "bh" | "nacional") => void;
  lastUpdate: Date;
}

export const useAssetStore = create<AssetStore>((set) => ({
  selectedAsset: null,
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  dataSource: "nacional", // Padrão inicial
  lastUpdate: new Date(),
  setDataSource: (source) =>
    set({
      dataSource: source,
      selectedAsset: null, // Limpa seleção ao trocar de mapa
      lastUpdate: new Date(),
    }),
}));
