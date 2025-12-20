import { useState, useMemo } from "react";
import { Search, MapPin, Activity, ChevronRight } from "lucide-react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset } from "@/@types/asset";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton"; // Importando o Skeleton

interface SidebarProps {
  assets: Asset[];
  isMobile?: boolean;
}

// Componente Interno para o Esqueleto de um Item
function SidebarItemSkeleton() {
  return (
    <div className="w-full p-4 rounded-xl border border-zinc-900/80 bg-zinc-900/10 space-y-4">
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-2 flex-1">
          {/* Nome do Ativo */}
          <Skeleton className="h-3 w-3/4 bg-zinc-800" />
          {/* Localização */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded-full bg-zinc-800" />
            <Skeleton className="h-2 w-1/2 bg-zinc-900" />
          </div>
        </div>
        {/* Badge de Risco */}
        <Skeleton className="h-5 w-16 rounded-lg bg-zinc-800" />
      </div>
      {/* Barra de Progresso */}
      <Skeleton className="h-1 w-full rounded-full bg-zinc-900" />
    </div>
  );
}

export function Sidebar({ assets, isMobile }: SidebarProps) {
  const { setSelectedAsset, selectedAsset } = useAssetStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Se assets estiver vazio, assumimos que está carregando (isLoading do DashboardContent)
  const isLoading = assets.length === 0;

  const filteredAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  const getRiskDetails = (risk: string) => {
    switch (risk) {
      case "Crítico":
        return {
          badge: "bg-red-500/10 text-red-500 border-red-500/20",
          bar: "bg-red-600",
          percentage: "100%",
          pulse: true,
        };
      case "Alto":
        return {
          badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
          bar: "bg-orange-500",
          percentage: "70%",
          pulse: false,
        };
      case "Moderado":
        return {
          badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
          bar: "bg-yellow-500",
          percentage: "40%",
          pulse: false,
        };
      default:
        return {
          badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          bar: "bg-emerald-500",
          percentage: "15%",
          pulse: false,
        };
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    if (selectedAsset?.id === asset.id) {
      setSelectedAsset(null);
    } else {
      setSelectedAsset(asset);
    }
  };

  return (
    <aside
      className={`${
        isMobile ? "w-full" : "w-80"
      } h-full flex flex-col bg-zinc-950/50 backdrop-blur-xl transition-all`}
    >
      <div className="p-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <Activity className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white uppercase leading-none">
                Ativos Guardian
              </h2>
              <span className="text-[9px] text-zinc-500 font-semibold tracking-[0.2em] uppercase">
                Real-Time Monitor
              </span>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-10 bg-zinc-900" />
          ) : (
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded">
              {filteredAssets.length}/{assets.length}
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
            className="pl-9 bg-zinc-900/40 border-zinc-800 focus:border-red-500/50 focus:ring-red-500/20 text-xs h-10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Separator className="bg-zinc-900" />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            // Renderiza 5 itens de esqueleto enquanto carrega
            Array.from({ length: 5 }).map((_, i) => (
              <SidebarItemSkeleton key={i} />
            ))
          ) : filteredAssets.length > 0 ? (
            filteredAssets.map((asset) => {
              const details = getRiskDetails(asset.risco_atual);
              const isSelected = selectedAsset?.id === asset.id;

              return (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  className={`${
                    isMobile ? "w-full" : "w-full"
                  } text-left p-4 rounded-xl transition-all cursor-pointer border relative overflow-hidden group ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-700 shadow-xl"
                      : "border-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900/30"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[2px_0_10px_rgba(220,38,38,0.5)]" />
                  )}

                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`block font-bold text-xs truncate transition-colors ${
                            isSelected
                              ? "text-white"
                              : "text-zinc-400 group-hover:text-zinc-200"
                          }`}
                        >
                          {asset.nome}
                        </span>
                        {asset.risco_atual === "Crítico" && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <MapPin size={12} className="shrink-0" />
                        <span className="text-[10px] font-medium truncate uppercase tracking-tight">
                          {asset.localizacao}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`${details.badge} text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter border-none`}
                      >
                        {asset.risco_atual}
                      </Badge>
                      <ChevronRight
                        size={14}
                        className={`transition-all duration-300 ${
                          isSelected
                            ? "translate-x-0 opacity-100 text-red-500"
                            : "-translate-x-2 opacity-0"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${
                        details.bar
                      } ${
                        details.pulse
                          ? "animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                          : ""
                      }`}
                      style={{ width: details.percentage }}
                    />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <Search size={24} className="text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-600 italic">Sem resultados.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-zinc-950/80 border-t border-zinc-900">
        <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
              <span>SISTEMA ATIVO</span>
            </div>
            <span className="uppercase">Latência: 24ms</span>
          </div>
          <div className="flex justify-between border-t border-zinc-900/50 pt-1 mt-1">
            <span>ÚLTIMA ATUALIZAÇÃO:</span>
            <span className="text-zinc-400">
              {isLoading
                ? "CARREGANDO..."
                : useAssetStore.getState().lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
