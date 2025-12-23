"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  X,
  Zap,
  Clock,
  MapPin,
  Copy,
  Check,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";

import { useAssetActions } from "@/hooks/useAssetActions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ForecastChart } from "@/components/dashboard/others/ForecastChart";
import {
  MetricCard,
  CommandButton,
  ContingencyPanel,
} from "@/components/dashboard/tacticals/TacticalBase";

/**
 * PAINEL DE DETALHES TÁTICOS (ASSET DETAILS)
 * Centraliza monitoramento, projeções e execução de protocolos.
 */
export function AssetDetails() {
  const {
    selectedAsset,
    setSelectedAsset,
    riskTheme,
    forecastData,
    copied,
    isProcessing,
    handleAction,
    handleCancel,
    handleCopyCoords,
  } = useAssetActions();

  // Controla a origem da ação para feedback visual no ContingencyPanel
  const [triggerSource, setTriggerSource] = useState<
    "global" | "individual" | null
  >(null);

  if (!selectedAsset || !riskTheme) return null;

  // --- REGRAS DE NEGÓCIO ---
  const contingencyActions = selectedAsset.acoes_contingencia ?? [];
  const hasContingencyActions = contingencyActions.length > 0;

  // Travas de segurança: protocolos só habilitados em Risco Alto ou Crítico
  const isRiskLocked =
    selectedAsset.risco_atual === "Moderado" ||
    selectedAsset.risco_atual === "Baixo";

  const isActionAvailable = hasContingencyActions && !isRiskLocked;

  // --- HANDLERS ---
  const onTriggerFullResponse = () => {
    if (!isActionAvailable) return;
    setTriggerSource("global");
    handleAction();
  };

  const onTriggerSingleResponse = (action: string) => {
    setTriggerSource("individual");
    handleAction(action);
  };

  const isGlobalLoading = isProcessing && triggerSource === "global";

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={selectedAsset.id}
        initial={{ x: -100, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: -100, opacity: 0, scale: 0.95 }}
        className="absolute top-6 left-6 w-96 bg-zinc-950/95 border border-zinc-800/50 rounded-2xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden font-sans flex flex-col h-[calc(100vh-120px)] max-h-212.5"
      >
        {/* Barra de Status Dinâmica */}
        <div
          className="h-1.5 w-full transition-all duration-500 ease-in-out shrink-0"
          style={{
            backgroundColor: isProcessing ? "#ffffff" : riskTheme.color,
          }}
        />

        {/* HEADER: Identificação e Localização */}
        <header className="p-5 bg-zinc-900/30 border-b border-zinc-800/50 flex justify-between items-start gap-4 shrink-0">
          <div className="space-y-3 min-w-0">
            <h3
              title={selectedAsset.nome}
              className="text-base font-black text-white italic uppercase tracking-tight truncate"
            >
              {selectedAsset.nome}
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-mono border border-zinc-700">
                ID: {selectedAsset.id}
              </span>
              <button
                onClick={handleCopyCoords}
                className="group flex items-center gap-2 px-2 py-0.5 bg-zinc-900/50 rounded border border-zinc-800/50 text-[9px] font-mono text-zinc-500 hover:text-emerald-400 transition-all cursor-pointer"
              >
                <MapPin size={10} />
                <span>COPIAR POSIÇÃO</span>
                {copied ? (
                  <Check size={10} className="text-emerald-500" />
                ) : (
                  <Copy size={10} />
                )}
              </button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            disabled={isProcessing}
            onClick={() => setSelectedAsset(null)}
            className="rounded-full text-zinc-400 cursor-pointer w-10 h-10 shrink-0 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </Button>
        </header>

        {/* BODY: Monitoramento e Contingência */}
        <ScrollArea className="flex-1 w-full overflow-hidden">
          <div className="p-6 space-y-8 pb-10">
            {/* GRID DE MÉTRICAS */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                label="Impacto"
                value={selectedAsset.tempo_estimado_impacto ?? "N/A"}
                icon={Clock}
              />
              <MetricCard
                label="Severidade"
                value={selectedAsset.risco_atual ?? "Estável"}
                icon={riskTheme.icon}
                color={riskTheme.color}
              />
              <MetricCard
                label="Tendência"
                value={riskTheme.trend}
                icon={riskTheme.icon}
                color="#a1a1aa"
              />
            </div>

            {/* PAINEL DE PROTOCOLOS */}
            <div className="space-y-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
                <ShieldAlert size={12} className="text-zinc-600" />
                Contingência Individual
              </span>
              {hasContingencyActions ? (
                <ContingencyPanel
                  actions={contingencyActions}
                  onExecuteAction={onTriggerSingleResponse}
                  disabled={isProcessing}
                  isGlobalLoading={isGlobalLoading}
                  risco={selectedAsset.risco_atual}
                />
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">
                    Nenhum protocolo disponível
                  </p>
                </div>
              )}
            </div>

            {/* PROJEÇÃO PREDITIVA */}
            <div className="space-y-4 min-h-55">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isProcessing ? "bg-white animate-pulse" : ""
                  }`}
                  style={{
                    backgroundColor: !isProcessing
                      ? riskTheme.color
                      : undefined,
                  }}
                />
                {isProcessing
                  ? "Validação em curso..."
                  : "Projeção de Risco (24h)"}
              </span>
              <div className="h-48 w-full">
                <ForecastChart
                  data={forecastData}
                  color={isProcessing ? "#ffffff" : riskTheme.color}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* FOOTER: Ações de Resposta Total */}
        <footer className="p-6 bg-zinc-900/20 border-t border-zinc-800/50 shrink-0">
          <AnimatePresence mode="wait">
            {!isProcessing ? (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CommandButton
                  onClick={onTriggerFullResponse}
                  icon={Zap}
                  color={riskTheme.color}
                  risco={
                    !hasContingencyActions ? "Baixo" : selectedAsset.risco_atual
                  }
                  disabled={!isActionAvailable}
                  className="w-full cursor-pointer tracking-widest"
                >
                  Acionar Resposta Completa
                </CommandButton>
              </motion.div>
            ) : (
              <motion.div
                key="cancel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Button
                  onClick={handleCancel}
                  className="w-full h-11 bg-white hover:bg-zinc-200 text-black cursor-pointer font-black uppercase italic text-[11px] rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <AlertOctagon size={16} className="mr-2 animate-pulse" />
                  Cancelar Operação Imediatamente
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </motion.section>
    </AnimatePresence>
  );
}
