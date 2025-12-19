import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  // AlertTriangle,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset } from "@/@types/asset";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  assets: Asset[];
  isMobile?: boolean; // Prop para ajustar o layout se estiver no Drawer
}

export function Sidebar({ assets, isMobile }: SidebarProps) {
  const { setSelectedAsset, selectedAsset } = useAssetStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Memoizar a busca para evitar cálculos desnecessários em cada render
  const filteredAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "Crítico":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Alto":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Moderado":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  return (
    <aside
      className={`${
        isMobile ? "w-full" : "w-85"
      } h-full flex flex-col bg-zinc-950/50 backdrop-blur-xl`}
    >
      {/* Header com Branding */}
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
          {/* Contador de ativos filtrados */}
          <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded">
            {filteredAssets.length}/{assets.length}
          </span>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors"
            size={14}
          />
          <Input
            placeholder="Filtrar infraestrutura..."
            className="pl-9 bg-zinc-900/40 border-zinc-800 focus:border-red-500/50 focus:ring-red-500/20 text-xs h-10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Separator className="bg-zinc-900" />

      {/* Lista de Ativos */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer border relative overflow-hidden group ${
                  selectedAsset?.id === asset.id
                    ? "bg-zinc-900/80 border-zinc-700 shadow-xl"
                    : "border-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/30"
                }`}
              >
                {/* Indicador lateral de seleção */}
                {selectedAsset?.id === asset.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[2px_0_10px_rgba(220,38,38,0.5)]" />
                )}

                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`block font-bold text-xs truncate transition-colors ${
                          selectedAsset?.id === asset.id
                            ? "text-white"
                            : "text-zinc-300"
                        }`}
                      >
                        {asset.nome}
                      </span>
                      {asset.risco_atual === "Crítico" && (
                        <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
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
                      className={`${getRiskStyles(
                        asset.risco_atual
                      )} text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter border-none`}
                    >
                      {asset.risco_atual}
                    </Badge>
                    <ChevronRight
                      size={14}
                      className={`transition-transform duration-300 ${
                        selectedAsset?.id === asset.id
                          ? "translate-x-0 opacity-100 text-red-500"
                          : "-translate-x-2 opacity-0"
                      }`}
                    />
                  </div>
                </div>

                {/* Progress Bar para Críticos e selecionados */}
                {(asset.risco_atual === "Crítico" ||
                  selectedAsset?.id === asset.id) && (
                  <div className="mt-3 h-[2px] w-full bg-zinc-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        asset.risco_atual === "Crítico"
                          ? "bg-red-600 animate-pulse"
                          : "bg-zinc-600"
                      }`}
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="p-3 bg-zinc-900 rounded-full">
                <Search size={20} className="text-zinc-700" />
              </div>
              <p className="text-xs text-zinc-600 font-medium italic">
                Nenhum ativo localizado <br /> sob os critérios atuais.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer da Sidebar com Status do Sistema */}
      <div className="p-4 bg-zinc-950/80 border-t border-zinc-900">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SISTEMA ONLINE</span>
          </div>
          <span>V.1.0-BETA</span>
        </div>
      </div>
    </aside>
  );
}
