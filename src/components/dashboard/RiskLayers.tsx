import { Polygon, Tooltip, useMapEvents } from "react-leaflet";
import { useState, useMemo } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { getSnappedCenter } from "@/utils/grid"; // Certifique-se de que o caminho está correto
import type { Asset, RiskLevel } from "@/@types/asset";

const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

// Importante: O raio aqui deve ser o mesmo (ou ligeiramente menor) que o GRID_SIZE do seu utilitário
const HEX_RADIUS = 0.0035;
const ZOOM_THRESHOLD = 16;

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

function AssetHexagon({
  asset,
  zoom,
  isSelected,
  onSelect,
  isMapMoving,
}: {
  asset: Asset;
  zoom: number;
  isSelected: boolean;
  onSelect: (asset: Asset) => void;
  isMapMoving: boolean;
}) {
  const isCritical = asset.risco_atual === "Crítico";
  const color = RISK_COLORS[asset.risco_atual];

  // Lógica de Grid: Calcula o centro da malha para este asset
  const points = useMemo(() => {
    const [snappedLat, snappedLng] = getSnappedCenter(
      asset.coordenadas.latitude,
      asset.coordenadas.longitude
    );
    return getHexagonPoints(snappedLat, snappedLng, HEX_RADIUS);
  }, [asset.coordenadas.latitude, asset.coordenadas.longitude]);

  const weight = useMemo(() => {
    if (isMapMoving) return 0.5;
    const baseWeight = zoom > 12 ? 1 : zoom > 8 ? 1.5 : 2;
    if (isSelected) return baseWeight + 2;
    if (isCritical) return baseWeight + 1;
    return baseWeight;
  }, [zoom, isSelected, isCritical, isMapMoving]);

  return (
    <Polygon
      positions={points}
      eventHandlers={{ click: () => onSelect(asset) }}
      interactive={true}
      pathOptions={{
        fillColor: color,
        // Opacidade aumenta conforme o zoom aproxima para dar o aspecto de malha sólida
        fillOpacity: isSelected ? 0.7 : zoom >= ZOOM_THRESHOLD - 3 ? 0.5 : 0.2,
        color: isMapMoving ? color : isSelected ? "#ffffff" : color,
        weight: weight,
        opacity: isMapMoving ? 0.2 : isSelected ? 1 : 0.6,
        lineJoin: "round",
        className: `
          leaflet-interactive
          transition-all duration-500
          ${isCritical ? "animate-pulse" : ""} 
          ${isSelected && !isMapMoving ? "drop-shadow-white-glow" : ""}
          ${isMapMoving ? "blur-[1px]" : "blur-0"} 
        `,
      }}
    >
      {/* O Tooltip do polígono só ativa quando o marcador some para evitar duplicidade */}
      {zoom >= ZOOM_THRESHOLD - 3 && (
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
      )}
    </Polygon>
  );
}

export function RiskLayers({ assets }: { assets: Asset[] }) {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const [zoom, setZoom] = useState(5);
  const [isMapMoving, setIsMapMoving] = useState(false);

  const map = useMapEvents({
    zoomstart: () => setIsMapMoving(true),
    movestart: () => setIsMapMoving(true),
    zoomend: () => {
      setZoom(map.getZoom());
      setIsMapMoving(false);
    },
    moveend: () => {
      setZoom(map.getZoom());
      setIsMapMoving(false);
    },
  });

  return (
    <>
      {assets.map((asset) => (
        <AssetHexagon
          key={`hex-${asset.id}`}
          asset={asset}
          zoom={zoom}
          isSelected={selectedAsset?.id === asset.id}
          onSelect={setSelectedAsset}
          isMapMoving={isMapMoving}
        />
      ))}
    </>
  );
}
