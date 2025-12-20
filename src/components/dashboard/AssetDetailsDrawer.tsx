"use client";

/**
 * COMPONENTE: AssetDetailsDrawer
 * DESCRIÇÃO: Interface mobile (Drawer) para exibição detalhada de ativos e ações táticas.
 * REUTILIZAÇÃO: Consome a mesma lógica de negócios (useAssetActions) que a versão Desktop.
 */

import { useAssetActions } from "@/hooks/useAssetActions";
import { useAssetStore } from "@/store/useAssetStore";
import { MetricCard } from "@/components/dashboard/TacticalBase";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
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
  ShieldCheck,
  Clock,
  Info,
  MapPin,
  Copy,
  Check,
  AlertOctagon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AssetDetailsDrawer() {
  const { selectedAsset, setSelectedAsset } = useAssetStore();

  // Hook Centralizador: Gerencia estados de risco, animações de processamento e ações de clipboard
  const {
    riskTheme,
    forecastData,
    copied,
    isProcessing,
    handleAction,
    handleProtocol,
    handleCancel,
    handleCopyCoords,
  } = useAssetActions();

  // Early return caso nenhum ativo esteja selecionado para evitar erros de renderização
  if (!selectedAsset || !riskTheme) return null;

  return (
    <Drawer
      open={!!selectedAsset}
      // Bloqueia o fechamento do Drawer se uma operação crítica estiver em curso (isProcessing)
      onOpenChange={(open) => !open && !isProcessing && setSelectedAsset(null)}
    >
      <DrawerContent className="bg-zinc-950 border-zinc-800 focus:outline-none h-[85vh] flex flex-col font-sans">
        {/* INDICADOR DE STATUS: Muda de cor (Risco -> Branco) durante a validação */}
        <div
          className="h-1.5 w-full transition-all duration-500 mt-4"
          style={{
            backgroundColor: isProcessing ? "#ffffff" : riskTheme.color,
          }}
        />

        {/* Handle visual para o Drawer mobile */}
        <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-zinc-800" />

        <DrawerHeader className="text-left px-6 pt-6 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <DrawerTitle className="text-xl font-black text-white italic tracking-tight uppercase">
                {selectedAsset.nome}
              </DrawerTitle>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-zinc-900 text-zinc-500 text-[9px] px-1.5 py-0.5 rounded font-mono border border-zinc-800">
                    ID: {selectedAsset.id}
                  </span>

                  {/* Botão de Cópia: Feedback visual de sucesso via estado 'copied' */}
                  <button
                    onClick={handleCopyCoords}
                    className="group flex items-center gap-2 px-2 py-0.5 bg-zinc-900/50 rounded border border-zinc-800/50 active:bg-zinc-800 transition-colors"
                  >
                    <MapPin size={10} className="text-zinc-600" />
                    <span className="text-[9px] font-mono text-zinc-400">
                      {selectedAsset.coordenadas.latitude.toFixed(4)},{" "}
                      {selectedAsset.coordenadas.longitude.toFixed(4)}
                    </span>
                    {copied ? (
                      <Check size={10} className="text-emerald-500" />
                    ) : (
                      <Copy size={10} className="text-zinc-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                  <Info
                    size={12}
                    style={{ color: isProcessing ? "#fff" : riskTheme.color }}
                  />
                  {isProcessing
                    ? "Validação de Protocolo"
                    : "Monitoramento Ativo"}
                </div>
              </div>
            </div>

            {/* BADGE DE RISCO: Dinâmico baseado no tema e estado de processamento */}
            <div
              className="px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-white/5 transition-colors duration-500"
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
          <div className="py-4 space-y-8">
            {/* GRID DE MÉTRICAS: Componentes reutilizados do TacticalBase */}
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

            {/* SEÇÃO PREDITIVA: Gráfico dinâmico com mudança de cor sob processamento */}
            <div className="space-y-4">
              <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black flex items-center gap-2">
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
                Análise Preditiva
              </span>

              <div className="h-48 w-full">
                <ForecastChart
                  data={forecastData}
                  color={isProcessing ? "#ffffff" : riskTheme.color}
                />
              </div>
            </div>

            {/* SEÇÃO DE AÇÕES: Alterna entre botões de comando e botão de cancelamento imediato */}
            <div className="relative min-h-30 pb-10">
              <AnimatePresence mode="wait">
                {!isProcessing ? (
                  <motion.div
                    key="normal-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-3"
                  >
                    <Button
                      onClick={handleAction}
                      className="w-full h-14 text-white text-[11px] font-black border-none active:scale-95 transition-all"
                      style={{ backgroundColor: riskTheme.color }}
                    >
                      <Zap
                        size={16}
                        className="mr-2 fill-current animate-pulse"
                      />
                      ACIONAR RESPOSTA
                    </Button>
                    <Button
                      onClick={handleProtocol}
                      variant="outline"
                      className="w-full h-14 border-zinc-800 bg-zinc-900/50 text-[11px] font-black text-zinc-400 active:scale-95 transition-all"
                    >
                      <ShieldCheck size={16} className="mr-2" />
                      PROTOCOLO DE SEGURANÇA
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cancel-action"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    {/* BOTÃO DE EMERGÊNCIA: Visível apenas durante o countdown de validação */}
                    <Button
                      onClick={handleCancel}
                      className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-black uppercase italic tracking-tighter text-[11px] rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                    >
                      <AlertOctagon size={18} className="mr-2 animate-bounce" />
                      CANCELAR OPERAÇÃO IMEDIATAMENTE
                    </Button>
                    <p className="text-[9px] text-center text-zinc-500 mt-3 font-mono uppercase">
                      Sistema em modo de validação crítica...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
