import { Polygon, Tooltip } from "react-leaflet";
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

  // Raio do hexágono (ajustado para uma escala visual melhor)
  const HEX_RADIUS = 0.005;

  /**
   * Gera pontos do hexágono centralizados na coordenada do asset
   */
  const getHexagonPoints = (
    lat: number,
    lng: number,
    radius: number
  ): [number, number][] => {
    const points: [number, number][] = [];

    // Fator de correção para longitude baseado na latitude (projeção Mercator básica)
    // Isso evita que o hexágono fique "esticado" horizontalmente
    const aspectCorrection = Math.cos(lat * (Math.PI / 180));
    const lngRadius = radius / aspectCorrection;

    for (let i = 0; i < 6; i++) {
      // 60 graus por ponto. Começamos em 0 para pontas nas laterais
      // ou 30 para ponta no topo (estilo H3)
      const angle_deg = 60 * i + 30;
      const angle_rad = (Math.PI / 180) * angle_deg;

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
        const color = RISK_COLORS[asset.risco_atual];
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
              fillOpacity: isCritical ? 0.5 : 0.25,
              color: color,
              weight: isCritical ? 2 : 1,
              opacity: 0.6,
              lineJoin: "round",
              className: `
                transition-all duration-500 cursor-pointer hover:fill-opacity-60
                ${
                  isCritical
                    ? "animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                    : ""
                }
              `,
            }}
          >
            <Tooltip
              sticky
              direction="top"
              className="bg-zinc-950/90 border-zinc-800 text-white font-mono text-[10px] rounded-md shadow-2xl"
            >
              <div className="flex flex-col gap-1 p-1">
                <span className="text-zinc-500 text-[8px] uppercase tracking-tighter">
                  Monitoramento em Tempo Real
                </span>
                <span className="font-bold border-b border-white/10 pb-1">
                  {asset.nome}
                </span>
                <span className="flex items-center gap-1.5 mt-1 font-bold">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  RISCO {asset.risco_atual.toUpperCase()}
                </span>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
