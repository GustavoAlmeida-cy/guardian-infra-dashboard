"use client";

/**
 * COMPONENTE: AssetDetails (Desktop)
 * DESCRIÇÃO: Painel lateral flutuante para monitoramento tático de ativos.
 * CARACTERÍSTICA: Utiliza estados de "Modo de Emergência" (isProcessing) para alterar a interface.
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Zap,
  ShieldCheck,
  Clock,
  MapPin,
  Copy,
  Check,
  AlertOctagon,
} from "lucide-react";
import { useAssetActions } from "@/hooks/useAssetActions";
import { Button } from "@/components/ui/button";
import { MetricCard, CommandButton } from "@/components/dashboard/tacticals/TacticalBase";
import { ForecastChart } from "@/components/dashboard/others/ForecastChart";

export function AssetDetails() {
  // Centralização da lógica: O hook orquestra desde as cores do risco até o temporizador de cancelamento
  const {
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
  } = useAssetActions();

  // Previne erros de runtime se o modal for chamado sem um ativo no contexto
  if (!selectedAsset || !riskTheme) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={selectedAsset.id}
        initial={{ x: -100, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: -100, opacity: 0, scale: 0.95 }}
        className="absolute top-6 left-6 w-96 bg-zinc-950/95 border border-zinc-800/50 rounded-2xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden font-sans"
      >
        {/* INDICADOR VISUAL SUPERIOR: Responde ao estado de processamento mudando para Branco */}
        <div
          className="h-1.5 w-full transition-all duration-500 ease-in-out"
          style={{
            backgroundColor: isProcessing ? "#ffffff" : riskTheme.color,
          }}
        />

        {/* HEADER: Informações de Identificação e Localização */}
        <header className="p-5 bg-zinc-900/30 border-b border-zinc-800/50 flex justify-between items-start">
          <div className="space-y-3">
            <h3 className="text-base font-black text-white italic uppercase tracking-tight">
              {selectedAsset.nome}
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-mono border border-zinc-700">
                ID: {selectedAsset.id}
              </span>

              {/* Clipboard: Mostra feedback de sucesso (Check) ou ícone de cópia */}
              <button
                onClick={handleCopyCoords}
                className="flex items-center gap-2 px-2 py-0.5 bg-zinc-900/50 rounded border border-zinc-800/50 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <MapPin size={10} />
                {selectedAsset.coordenadas.latitude.toFixed(4)},{" "}
                {selectedAsset.coordenadas.longitude.toFixed(4)}
                {copied ? (
                  <Check size={10} className="text-emerald-500 ml-1" />
                ) : (
                  <Copy size={10} className="ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Botão Fechar: Desabilitado durante processamento para evitar fechamento acidental */}
          <Button
            variant="ghost"
            size="icon"
            disabled={isProcessing}
            onClick={() => setSelectedAsset(null)}
            className="rounded-full text-zinc-400 cursor-pointer hover:bg-zinc-100 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </Button>
        </header>

        <div className="p-6 space-y-8">
          {/* GRID DE MÉTRICAS: Exibição de dados técnicos do ativo */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Impacto"
              value={selectedAsset.tempo_estimado_impacto ?? "N/A"}
              icon={Clock}
              className="cursor-default"
            />
            <MetricCard
              label="Severidade"
              value={selectedAsset.risco_atual ?? "Estável"}
              icon={riskTheme.icon}
              color={riskTheme.color}
              className="cursor-default"
            />
            <MetricCard
              label="Tendência"
              value={riskTheme.trend}
              icon={riskTheme.icon}
              color="#a1a1aa"
              className="cursor-default"
            />
          </div>

          {/* SEÇÃO DE ANÁLISE: O gráfico e o label mudam para Branco/Pulse durante a validação */}
          <div className="space-y-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                  isProcessing ? "bg-white animate-pulse" : ""
                }`}
                style={{
                  backgroundColor: !isProcessing ? riskTheme.color : undefined,
                }}
              />
              {isProcessing
                ? "Validação em curso..."
                : "Projeção de Risco (24h)"}
            </span>

            <ForecastChart
              data={forecastData}
              color={isProcessing ? "#ffffff" : riskTheme.color}
            />
          </div>

          {/* FOOTER: Switch de Ações - Alterna entre botões de comando e botão de cancelamento imediato */}
          <footer className="relative h-11">
            <AnimatePresence mode="wait">
              {!isProcessing ? (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <CommandButton
                    onClick={handleAction}
                    icon={Zap}
                    color={riskTheme.color}
                    className="cursor-pointer"
                  >
                    ACIONAR RESPOSTA
                  </CommandButton>

                  <CommandButton
                    onClick={handleProtocol}
                    icon={ShieldCheck}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    PROTOCOLO
                  </CommandButton>
                </motion.div>
              ) : (
                <motion.div
                  key="cancel"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {/* BOTÃO DE EMERGÊNCIA: Estilo Branco "High-Contrast" para ação de aborto */}
                  <Button
                    onClick={handleCancel}
                    className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-black uppercase italic tracking-tighter text-[11px] rounded-lg transition-all border-none shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
                  >
                    <AlertOctagon size={16} className="mr-2 animate-bounce" />
                    CANCELAR OPERAÇÃO IMEDIATAMENTE
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </footer>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
