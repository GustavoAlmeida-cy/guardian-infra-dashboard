import { Marker, Tooltip, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useCallback, useState } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset, RiskLevel } from "@/@types/asset";

const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

// Quando o zoom for 16 ou maior, o marcador desaparece para mostrar apenas o polígono
const ZOOM_THRESHOLD = 16;

export function AssetMarkers({ assets }: { assets: Asset[] }) {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const [zoom, setZoom] = useState(5);

  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  const getIcon = useCallback((risk: RiskLevel) => {
    const isCritical = risk === "Crítico";
    const color = RISK_COLORS[risk];

    return L.divIcon({
      className: "custom-marker-container",
      html: `
        <div class="relative flex items-center justify-center transition-all duration-500">
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

  // LÓGICA DE VISIBILIDADE:
  // Se o zoom for maior ou igual ao limite, não renderizamos nada (visibilidade zero)
  if (zoom >= (ZOOM_THRESHOLD - 3)) return null;

  return (
    <>
      {assets.map((asset) => {
        const color = RISK_COLORS[asset.risco_atual];
        const isCritical = asset.risco_atual === "Crítico";

        return (
          <Marker
            key={`marker-${asset.id}`}
            position={[asset.coordenadas.latitude, asset.coordenadas.longitude]}
            icon={getIcon(asset.risco_atual)}
            eventHandlers={{ click: () => setSelectedAsset(asset) }}
          >
            <Tooltip
              sticky
              direction="top"
              offset={[0, -10]}
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
          </Marker>
        );
      })}
    </>
  );
}
