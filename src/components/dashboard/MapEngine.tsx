import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { Maximize } from "lucide-react";
import type { Asset, RiskLevel } from "@/@types/asset";

import { AssetMarkers } from "./AssetMarkers";
import { RiskLayers } from "./RiskLayers";

/**
 * Ajusta o zoom apenas se o usuário estiver em visão macro (zoom < 10)
 * Isso evita que o mapa "pule" durante o polling se o usuário estiver analisando um ponto.
 */
function InitialBounds({ assets }: { assets: Asset[] }) {
  const map = useMap();

  useEffect(() => {
    const currentZoom = map.getZoom();
    if (assets.length > 0 && currentZoom < 10) {
      const bounds = L.latLngBounds(
        assets.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude])
      );
      map.fitBounds(bounds, { padding: [100, 100], animate: true });
    }
  }, [assets, map]);

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
    <div className="absolute bottom-6 left-6 z-500 pointer-events-auto">
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

  // Cálculo de estatísticas para o HUD
  const stats = useMemo(() => {
    const total = assets.length;
    if (total === 0) return { Crítico: 0, Alto: 0, Moderado: 0, Baixo: 0 };

    const counts = assets.reduce((acc, asset) => {
      acc[asset.risco_atual] = (acc[asset.risco_atual] || 0) + 1;
      return acc;
    }, {} as Record<RiskLevel, number>);

    return {
      Crítico: Math.round(((counts["Crítico"] || 0) / total) * 100),
      Alto: Math.round(((counts["Alto"] || 0) / total) * 100),
      Moderado: Math.round(((counts["Moderado"] || 0) / total) * 100),
      Baixo: Math.round(((counts["Baixo"] || 0) / total) * 100),
    };
  }, [assets]);

  return (
    <div className="h-full w-full relative group bg-zinc-950 overflow-hidden">
      {/* HUD: Painel de Controle de Risco (Centralizado) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-500 flex gap-2 md:gap-6 bg-zinc-950/80 backdrop-blur-xl px-4 py-2 border border-zinc-800 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Nível: Baixo */}
        <div className="flex items-center gap-3 border-r border-zinc-800/50 pr-4 last:border-0">
          <div className="w-3 h-1 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">
              Baixo
            </span>
            <span className="text-xs text-zinc-200 font-mono font-bold leading-none">
              {stats.Baixo}%
            </span>
          </div>
        </div>

        {/* Nível: Moderado */}
        <div className="flex items-center gap-3 border-r border-zinc-800/50 pr-4 last:border-0">
          <div className="w-3 h-1 bg-[#eab308] rounded-full shadow-[0_0_8px_#eab308]" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">
              Moderado
            </span>
            <span className="text-xs text-zinc-200 font-mono font-bold leading-none">
              {stats.Moderado}%
            </span>
          </div>
        </div>

        {/* Nível: Alto */}
        <div className="flex items-center gap-3 border-r border-zinc-800/50 pr-4 last:border-0">
          <div className="w-3 h-1 bg-[#f97316] rounded-full shadow-[0_0_8px_#f97316]" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">
              Alto
            </span>
            <span className="text-xs text-zinc-200 font-mono font-bold leading-none">
              {stats.Alto}%
            </span>
          </div>
        </div>

        {/* Nível: Crítico (Destaque com Alerta) */}
        <div className="flex items-center gap-3 pr-2">
          <div className="w-3 h-1 bg-[#dc2626] rounded-full shadow-red-glow animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[7px] text-red-500 font-black uppercase tracking-widest italic">
              Crítico
            </span>
            <span className="text-xs text-red-500 font-mono font-black leading-none">
              {stats.Crítico}%
            </span>
          </div>
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

        {/* Camada de Labels com opacidade ultra-baixa para não poluir os polígonos */}
        <TileLayer
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.15}
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
