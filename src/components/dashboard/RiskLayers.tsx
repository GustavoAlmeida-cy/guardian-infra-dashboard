import { Polygon, Tooltip, useMapEvents } from "react-leaflet";
import { useState, useMemo } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset, RiskLevel } from "@/@types/asset";

const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

const HEX_RADIUS = 0.005;

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
}: {
  asset: Asset;
  zoom: number;
  isSelected: boolean;
  onSelect: (asset: Asset) => void;
}) {
  const isCritical = asset.risco_atual === "Crítico";
  const color = RISK_COLORS[asset.risco_atual];

  const points = useMemo(
    () =>
      getHexagonPoints(
        asset.coordenadas.latitude,
        asset.coordenadas.longitude,
        HEX_RADIUS
      ),
    [asset.coordenadas.latitude, asset.coordenadas.longitude]
  );

  const weight = useMemo(() => {
    const baseWeight = zoom > 12 ? 1 : zoom > 8 ? 1.5 : 2;
    if (isSelected) return baseWeight + 2;
    if (isCritical) return baseWeight + 1;
    return baseWeight;
  }, [zoom, isSelected, isCritical]);

  return (
    <Polygon
      positions={points}
      eventHandlers={{ click: () => onSelect(asset) }}
      // Adicionado explicitamente para evitar drift no zoom
      interactive={true}
      pathOptions={{
        fillColor: color,
        fillOpacity: isSelected ? 0.7 : isCritical ? 0.4 : 0.2,
        color: isSelected ? "#ffffff" : color,
        weight: weight,
        opacity: isSelected ? 1 : 0.6,
        lineJoin: "round",
        // IMPORTANTE: Removido qualquer transição CSS que cause o "atraso" visual
        className: `
          leaflet-interactive
          ${isCritical ? "animate-pulse" : ""} 
          ${isSelected ? "drop-shadow-white-glow" : ""}
        `,
      }}
    >
      <Tooltip
        sticky
        direction="top"
        className="bg-zinc-950/90! border-zinc-800! text-white! font-mono text-[10px]! rounded-md! shadow-2xl!"
      >
        {/* ... conteúdo do tooltip igual ... */}
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
}

export function RiskLayers({ assets }: { assets: Asset[] }) {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);

  // UseMapEvents configurado para atualizar o zoom de forma mais suave
  const [zoom, setZoom] = useState(5);
  const map = useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
    // Forçar o redesenho dos vetores no final da animação para garantir alinhamento
    moveend: () => {
      setZoom(map.getZoom());
    },
  });

  return (
    <>
      {assets.map((asset) => (
        <AssetHexagon
          key={`hex-${asset.id}`} // Removido risco da key para evitar recriação desnecessária
          asset={asset}
          zoom={zoom}
          isSelected={selectedAsset?.id === asset.id}
          onSelect={setSelectedAsset}
        />
      ))}
    </>
  );
}
