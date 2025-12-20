import { Marker } from "react-leaflet";
import L from "leaflet";
import { useCallback } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset, RiskLevel } from "@/@types/asset";

const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

export function AssetMarkers({ assets }: { assets: Asset[] }) {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);

  const getIcon = useCallback((risk: RiskLevel) => {
    const isCritical = risk === "Crítico";
    const color = RISK_COLORS[risk];

    return L.divIcon({
      className: "custom-marker-container",
      html: `
        <div class="relative flex items-center justify-center">
          ${
            isCritical
              ? `<div class="absolute h-8 w-8 rounded-full bg-red-600/20 animate-ping"></div>`
              : ""
          }
          <div class="absolute h-6 w-6 rounded-full blur-md" style="background-color: ${color}60"></div>
          <div class="relative h-3.5 w-3.5 rounded-full border-[1.5px] border-white shadow-2xl transition-transform duration-300 hover:scale-150" 
               style="background-color: ${color}; box-shadow: 0 0 10px ${color}80"></div>
        </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, []);

  return (
    <>
      {assets.map((asset) => (
        <Marker
          key={`${asset.id}-${asset.risco_atual}`}
          position={[asset.coordenadas.latitude, asset.coordenadas.longitude]}
          icon={getIcon(asset.risco_atual)}
          eventHandlers={{ click: () => setSelectedAsset(asset) }}
        />
      ))}
    </>
  );
}
