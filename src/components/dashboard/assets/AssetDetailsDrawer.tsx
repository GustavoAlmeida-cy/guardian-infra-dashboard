"use client";

/**
 * COMPONENTE: AssetDetailsDrawer
 * DESCRIÇÃO: Interface mobile (Drawer) sincronizada com a lógica de protocolos do Desktop.
 * REUTILIZAÇÃO: Consome TacticalBase (MetricCard, CommandButton, ContingencyPanel).
 */

import { useState } from "react";
import { useAssetActions } from "@/hooks/useAssetActions";
import { useAssetStore } from "@/store/useAssetStore";
import {
  MetricCard,
  CommandButton,
  ContingencyPanel,
} from "@/components/dashboard/tacticals/TacticalBase";
import { ForecastChart } from "@/components/dashboard/others/ForecastChart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Zap,
  Clock,
  MapPin,
  Copy,
  Check,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AssetDetailsDrawer() {
  const { selectedAsset, setSelectedAsset } = useAssetStore();

  const {
    riskTheme,
    forecastData,
    copied,
    isProcessing,
    handleAction,
    handleCancel,
    handleCopyCoords,
  } = useAssetActions();

  // Estado para feedback visual de carregamento individual vs global
  const [triggerSource, setTriggerSource] = useState<
    "global" | "individual" | null
  >(null);

  if (!selectedAsset || !riskTheme) return null;

  // --- REGRAS DE NEGÓCIO SINCRONIZADAS ---
  const contingencyActions = selectedAsset.acoes_contingencia ?? [];
  const hasContingencyActions = contingencyActions.length > 0;
  const isRiskLocked =
    selectedAsset.risco_atual === "Moderado" ||
    selectedAsset.risco_atual === "Baixo";
  const isActionAvailable = hasContingencyActions && !isRiskLocked;

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
    <Drawer
      open={!!selectedAsset}
      onOpenChange={(open) => !open && !isProcessing && setSelectedAsset(null)}
    >
      <DrawerContent className="bg-zinc-950 border-zinc-800 focus:outline-none h-[92vh] flex flex-col font-sans">
        {/* INDICADOR DE STATUS */}
        <div
          className="h-1.5 w-full transition-all duration-500 mt-4 shrink-0"
          style={{
            backgroundColor: isProcessing ? "#ffffff" : riskTheme.color,
          }}
        />

        {/* Handle visual */}
        <div className="mx-auto mt-4 h-1 w-12 shrink-0 rounded-full bg-zinc-800" />

        <DrawerHeader className="text-left px-6 pt-4 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <DrawerTitle className="text-xl font-black text-white italic tracking-tight uppercase">
                {selectedAsset.nome}
              </DrawerTitle>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-zinc-900 text-zinc-500 text-[9px] px-1.5 py-0.5 rounded font-mono border border-zinc-800">
                  ID: {selectedAsset.id}
                </span>

                <button
                  onClick={handleCopyCoords}
                  className="group flex items-center gap-2 px-2 py-0.5 bg-zinc-900/50 rounded border border-zinc-800/50 active:bg-zinc-800 transition-colors"
                >
                  <MapPin size={10} className="text-zinc-600" />
                  <span className="text-[9px] font-mono text-zinc-400">
                    COPIAR POSIÇÃO
                  </span>
                  {copied ? (
                    <Check size={10} className="text-emerald-500" />
                  ) : (
                    <Copy size={10} className="text-zinc-600" />
                  )}
                </button>
              </div>
            </div>

            <div
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-white/5 transition-colors duration-500"
              style={{
                backgroundColor: isProcessing
                  ? "#ffffff20"
                  : `${riskTheme.color}20`,
                color: isProcessing ? "#ffffff" : riskTheme.color,
              }}
            >
              {isProcessing ? "Processando" : selectedAsset.risco_atual}
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-8 pb-10">
            {/* GRID DE MÉTRICAS */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                label="Impacto"
                value={selectedAsset.tempo_estimado_impacto ?? "N/A"}
                icon={Clock}
              />
              <MetricCard
                label="Severidade"
                value={selectedAsset.risco_atual}
                icon={riskTheme.icon}
                color={riskTheme.color}
              />
              <MetricCard
                label="Tendência"
                value={riskTheme.trend}
                icon={riskTheme.icon}
                color="#71717a"
              />
            </div>

            {/* PAINEL DE CONTINGÊNCIA (NOVIDADE MOBILE) */}
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
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">
                    Nenhum protocolo disponível
                  </p>
                </div>
              )}
            </div>

            {/* GRÁFICO PREDITIVO */}
            <div className="space-y-4">
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
                Análise Preditiva (24h)
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

        {/* FOOTER: AÇÕES GLOBAIS */}
        <footer className="p-6 bg-zinc-900/30 border-t border-zinc-800/50 shrink-0 mb-4">
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
                  className="w-full h-14 tracking-widest"
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
                  className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-black uppercase italic text-[11px] rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  <AlertOctagon size={18} className="mr-2 animate-pulse" />
                  Cancelar Operação Imediatamente
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </DrawerContent>
    </Drawer>
  );
}
