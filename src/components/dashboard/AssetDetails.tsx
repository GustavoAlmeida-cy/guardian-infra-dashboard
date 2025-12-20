import { useMemo } from "react";
import { motion } from "framer-motion"; // Importante para animações
import {
  X,
  Zap,
  ShieldCheck,
  Clock,
  Info,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Minus,
} from "lucide-react";
import { useAssetStore } from "@/store/useAssetStore";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const generateForecastData = (baseRisk: string) => {
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

export function AssetDetails() {
  const { selectedAsset, setSelectedAsset } = useAssetStore();

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

  if (!selectedAsset || !riskTheme) return null;

  return (
    <motion.div
      // Configurações de Animação
      initial={{ x: -100, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -100, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="absolute top-6 left-6 w-100 bg-zinc-950/95 border border-zinc-800/50 rounded-2xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
    >
      {/* Barra de destaque de risco superior */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="h-1.5 transition-colors duration-500"
        style={{
          backgroundColor: riskTheme.color,
          boxShadow: `0px 2px 10px ${riskTheme.color}66`,
        }}
      />

      {/* Header */}
      <div className="p-5 bg-zinc-900/30 border-b border-zinc-800/50 flex justify-between items-start gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white tracking-tight italic underline decoration-white-500/50 underline-offset-5">
              {selectedAsset.nome}
            </h3>
          </div>
          <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-mono border border-zinc-700">
            #{selectedAsset.id}
          </span>
          <div className="flex items-center gap-1.5 mt-2 -mb-2 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
            <Info size={12} style={{ color: riskTheme.color }} />
            Monitoramento de Infraestrutura
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedAsset(null)}
          className="h-10 w-10 cursor-pointer rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all active:scale-90"
        >
          <X size={20} />
        </Button>
      </div>

      <div className="p-6 space-y-8">
        {/* Status Grid Animado */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="space-y-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
            <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1">
              <Clock size={10} /> Impacto
            </span>
            <div className="text-xs font-black text-white italic">
              {selectedAsset.tempo_estimado_impacto}
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
            <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1">
              <AlertCircle size={10} /> Severidade
            </span>
            <div
              className="text-xs font-black uppercase tracking-tighter"
              style={{ color: riskTheme.color }}
            >
              {selectedAsset.risco_atual}
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
            <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1">
              <TrendingUp size={10} /> Tendência
            </span>
            <div className="text-xs font-black text-zinc-300 uppercase tracking-tighter flex items-center gap-1">
              <riskTheme.icon size={12} style={{ color: riskTheme.color }} />
              {riskTheme.trend}
            </div>
          </div>
        </motion.div>

        {/* Gráfico Dinâmico */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: riskTheme.color }}
              />
              Análise Preditiva
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              Variação:{" "}
              {selectedAsset.risco_atual === "Crítico" ? "+14.2%" : "-2.1%"}
            </span>
          </div>

          <div className="h-44 w-full bg-zinc-900/20 rounded-lg p-2 border border-zinc-800/30 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="dynamicColor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={riskTheme.color}
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor={riskTheme.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#27272a"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ stroke: riskTheme.color, strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: `1px solid ${riskTheme.color}33`,
                    borderRadius: "8px",
                    fontSize: "10px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke={riskTheme.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#dynamicColor)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Botões de Comando */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button
            className="group relative text-white text-[11px] font-black h-11 transition-all overflow-hidden shadow-lg border-none active:scale-95 cursor-pointer"
            style={{ backgroundColor: riskTheme.color }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Zap size={16} className="mr-2 fill-current animate-pulse" />{" "}
            ACIONAR RESPOSTA
          </Button>
          <Button
            variant="outline"
            className="border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-[11px] font-black h-11 text-zinc-800 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <ShieldCheck size={16} className="mr-2" /> PROTOCOLO
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
