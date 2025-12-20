import { create } from "zustand";
import type { Asset } from "@/@types/asset";

interface AssetStore {
  // O Ativo que o usuário clicou para ver detalhes (no Drawer ou Painel)
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;

  // A fonte de dados atual ("bh" ou "nacional")
  dataSource: "bh" | "nacional";
  setDataSource: (source: "bh" | "nacional") => void;

  // Controle de timestamp para mostrar ao usuário quando os dados foram sincronizados
  lastUpdate: Date;
  setLastUpdate: (date: Date) => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  selectedAsset: null,
  dataSource: "nacional",
  lastUpdate: new Date(),

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  setDataSource: (source) =>
    set({
      dataSource: source,
      selectedAsset: null, // Reset essencial para evitar inconsistência de dados entre cidades
      lastUpdate: new Date(),
    }),

  setLastUpdate: (date) => set({ lastUpdate: date }),
}));
