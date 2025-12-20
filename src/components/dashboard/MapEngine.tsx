import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useCallback } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { Maximize } from "lucide-react";
import type { Asset, RiskLevel } from "@/@types/asset";

import { AssetMarkers } from "./AssetMarkers";
import { RiskLayers } from "./RiskLayers";

const WORLD_BOUNDS = L.latLngBounds([-90, -180], [90, 180]);

/**
 * Hook para gerenciar as permissões do mapa de forma segura
 */
function useMapInteractions() {
  const map = useMap();

  const setMapEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
      } else {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
      }
    },
    [map]
  );

  return { setMapEnabled };
}

function InitialBounds({ assets }: { assets: Asset[] }) {
  const map = useMap();
  const { setMapEnabled } = useMapInteractions();

  useEffect(() => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(
        assets.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude])
      );

      setMapEnabled(false);
      map.fitBounds(bounds, { padding: [40, 40], animate: true });

      // Libera o mapa assim que a animação inicial termina
      map.once("moveend", () => setMapEnabled(true));
    }
  }, [assets, map, setMapEnabled]);

  return null;
}

function ZoomOutButton({ assets }: { assets: Asset[] }) {
  const map = useMap();
  const { setMapEnabled } = useMapInteractions();

  const handleZoomOut = () => {
    setMapEnabled(false); // Trava imediatamente

    if (assets.length > 0) {
      const bounds = L.latLngBounds(
        assets.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude])
      );
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    } else {
      map.flyTo([-15.7938, -47.8828], 4, { duration: 1.5 });
    }

    // O evento 'moveend' garante que só destrava quando o flyTo termina
    map.once("moveend", () => setMapEnabled(true));
  };

  return (
    <div className="absolute bottom-10 left-4 md:bottom-6 md:left-6 z-500 pointer-events-auto">
      <button
        onClick={handleZoomOut}
        className="flex cursor-pointer items-center gap-2 bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 px-4 py-3 md:px-3 md:py-2 rounded-xl md:rounded-lg transition-all active:scale-95 shadow-2xl group"
      >
        <Maximize size={18} className="group-hover:text-white" />
        <span className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider">
          Visão Geral
        </span>
      </button>
    </div>
  );
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  const { setMapEnabled } = useMapInteractions();

  useEffect(() => {
    if (center) {
      setMapEnabled(false);
      map.flyTo(center, 16, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
      map.once("moveend", () => setMapEnabled(true));
    }
  }, [center, map, setMapEnabled]);

  return null;
}

export function MapEngine({ assets }: { assets: Asset[] }) {
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const defaultCenter: [number, number] = [-15.7938, -47.8828];

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
      {/* HUD de monitoramento */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-500 gap-6 bg-zinc-950/80 backdrop-blur-xl px-6 py-2 border border-zinc-800 rounded-lg shadow-2xl">
        {Object.entries(stats).map(([level, value]) => {
          const isCritical = level === "Crítico";
          const dotColor = {
            Baixo: "#10b981",
            Moderado: "#eab308",
            Alto: "#f97316",
            Crítico: "#dc2626",
          }[level as RiskLevel];

          return (
            <div
              key={level}
              className="flex items-center gap-3 border-r border-zinc-800/50 pr-4 last:border-0 last:pr-2"
            >
              <div
                className={`w-3 h-1 rounded-full ${
                  isCritical ? "animate-pulse" : ""
                }`}
                style={{
                  backgroundColor: dotColor,
                  boxShadow: `0 0 8px ${dotColor}`,
                }}
              />
              <div className="flex flex-col">
                <span
                  className={`text-[7px] font-bold uppercase tracking-widest ${
                    isCritical
                      ? "text-red-500 italic font-black"
                      : "text-zinc-500"
                  }`}
                >
                  {level}
                </span>
                <span
                  className={`text-xs font-mono font-bold leading-none ${
                    isCritical ? "text-red-500" : "text-zinc-200"
                  }`}
                >
                  {value}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={4}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        attributionControl={false}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        preferCanvas={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          noWrap={true}
          bounds={WORLD_BOUNDS}
        />

        <InitialBounds assets={assets} />
        <RiskLayers assets={assets} />
        <AssetMarkers assets={assets} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.15}
          noWrap={true}
          bounds={WORLD_BOUNDS}
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
