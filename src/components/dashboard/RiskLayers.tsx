import { Polygon, Tooltip, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset, RiskLevel } from "@/@types/asset";

const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

export function RiskLayers({ assets }: { assets: Asset[] }) {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);

  // Estado para rastrear o zoom e ajustar as bordas dinamicamente
  const [zoom, setZoom] = useState(5);
  const map = useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const HEX_RADIUS = 0.005;

  // Cálculo de espessura da borda baseado no zoom
  // Quanto maior o zoom (perto), mais fina a borda relativa para não cobrir o preenchimento
  const getDynamicWeight = (isCritical: boolean, isSelected: boolean) => {
    const baseWeight = zoom > 12 ? 1 : zoom > 8 ? 1.5 : 2;
    if (isSelected) return baseWeight + 2;
    if (isCritical) return baseWeight + 1;
    return baseWeight;
  };

  const getHexagonPoints = (
    lat: number,
    lng: number,
    radius: number
  ): [number, number][] => {
    const points: [number, number][] = [];
    const aspectCorrection = Math.cos(lat * (Math.PI / 180));
    const lngRadius = radius / aspectCorrection;

    for (let i = 0; i < 6; i++) {
      const angle_rad = (Math.PI / 180) * (60 * i + 30);
      points.push([
        lat + radius * Math.cos(angle_rad),
        lng + lngRadius * Math.sin(angle_rad),
      ]);
    }
    return points;
  };

  return (
    <>
      {assets.map((asset) => {
        const isCritical = asset.risco_atual === "Crítico";
        const isSelected = selectedAsset?.id === asset.id;
        const color = RISK_COLORS[asset.risco_atual];
        const weight = getDynamicWeight(isCritical, isSelected);

        const points = getHexagonPoints(
          asset.coordenadas.latitude,
          asset.coordenadas.longitude,
          HEX_RADIUS
        );

        return (
          <Polygon
            key={`hex-${asset.id}-${asset.risco_atual}`}
            positions={points}
            eventHandlers={{
              click: () => setSelectedAsset(asset),
            }}
            pathOptions={{
              fillColor: color,
              fillOpacity: isSelected ? 0.7 : isCritical ? 0.4 : 0.2,
              color: isSelected ? "#ffffff" : color,
              weight: weight,
              opacity: isSelected ? 1 : 0.6,
              lineJoin: "round",
              // Aumentamos o suavizado da transição para o zoom
              className: `
                transition-all duration-300 cursor-pointer 
                hover:fill-opacity-80 hover:stroke-[3px]
                ${
                  isCritical ? "animate-pulse-intense drop-shadow-red-glow" : ""
                }
                ${isSelected ? "drop-shadow-white-glow" : ""}
              `,
            }}
          >
            <Tooltip
              sticky
              direction="top"
              className="bg-zinc-950/90! border-zinc-800! text-white! font-mono text-[10px]! rounded-md! shadow-2xl!"
            >
              <div className="flex flex-col gap-1 p-1">
                <span className="text-zinc-500 text-[8px] uppercase tracking-widest font-bold">
                  {isCritical ? "⚠️ ALERTA" : "NORMAL"}
                </span>
                <span className="font-bold border-b border-white/10 pb-1">
                  {asset.nome}
                </span>
                <span className="flex items-center gap-1.5 mt-1 font-bold">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {asset.risco_atual.toUpperCase()}
                </span>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
