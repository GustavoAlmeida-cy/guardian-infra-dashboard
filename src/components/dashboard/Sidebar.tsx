import { useState } from "react";
import { Search, MapPin, AlertTriangle } from "lucide-react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset } from "@/@types/asset";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  assets: Asset[];
}

export function Sidebar({ assets }: SidebarProps) {
  const { setSelectedAsset, selectedAsset } = useAssetStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssets = assets.filter(
    (a) =>
      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "Crítico":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      case "Alto":
        return "bg-orange-500/20 text-orange-500 border-orange-500/50";
      case "Moderado":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      default:
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/50";
    }
  };

  return (
    <aside className="w-85 h-full border-l border-zinc-800 bg-zinc-950 flex flex-col shadow-2xl z-20">
      {/* Header da Sidebar */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">
              Ativos Guardian
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
              Monitoramento de Infraestrutura
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={14}
          />
          <Input
            placeholder="Filtrar por nome ou local..."
            className="pl-9 bg-zinc-900/50 border-zinc-800 focus:ring-red-500/50 text-xs h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Separator className="bg-zinc-800/50" />

      {/* Lista de Ativos */}
      <ScrollArea className="flex-1 px-3">
        <div className="py-4 space-y-2 w-[85%]">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full text-left p-4 rounded-xl transition-all border group ${
                  selectedAsset?.id === asset.id
                    ? "bg-zinc-900 border-zinc-700 ring-1 ring-zinc-700 shadow-lg"
                    : "border-transparent hover:bg-zinc-900/40 hover:border-zinc-800"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1 overflow-hidden">
                    <span className="block font-semibold text-xs text-zinc-200 truncate group-hover:text-white transition-colors">
                      {asset.nome}
                    </span>
                    <div className="flex items-center gap-1 text-zinc-500">
                      <MapPin size={10} />
                      <span className="text-[10px] truncate">
                        {asset.localizacao}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getRiskStyles(
                      asset.risco_atual
                    )} text-[9px] font-bold px-1.5 py-0 uppercase tracking-tighter`}
                  >
                    {asset.risco_atual}
                  </Badge>
                </div>

                {asset.risco_atual === "Crítico" && (
                  <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 animate-pulse w-full" />
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-zinc-600 italic">
                Nenhum ativo encontrado.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
