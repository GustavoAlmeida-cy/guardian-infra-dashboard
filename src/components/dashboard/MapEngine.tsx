/**
 * @file MapEngine.tsx
 * @description Engine geoespacial otimizada com TacticalHUD integrado.
 * Centraliza o controle de câmera Leaflet e gerencia camadas de ativos e riscos.
 */

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useCallback, useRef } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { Maximize } from "lucide-react";
import type { Asset } from "@/@types/asset";

// --- IMPORTAÇÃO DE COMPONENTES DE CAMADA E UI ---
import { AssetMarkers } from "./assets/AssetMarkers";
import { RiskLayers } from "./maps/RiskLayers";
import { TacticalHUD } from "./tacticals/TacticalHUD";

// --- CONFIGURAÇÕES GLOBAIS ---
/** Limites máximos do mapa para evitar panning infinito fora do globo */
const WORLD_BOUNDS = L.latLngBounds([-90, -180], [90, 180]);

// --- HOOKS DE CONTROLE (LOGICA REUTILIZÁVEL) ---

/**
 * @hook useSafeFly
 * @description Implementa um semáforo de animação.
 * Bloqueia interações manuais durante transições automáticas de câmera
 * para prevenir o "congelamento" (freeze) do motor do Leaflet.
 */
function useSafeFly() {
  const map = useMap();
  const isAnimating = useRef(false);

  const safeFly = useCallback(
    (
      bounds: L.LatLngBounds | L.LatLngExpression,
      isPoint = false,
      options = {}
    ) => {
      if (isAnimating.current) return;

      isAnimating.current = true;
      map.dragging.disable();
      map.scrollWheelZoom.disable();

      if (isPoint) {
        map.flyTo(bounds as L.LatLngExpression, 16, {
          duration: 1.2,
          ...options,
        });
      } else {
        map.flyToBounds(bounds as L.LatLngBounds, {
          padding: [50, 50],
          duration: 1.5,
          ...options,
        });
      }

      map.once("moveend", () => {
        isAnimating.current = false;
        map.dragging.enable();
        map.scrollWheelZoom.enable();
      });
    },
    [map]
  );

  return { safeFly };
}

// --- SUB-COMPONENTES DE COMPORTAMENTO AUTOMÁTICO ---

/**
 * @component InitialBounds
 * @description Calcula o enquadramento ideal para visualizar todos os ativos no primeiro carregamento.
 */
function InitialBounds({ assets }: { assets: Asset[] }) {
  const { safeFly } = useSafeFly();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (assets.length > 0 && !hasInitialized.current) {
      const bounds = L.latLngBounds(
        assets.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude])
      );
      safeFly(bounds);
      hasInitialized.current = true;
    }
  }, [assets, safeFly]);

  return null;
}

/**
 * @component ChangeView
 * @description Escuta mudanças no asset selecionado e move a câmera para o ponto focal.
 */
function ChangeView({ center }: { center: [number, number] }) {
  const { safeFly } = useSafeFly();
  const lastCenter = useRef<string>("");

  useEffect(() => {
    const centerKey = center.join(",");
    if (center && centerKey !== lastCenter.current) {
      safeFly(center, true);
      lastCenter.current = centerKey;
    }
  }, [center, safeFly]);

  return null;
}

// --- MOTOR PRINCIPAL ---

/**
 * @component MapEngine
 * @description Componente raiz do mapa. Integra TileLayers, HUD tático e camadas dinâmicas.
 */
export function MapEngine({ assets }: { assets: Asset[] }) {
  const selectedAsset = useAssetStore((state) => state.selectedAsset);

  return (
    <div
      className="h-full w-full relative bg-zinc-950 overflow-hidden"
      role="application"
      aria-label="Painel Geoespacial Guardian Infra"
    >
      {/* 1. INTERFACE DE TELEMETRIA (HUD) */}
      <TacticalHUD assets={assets} />

      {/* 2. INSTÂNCIA DO MAPA */}
      <MapContainer
        center={[-15.7938, -47.8828]}
        zoom={4}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        attributionControl={false}
        maxBounds={WORLD_BOUNDS}
        className="h-full w-full outline-none"
        preferCanvas={true} // Otimização de hardware para renderização de muitos ativos
      >
        {/* Camada Base: Mapa Escuro Estilizado */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

        {/* Lógica de Câmera e Enquadramento */}
        <InitialBounds assets={assets} />

        {/* Renderização de Dados Geoespaciais */}
        <RiskLayers assets={assets} />
        <AssetMarkers assets={assets} />

        {/* Camada de Rótulos: Renderizada acima dos dados para leitura de nomes/ruas */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.3}
          pane="shadowPane"
        />

        {/* Reatividade à Seleção de Ativo */}
        {selectedAsset?.coordenadas && (
          <ChangeView
            center={[
              selectedAsset.coordenadas.latitude,
              selectedAsset.coordenadas.longitude,
            ]}
          />
        )}

        {/* 3. CONTROLES DE INTERFACE (UI FLUTUANTE) */}
        <ZoomOutButton assets={assets} />
      </MapContainer>
    </div>
  );
}

/**
 * @component ZoomOutButton
 * @description Botão de ação rápida para resetar a visão do mapa para a escala global dos ativos.
 */
function ZoomOutButton({ assets }: { assets: Asset[] }) {
  const { safeFly } = useSafeFly();

  return (
    <div className="absolute bottom-10 left-6 md:bottom-6 md:left-6 z-500">
      <button
        onClick={() => {
          const bounds =
            assets.length > 0
              ? L.latLngBounds(
                  assets.map((a) => [
                    a.coordenadas.latitude,
                    a.coordenadas.longitude,
                  ])
                )
              : WORLD_BOUNDS;
          safeFly(bounds);
        }}
        className="flex cursor-pointer items-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg 
                   hover:bg-zinc-800 hover:text-white transition-all active:scale-95 shadow-lg group"
      >
        <Maximize size={14} className="group-hover:text-white" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Geral
        </span>
      </button>
    </div>
  );
}
