/**
 * @file useAssetStore.ts
 * @description Gerenciamento de estado global (Zustand) do ecossistema Guardian Infra.
 * Controla a seleção de ativos, troca de cenários e metadados de sincronização.
 */

import { create } from "zustand";
import type { Asset } from "@/@types/asset";

/**
 * Interface AssetStore
 * Define a estrutura do estado para monitoramento tático e acessibilidade de dados.
 */
interface AssetStore {
  /** Ativo selecionado para exibição detalhada nos painéis (Sidebar ou Drawer) */
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;

  /** Origem dos dados: 'bh' (Belo Horizonte) ou 'nacional' (Brasil) */
  dataSource: "bh" | "nacional";
  setDataSource: (source: "bh" | "nacional") => void;

  /** Timestamp da última sincronização bem-sucedida para feedback de 'Live Data' */
  lastUpdate: Date;
  setLastUpdate: (date: Date) => void;
}

/**
 * Hook useAssetStore
 * Centraliza a inteligência de estado, garantindo a integridade visual entre trocas de cenário.
 * * @example
 * const { selectedAsset, setDataSource } = useAssetStore();
 */
export const useAssetStore = create<AssetStore>((set) => ({
  // --- ESTADO INICIAL ---
  selectedAsset: null,
  dataSource: "nacional",
  lastUpdate: new Date(),

  // --- AÇÕES (MUTATIONS) ---

  /** * Define o ativo em foco.
   * @param asset Objeto Asset ou null para limpar a seleção.
   */
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  /** * Altera a fonte de dados e reseta o estado de seleção.
   * SEO/UX: Garante que a interface não exiba dados residuais de outra localidade.
   */
  setDataSource: (source) =>
    set({
      dataSource: source,
      selectedAsset: null,
      lastUpdate: new Date(),
    }),

  /** * Atualiza o marcador de tempo da rede de monitoramento.
   */
  setLastUpdate: (date) => set({ lastUpdate: date }),
}));
