/**
 * @file AssetMarkers.tsx
 * @description Gerencia a renderização de marcadores pontuais de ativos.
 * Inclui lógica de snapping para alinhamento com a grade de hexágonos e
 * controle de visibilidade baseado no nível de zoom.
 */

import { Marker, Tooltip, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useCallback, useState, memo } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { getSnappedCenter } from "@/utils/grid";
import type { Asset, RiskLevel } from "@/@types/asset";
import {
  TacticalTooltipContent,
  TACTICAL_TOOLTIP_CLASS,
} from "../tacticals/TacticalTooltip";

/**
 * Cores de risco consistentes com o design system tático.
 */
const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

/**
 * @constant ZOOM_THRESHOLD
 * Define o ponto onde os marcadores dão lugar à malha de hexágonos.
 */
const ZOOM_THRESHOLD = 16;

export const AssetMarkers = memo(({ assets }: { assets: Asset[] }) => {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const [zoom, setZoom] = useState(5);

  /**
   * Monitora o zoom do mapa para controlar a densidade visual.
   */
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  /**
   * @function getIcon
   * Gera um ícone Leaflet customizado usando classes Tailwind.
   * SEO/A11y: O marcador utiliza elementos visuais que indicam status sem depender apenas de cor.
   */
  const getIcon = useCallback((risk: RiskLevel) => {
    const isCritical = risk === "Crítico";
    const color = RISK_COLORS[risk];

    return L.divIcon({
      className: "custom-marker-container",
      html: `
        <div class="relative flex items-center justify-center transition-all duration-500" role="img" aria-label="Status: ${risk}">
          ${
            isCritical
              ? `<div class="absolute h-8 w-8 rounded-full bg-red-600/20 animate-ping"></div>`
              : ""
          }
          <div class="absolute h-6 w-6 rounded-full blur-md opacity-40" style="background-color: ${color}"></div>
          <div class="relative h-3.5 w-3.5 rounded-full border-[1.5px] border-white shadow-lg transition-transform duration-300 hover:scale-150" 
               style="background-color: ${color}; box-shadow: 0 0 10px ${color}80"></div>
        </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, []);

  /**
   * Otimização de Performance:
   * Se o zoom for alto, desmontamos os marcadores para aliviar o DOM,
   * já que a RiskLayer (hexágonos) assume a representação visual.
   */
  if (zoom >= ZOOM_THRESHOLD - 2) return null;

  return (
    <>
      {assets.map((asset) => {
        /**
         * Lógica de Alinhamento (Snapping):
         * Garante que o marcador esteja exatamente no centro matemático do hexágono da grade.
         */
        const snappedPosition = getSnappedCenter(
          asset.coordenadas.latitude,
          asset.coordenadas.longitude
        );

        return (
          <Marker
            key={`marker-${asset.id}`}
            position={snappedPosition}
            icon={getIcon(asset.risco_atual)}
            eventHandlers={{
              click: () => setSelectedAsset(asset),
            }}
          >
            {/* INTEGRAÇÃO: Tooltip Padronizado
                Consome o componente TacticalTooltipContent para paridade visual com os hexágonos.
            */}
            <Tooltip
              sticky
              direction="top"
              offset={[0, -10]}
              className={TACTICAL_TOOLTIP_CLASS}
            >
              <TacticalTooltipContent
                nome={asset.nome}
                risco={asset.risco_atual}
              />
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
});

AssetMarkers.displayName = "AssetMarkers";
