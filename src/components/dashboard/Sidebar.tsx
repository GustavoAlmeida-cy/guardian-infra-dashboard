/**
 * @file Sidebar.tsx
 * @description Painel lateral tático de monitoramento.
 * @layout Progressão de Grid:
 * - Mobile: 1 col (w-full)
 * - Tablet: 3 col (md:grid-cols-3)
 * - Desktop: 2 col (xl:grid-cols-2) ou Flex-col (w-80)
 */

import { useState, useMemo } from "react";
import { Search, MapPin, Activity, ChevronRight } from "lucide-react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset } from "@/@types/asset";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  assets: Asset[];
  isMobile?: boolean;
}

/**
 * @section Componente de Carregamento (Skeleton)
 */
function SidebarItemSkeleton() {
  return (
    <div className="w-full p-4 rounded-xl border border-zinc-900/80 bg-zinc-900/10 space-y-4">
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-3/4 bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded-full bg-zinc-800" />
            <Skeleton className="h-2 w-1/2 bg-zinc-900" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-lg bg-zinc-800" />
      </div>
      <Skeleton className="h-1 w-full rounded-full bg-zinc-900" />
    </div>
  );
}

export function Sidebar({ assets, isMobile }: SidebarProps) {
  // --- ESTADOS E HOOKS ---
  const { setSelectedAsset, selectedAsset } = useAssetStore();
  const [searchTerm, setSearchTerm] = useState("");

  const isLoading = assets.length === 0;

  // --- LÓGICA DE FILTRAGEM ---
  const filteredAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  // --- MAPEAMENTO DE RISCO (CONFIGURAÇÃO VISUAL) ---
  const getRiskDetails = (risk: string) => {
    const map = {
      Crítico: {
        badge: "bg-red-500/10 text-red-500",
        bar: "bg-red-600",
        percentage: "100%",
        pulse: true,
      },
      Alto: {
        badge: "bg-orange-500/10 text-orange-500",
        bar: "bg-orange-500",
        percentage: "70%",
        pulse: false,
      },
      Moderado: {
        badge: "bg-yellow-500/10 text-yellow-500",
        bar: "bg-yellow-500",
        percentage: "40%",
        pulse: false,
      },
      default: {
        badge: "bg-emerald-500/10 text-emerald-500",
        bar: "bg-emerald-500",
        percentage: "15%",
        pulse: false,
      },
    };
    return map[risk as keyof typeof map] || map.default;
  };

  return (
    <aside
      className={`
        ${isMobile ? "w-full" : "w-80 shrink-0"} 
        h-full flex flex-col bg-zinc-950/50 backdrop-blur-xl border-r border-zinc-900/50 overflow-hidden
      `}
    >
      {/* 1. HEADER: Branding e Busca */}
      <div className="p-6 pb-4 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-red-600 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] shrink-0">
              <Activity className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white uppercase leading-none truncate">
                Ativos Guardian
              </h2>
              <p className="text-[9px] text-zinc-500 font-semibold tracking-[0.2em] uppercase truncate">
                Monitoramento Ativo
              </p>
            </div>
          </div>
          {!isLoading && (
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800 shrink-0">
              {filteredAssets.length}
            </span>
          )}
        </div>

        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors"
            size={14}
          />
          <Input
            placeholder="Filtrar infraestrutura..."
            disabled={isLoading}
            className="pl-9 bg-zinc-900/40 border-zinc-800 focus:border-red-500/50 focus:ring-red-500/20 text-xs h-10 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Separator className="bg-zinc-900 shrink-0" />

      {/* 2. CONTEÚDO PRINCIPAL: Grid de Ativos */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div
          className={`
            p-4 gap-3
            ${
              isMobile
                ? "grid grid-cols-1 md:grid-cols-3 xl:grid-cols-2"
                : "flex flex-col"
            }
          `}
        >
          {isLoading ? (
            // Exibição de Skeletons durante o Load
            Array.from({ length: 9 }).map((_, i) => (
              <SidebarItemSkeleton key={i} />
            ))
          ) : filteredAssets.length > 0 ? (
            // Mapeamento dos Ativos Filtrados
            filteredAssets.map((asset) => {
              const details = getRiskDetails(asset.risco_atual);
              const isSelected = selectedAsset?.id === asset.id;

              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(isSelected ? null : asset)}
                  className={`
                    text-left p-4 rounded-xl transition-all border relative overflow-hidden group 
                    w-full lg:w-70 min-w-0 flex flex-col justify-between h-full
                    ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-700 shadow-xl scale-[1.01] z-10"
                        : "border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-900/30"
                    }
                  `}
                >
                  {/* Indicador de Seleção Ativa */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[2px_0_10px_rgba(220,38,38,0.5)]" />
                  )}

                  {/* Topo do Card: Info e Status */}
                  <div className="flex justify-between items-start gap-2 w-full">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`block font-bold text-xs truncate ${
                            isSelected ? "text-white" : "text-zinc-400"
                          }`}
                        >
                          {asset.nome}
                        </span>
                        {asset.risco_atual === "Crítico" && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 overflow-hidden">
                        <MapPin size={11} className="shrink-0" />
                        <span className="text-[9px] font-medium truncate uppercase tracking-tighter">
                          {asset.localizacao}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 ml-1">
                      <Badge
                        variant="outline"
                        className={`${details.badge} text-[8px] font-black px-1.5 py-0 border-none shrink-0`}
                      >
                        {asset.risco_atual}
                      </Badge>
                      <ChevronRight
                        size={14}
                        className={`transition-all ${
                          isSelected
                            ? "translate-x-0 text-red-500"
                            : "-translate-x-2 opacity-0"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Base do Card: Barra de Progresso/Risco */}
                  <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden shrink-0 border border-zinc-800/30">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        details.bar
                      } ${details.pulse ? "animate-pulse" : ""}`}
                      style={{ width: details.percentage }}
                    />
                  </div>
                </button>
              );
            })
          ) : (
            // Empty State
            <div className="col-span-full py-20 text-center opacity-50">
              <p className="text-xs text-zinc-600 italic">
                Nenhum ativo encontrado.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 3. FOOTER: Status do Sistema */}
      <div className="p-4 bg-zinc-950/80 border-t border-zinc-900 shrink-0">
        <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
              <span>SISTEMA ATIVO</span>
            </div>
            <span>24MS</span>
          </div>
          <div className="flex justify-between border-t border-zinc-900/50 pt-1 mt-1 uppercase">
            <span className="truncate">Último Check:</span>
            <span className="text-zinc-400 shrink-0 ml-2">
              {isLoading
                ? "---"
                : useAssetStore.getState().lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
