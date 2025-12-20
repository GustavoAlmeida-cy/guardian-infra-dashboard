import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { Maximize } from "lucide-react";
import type { Asset } from "@/@types/asset";

import { AssetMarkers } from "./AssetMarkers";
import { RiskLayers } from "./RiskLayers";

/**
 * Componente que ajusta o zoom sempre que os assets mudam (troca de cenário)
 */
function InitialBounds({ assets }: { assets: Asset[] }) {
  const map = useMap();

  useEffect(() => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(
        assets.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude])
      );

      // fitBounds sem animação para o carregamento inicial/troca de dados ser instantâneo e preciso
      map.fitBounds(bounds, { padding: [100, 100] });
    }
  }, [assets, map]); // Re-executa sempre que a lista de assets mudar

  return null;
}

function ZoomOutButton({ assets }: { assets: Asset[] }) {
  const map = useMap();
  const handleZoomOut = () => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(
        assets.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude])
      );
      map.fitBounds(bounds, { padding: [70, 70], duration: 1.5 });
    } else {
      map.setView([-15.7938, -47.8828], 4);
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-[500] pointer-events-auto">
      <button
        onClick={handleZoomOut}
        className="flex cursor-pointer items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg transition-all active:scale-95 shadow-2xl group"
      >
        <Maximize size={16} className="group-hover:text-white" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Visão Geral
        </span>
      </button>
    </div>
  );
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, {
        duration: 1.2,
        easeLinearity: 0.25,
        noMoveStart: true,
      });
    }
  }, [center, map]);
  return null;
}

export function MapEngine({ assets }: { assets: Asset[] }) {
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const defaultCenter: [number, number] = [-15.7938, -47.8828];

  return (
    <div className="h-full w-full relative group bg-zinc-950">
      {/* HUD: Legenda Completa Estilo Guardian Infra */}
      <div className="absolute bottom-6 left-44 z-[500] flex gap-5 bg-zinc-950/80 backdrop-blur-md px-6 py-2.5 border border-zinc-800 rounded-full shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]" />
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
            Baixo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-[#eab308] rounded-full shadow-[0_0_8px_#eab308]" />
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
            Moderado
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-[#f97316] rounded-full shadow-[0_0_8px_#f97316]" />
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
            Alto
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-[#dc2626] rounded-full shadow-[0_0_8px_#dc2626]" />
          <span className="text-[9px] text-zinc-100 font-bold uppercase tracking-tighter italic">
            Crítico
          </span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={4}
        zoomControl={false}
        className="h-full w-full"
        preferCanvas={true}
      >
        <TileLayer
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />

        <InitialBounds assets={assets} />
        <RiskLayers assets={assets} />
        <AssetMarkers assets={assets} />

        <TileLayer
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.2}
        />

        {selectedAsset?.coordenadas && (
          <ChangeView
            center={[
              selectedAsset.coordenadas.latitude,
              selectedAsset.coordenadas.longitude,
            ]}
          />
        )}

        <ZoomOutButton assets={assets} />
      </MapContainer>
    </div>
  );
}
