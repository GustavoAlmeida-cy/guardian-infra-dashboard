"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { TacticalToast } from "@/components/dashboard/TacticalToast";
import {
  TrendingUp,
  AlertCircle,
  Minus,
  TrendingDown,
  Zap,
  ShieldCheck,
  Terminal,
  AlertOctagon,
} from "lucide-react";
import { useAssetStore } from "@/store/useAssetStore";
import type { ForecastDataPoint } from "@/components/dashboard/ForecastChart";

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
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
   * handleCancel: Aciona o toast BRANCO (neutral)
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
            variant="neutral" // Variante branca/neutra
            title="Comando Abortado"
            icon={<AlertOctagon size={20} className="text-white" />}
            description="A operação foi interceptada e cancelada pelo operador."
          />
        ),
        { duration: 3000 }
      );
    }
  }, []);

  /**
   * handleAction: Protocolo de Ataque -> Finaliza em VERDE (success)
   */
  const handleAction = useCallback(async () => {
    if (!selectedAsset || isProcessing) return;
    setIsProcessing(true);

    const processId = toast.custom((t) => (
      <TacticalToast
        t={t}
        variant="warning"
        title="Protocolo de Ataque"
        icon={<Zap size={20} className="animate-pulse text-amber-500" />}
        description="Validando autorização... (4s para cancelar)"
      />
    ));

    processTimeoutRef.current = setTimeout(() => {
      toast.dismiss(processId);
      toast.custom((t) => (
        <TacticalToast
          t={t}
          variant="success" // Verde para sucesso
          title="Ordem Enviada"
          icon={<Zap size={20} className="text-emerald-500 animate-pulse" />}
          description={`Mobilização concluída para ${selectedAsset.nome}.`}
        />
      ));

      setTimeout(() => {
        setIsProcessing(false);
        processTimeoutRef.current = null;
      }, 2000);
    }, 4000);
  }, [selectedAsset, isProcessing]);

  /**
   * handleProtocol: Auditoria -> Finaliza em VERDE (success)
   */
  const handleProtocol = useCallback(() => {
    if (!selectedAsset || isProcessing) return;
    setIsProcessing(true);

    const processId = toast.custom((t) => (
      <TacticalToast
        t={t}
        variant="info"
        title="Iniciando Auditoria"
        icon={<ShieldCheck size={20} className="animate-pulse" />}
        description="Escaneando integridade nominal... (2.5s)"
      />
    ));

    processTimeoutRef.current = setTimeout(() => {
      toast.dismiss(processId);
      toast.custom((t) => (
        <TacticalToast
          t={t}
          variant="success" // Verde para sucesso
          title="Audit Concluído"
          icon={<ShieldCheck size={20} className="text-emerald-500" />}
          description={`Ativo #${selectedAsset.id} operando em parâmetros normais.`}
        />
      ));

      setIsProcessing(false);
      processTimeoutRef.current = null;
    }, 2500);
  }, [selectedAsset, isProcessing]);

  /**
   * handleCopyCoords: Copiar coordenadas -> VERDE (success)
   */
  const handleCopyCoords = useCallback(() => {
    if (!selectedAsset) return;
    const coords = `${selectedAsset.coordenadas.latitude.toFixed(
      6
    )}, ${selectedAsset.coordenadas.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);

    toast.custom(
      (t) => (
        <TacticalToast
          t={t}
          variant="success"
          title="Geo-Link Copiado"
          icon={<Terminal size={20} className="text-emerald-500" />}
          description={coords}
        />
      ),
      { duration: 2500 }
    );

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
    handleProtocol,
    handleCancel,
    handleCopyCoords,
  };
}
