/**
 * @file RiskLayers.tsx
 * @description Renderiza a camada de grade hexagonal tática sobre o mapa.
 * Utiliza otimizações de renderização para garantir fluidez mesmo com grande volume de dados.
 */

import { Polygon, Tooltip, useMapEvents } from "react-leaflet";
import { useState, useMemo, memo } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { getSnappedCenter } from "@/utils/grid";
import type { Asset } from "@/@types/asset";
import {
  TacticalTooltipContent,
  TACTICAL_TOOLTIP_CLASS,
} from "./TacticalTooltip";

/**
 * Cores semânticas baseadas no nível de risco para consistência visual.
 */
const RISK_COLORS = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

/**
 * Configurações da Grid Tática
 * @constant HEX_RADIUS Define o tamanho da célula do hexágono.
 * @constant ZOOM_THRESHOLD Define em qual nível de zoom a grade se torna detalhada.
 */
const HEX_RADIUS = 0.0035;
const ZOOM_THRESHOLD = 16;

/**
 * Calcula os vértices de um hexágono regular.
 * Aplica uma correção de aspecto baseada na latitude para evitar deformação (achatamento).
 */
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

/**
 * Componente de Hexágono Individual (Memoizado)
 * O uso de 'memo' evita re-renderizações desnecessárias quando o mapa se move
 * mas os dados do asset não mudaram.
 */
const AssetHexagon = memo(
  ({
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
  }) => {
    const isCritical = asset.risco_atual === "Crítico";
    const color = RISK_COLORS[asset.risco_atual];

    /**
     * Calcula a geometria do hexágono apenas se a coordenada mudar.
     * getSnappedCenter garante que o hexágono se alinhe perfeitamente à malha global.
     */
    const points = useMemo(() => {
      const [snappedLat, snappedLng] = getSnappedCenter(
        asset.coordenadas.latitude,
        asset.coordenadas.longitude
      );
      return getHexagonPoints(snappedLat, snappedLng, HEX_RADIUS);
    }, [asset.coordenadas.latitude, asset.coordenadas.longitude]);

    return (
      <Polygon
        positions={points}
        eventHandlers={{ click: () => onSelect(asset) }}
        pathOptions={{
          fillColor: color,
          // A opacidade aumenta conforme o usuário se aproxima do asset
          fillOpacity: isSelected
            ? 0.7
            : zoom >= ZOOM_THRESHOLD - 3
            ? 0.5
            : 0.2,
          color: isMapMoving ? color : isSelected ? "#ffffff" : color,
          // Ajuste dinâmico de espessura para feedback visual de seleção e risco
          weight: isMapMoving ? 0.5 : isSelected ? 3 : isCritical ? 2 : 1,
          opacity: isMapMoving ? 0.2 : isSelected ? 1 : 0.6,
        }}
      >
        {/* Tooltip Unificado: Renderizado apenas em níveis de zoom próximos para performance */}
        {zoom >= ZOOM_THRESHOLD - 3 && (
          <Tooltip sticky direction="top" className={TACTICAL_TOOLTIP_CLASS}>
            <TacticalTooltipContent
              nome={asset.nome}
              risco={asset.risco_atual}
            />
          </Tooltip>
        )}
      </Polygon>
    );
  }
);

AssetHexagon.displayName = "AssetHexagon";

/**
 * Gerenciador das camadas de risco (RiskLayers)
 * Escuta eventos do mapa para otimizar a renderização durante interações.
 */
export function RiskLayers({ assets }: { assets: Asset[] }) {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const [zoom, setZoom] = useState(5);
  const [isMapMoving, setIsMapMoving] = useState(false);

  /**
   * Hook para monitorar o estado do mapa.
   * Reduzimos a complexidade visual (isMapMoving) durante o arraste para manter 60 FPS.
   */
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
