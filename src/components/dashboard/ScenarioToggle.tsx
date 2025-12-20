import { useAssetStore } from "@/store/useAssetStore";
import { Globe, Map as MapIcon, RefreshCw } from "lucide-react";

export function ScenarioToggle() {
  const { dataSource, setDataSource, lastUpdate } = useAssetStore();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex p-1 gap-2 bg-zinc-950/80 border border-zinc-800 rounded-xl backdrop-blur-md shadow-2xl">
        <button
          onClick={() => setDataSource("nacional")}
          className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            dataSource === "nacional"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Globe size={14} />
          Nacional
        </button>
        <button
          onClick={() => setDataSource("bh")}
          className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            dataSource === "bh"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <MapIcon size={14} />
          Belo Horizonte
        </button>
      </div>

      {/* Indicador de Sincronismo abaixo do botão */}
      <div className="flex items-center gap-2 px-2">
        <RefreshCw size={10} className="text-zinc-600 animate-spin-slow" />
        <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-tighter">
          Atualizado em: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
