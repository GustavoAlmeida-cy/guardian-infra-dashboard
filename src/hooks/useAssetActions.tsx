"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  AlertCircle,
  Minus,
  TrendingDown,
  Zap,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";

import { type Asset } from "@/@types/asset";
import { useAssetStore } from "@/store/useAssetStore";
import { TacticalToast } from "@/components/dashboard/tacticals/TacticalToast";
import type { ForecastDataPoint } from "@/components/dashboard/others/ForecastChart";

/**
 * GERAÇÃO DE DADOS PREDITIVOS
 * Simula a curva de risco baseada no nível atual do ativo.
 */
const generateForecastData = (baseRisk: string): ForecastDataPoint[] => {
  const multiplier =
    baseRisk === "Crítico" ? 1.2 : baseRisk === "Alto" ? 1.0 : 0.6;
  return [
    { time: "08:00", risk: Math.floor(20 * multiplier) },
    { time: "10:00", risk: Math.floor(45 * multiplier) },
    { time: "12:00", risk: Math.floor(85 * multiplier) },
    { time: "14:00", risk: Math.floor(65 * multiplier) },
    { time: "16:00", risk: Math.floor(40 * multiplier) },
    { time: "18:00", risk: Math.floor(25 * multiplier) },
  ];
};

export function useAssetActions() {
  const { selectedAsset, setSelectedAsset } = useAssetStore();

  // ESTADOS DE OPERAÇÃO
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * TEMA VISUAL DINÂMICO
   * Define cores, tendências e ícones baseados no risco atual.
   */
  const riskTheme = useMemo(() => {
    if (!selectedAsset) return null;
    switch (selectedAsset.risco_atual) {
      case "Crítico":
        return { color: "#dc2626", trend: "Alta", icon: TrendingUp };
      case "Alto":
        return { color: "#f97316", trend: "Instável", icon: AlertCircle };
      case "Moderado":
        return { color: "#eab308", trend: "Estável", icon: Minus };
      default:
        return { color: "#10b981", trend: "Baixa", icon: TrendingDown };
    }
  }, [selectedAsset]);

  const forecastData = useMemo(
    () =>
      selectedAsset ? generateForecastData(selectedAsset.risco_atual) : [],
    [selectedAsset]
  );

  /**
   * GERENCIAMENTO DE ALERTAS CRÍTICOS
   * Permite que o usuário clique no toast para focar no ativo em perigo.
   */
  const handleSelectFromToast = useCallback(
    (asset: Asset) => {
      setSelectedAsset(asset);
    },
    [setSelectedAsset]
  );

  const triggerCriticalAlert = useCallback(
    (asset: Asset) => {
      toast.custom(
        (t) => (
          <div
            onClick={() => handleSelectFromToast(asset)}
            className="cursor-pointer active:scale-[0.98] transition-all"
            role="button"
          >
            <TacticalToast
              t={t}
              variant="danger"
              title="ALERTA CRÍTICO DETECTADO"
              icon={
                <AlertCircle size={20} className="text-white animate-pulse" />
              }
              description={`Risco extremo em ${asset.nome}. Toque para interceptar.`}
            />
          </div>
        ),
        { duration: 8000 }
      );
    },
    [handleSelectFromToast]
  );

  /**
   * EXECUÇÃO DE PROTOCOLOS TÁTICOS
   * Lógica de delay e cancelamento de ações (Resposta Completa ou Contingente).
   */
  const handleCancel = useCallback(() => {
    if (processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current);
      processTimeoutRef.current = null;
      setIsProcessing(false);
      toast.dismiss();
      toast.custom(
        (t) => (
          <TacticalToast
            t={t}
            variant="neutral"
            title="Comando Abortado"
            icon={<AlertOctagon size={20} className="text-white" />}
            description="A operação foi interceptada e cancelada pelo operador."
          />
        ),
        { duration: 3000 }
      );
    }
  }, []);

  const handleAction = useCallback(
    async (specificAction?: string) => {
      if (!selectedAsset || isProcessing) return;
      setIsProcessing(true);

      const isFullResponse = !specificAction;
      const actionTitle = isFullResponse
        ? "Resposta Completa"
        : "Ação Contingente";
      const actionDesc = isFullResponse
        ? "Iniciando sequência total..."
        : `Validando: ${specificAction}`;

      const processId = toast.custom((t) => (
        <TacticalToast
          t={t}
          variant="warning"
          title={actionTitle}
          icon={
            <ShieldAlert size={20} className="animate-pulse text-amber-500" />
          }
          description={`${actionDesc} (4s)`}
        />
      ));

      processTimeoutRef.current = setTimeout(() => {
        toast.dismiss(processId);

        const finalMsg =
          isFullResponse && selectedAsset.acoes_contingencia
            ? `${selectedAsset.acoes_contingencia.length} protocolos ativados em ${selectedAsset.nome}.`
            : `Executado: ${specificAction || "Protocolo de Defesa"}`;

        toast.custom((t) => (
          <TacticalToast
            t={t}
            variant="success"
            title={isFullResponse ? "Mobilização Total" : "Ação Concluída"}
            icon={<Zap size={20} className="text-emerald-500 animate-pulse" />}
            description={finalMsg}
          />
        ));

        setTimeout(() => {
          setIsProcessing(false);
          processTimeoutRef.current = null;
        }, 2000);
      }, 4000);
    },
    [selectedAsset, isProcessing]
  );

  /**
   * UTILITÁRIOS
   * Cópia de coordenadas para a área de transferência.
   */
  const handleCopyCoords = useCallback(() => {
    if (!selectedAsset) return;
    const { latitude, longitude } = selectedAsset.coordenadas;
    const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedAsset]);

  return {
    selectedAsset,
    setSelectedAsset,
    riskTheme,
    forecastData,
    copied,
    isProcessing,
    handleAction,
    handleCancel,
    handleCopyCoords,
    triggerCriticalAlert,
  };
}
