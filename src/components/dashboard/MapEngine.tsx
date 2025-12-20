import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useCallback } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import type { Asset, RiskLevel } from "@/@types/asset";
import { Maximize } from "lucide-react"; // Certifique-se de ter o lucide-react instalado

// Configuração de cores constante fora do componente para evitar recriação
const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#dc2626",
  Alto: "#f97316",
  Moderado: "#eab308",
  Baixo: "#10b981",
};

/**
 * Componente do Botão de Zoom Out
 */
function ZoomOutButton({ assets }: { assets: Asset[] }) {
  const map = useMap();

  const handleZoomOut = () => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(
        assets.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    } else {
      map.setView([-15.7938, -47.8828], 4);
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-500 pointer-events-auto">
      <button
        onClick={handleZoomOut}
        className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg transition-all active:scale-95 shadow-2xl"
      >
        <Maximize size={16} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Visão Geral
        </span>
      </button>
    </div>
  );
}

/**
 * Componente otimizado para gerenciar a câmera com suavidade.
 */
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, {
        duration: 1.5,
        easeLinearity: 0.25,
        noMoveStart: true,
      });
    }
  }, [center, map]);

  return null;
}

interface MapEngineProps {
  assets: Asset[];
}

export function MapEngine({ assets }: MapEngineProps) {
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);

  const defaultCenter: [number, number] = [-15.7938, -47.8828];

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
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, []);

  const renderedMarkers = useMemo(() => {
    return assets.map((asset) => (
      <Marker
        key={`${asset.id}-${asset.risco_atual}`}
        position={[asset.coordenadas.latitude, asset.coordenadas.longitude]}
        icon={getIcon(asset.risco_atual)}
        eventHandlers={{
          click: () => setSelectedAsset(asset),
        }}
      />
    ));
  }, [assets, getIcon, setSelectedAsset]);

  return (
    <div className="h-full w-full relative group">
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-400" />

      <MapContainer
        center={defaultCenter}
        zoom={4}
        zoomControl={false}
        className="h-full w-full bg-zinc-950"
        preferCanvas={true}
      >
        <TileLayer
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/spotify_dark/{z}/{x}/{y}{r}.png"
          className="grayscale brightness-[0.8] contrast-[1.2]"
        />

        {renderedMarkers}

        {selectedAsset?.coordenadas && (
          <ChangeView
            center={[
              selectedAsset.coordenadas.latitude,
              selectedAsset.coordenadas.longitude,
            ]}
          />
        )}

        {/* Adicionado o botão aqui dentro do MapContainer para ter acesso ao useMap */}
        <ZoomOutButton assets={assets} />
      </MapContainer>
    </div>
  );
}
