import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { TacticalToast } from "@/components/dashboard/TacticalToast";
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
  MapPin,
  Copy,
  Check,
  Terminal,
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

// FUNÇÃO RESTAURADA: Resolve o erro "Cannot find name 'generateForecastData'"
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
  const [copied, setCopied] = useState(false);

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

  const handleAction = () => {
    if (!selectedAsset) return;
    toast.custom(() => (
      <TacticalToast
        variant="danger"
        title="Ordem de Resposta Enviada"
        icon={<Zap size={20} className="fill-current animate-pulse" />}
        description={`Mobilização imediata para ${selectedAsset.nome}. Unidades em alerta.`}
      />
    ));
  };

  const handleProtocol = () => {
    if (!selectedAsset) return;
    toast.custom(() => (
      <TacticalToast
        variant="info"
        title="Protocolo Ativo"
        icon={<ShieldCheck size={20} />}
        description={`Auditando Ativo #${selectedAsset.id}. Integridade nominal.`}
      />
    ));
  };

  const handleCopyCoords = () => {
    if (!selectedAsset) return;
    const coords = `${selectedAsset.coordenadas.latitude.toFixed(
      6
    )}, ${selectedAsset.coordenadas.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);

    toast.custom(
      () => (
        <TacticalToast
          variant="success"
          title="Geo-Link Copiado"
          icon={<Terminal size={20} />}
          description={coords}
        />
      ),
      { duration: 2000 }
    );

    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedAsset || !riskTheme) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -100, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{
          x: -100,
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.2 },
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="absolute top-6 left-6 w-100 bg-zinc-950/95 border border-zinc-800/50 rounded-2xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden font-sans"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          className="h-1.5"
          style={{
            backgroundColor: riskTheme.color,
            boxShadow: `0px 2px 10px ${riskTheme.color}66`,
          }}
        />

        <div className="p-5 bg-zinc-900/30 border-b border-zinc-800/50 flex justify-between items-start gap-2">
          <div className="space-y-3 text-left">
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight italic uppercase">
                {selectedAsset.nome}
              </h3>
              <div className="flex items-center gap-2">
                <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-mono border border-zinc-700">
                  #{selectedAsset.id}
                </span>
                <button
                  onClick={handleCopyCoords}
                  className="group flex items-center gap-2 px-2 py-0.5 bg-zinc-900/50 rounded border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <MapPin
                    size={10}
                    className="text-zinc-600 group-hover:text-zinc-400"
                  />
                  <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-300">
                    {selectedAsset.coordenadas.latitude.toFixed(6)},{" "}
                    {selectedAsset.coordenadas.longitude.toFixed(6)}
                  </span>
                  <div className="ml-1 border-l border-zinc-800 pl-1.5">
                    {copied ? (
                      <Check size={10} className="text-emerald-500" />
                    ) : (
                      <Copy
                        size={10}
                        className="text-zinc-600 group-hover:text-zinc-400"
                      />
                    )}
                  </div>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
              <Info size={12} style={{ color: riskTheme.color }} />
              Monitoramento Tático
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedAsset(null)}
            className="h-8 w-8 cursor-pointer rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/50"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              {
                label: "Impacto",
                val: selectedAsset.tempo_estimado_impacto,
                icon: Clock,
              },
              {
                label: "Severidade",
                val: selectedAsset.risco_atual,
                icon: AlertCircle,
                color: riskTheme.color,
              },
              {
                label: "Tendência",
                val: riskTheme.trend,
                icon: riskTheme.icon,
                color: "#a1a1aa",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="space-y-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-left"
              >
                <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1">
                  <item.icon size={10} /> {item.label}
                </span>
                <div
                  className="text-xs font-black italic uppercase tracking-tighter"
                  style={{ color: item.color || "#fff" }}
                >
                  {item.val}
                </div>
              </div>
            ))}
          </motion.div>

          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black flex items-center gap-2 text-left">
                <div
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ backgroundColor: riskTheme.color }}
                />
                Análise Preditiva
              </span>
            </div>
            <div className="h-44 w-full bg-zinc-900/20 rounded-lg p-2 border border-zinc-800/30">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient
                      id="dynamicColor"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#71717a" }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
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
                    fill="url(#dynamicColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              onClick={handleAction}
              className="group relative text-white text-[11px] font-black h-11 transition-all overflow-hidden border-none active:scale-95 cursor-pointer shadow-lg"
              style={{ backgroundColor: riskTheme.color }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap size={16} className="mr-2 fill-current animate-pulse" />
              ACIONAR RESPOSTA
            </Button>
            <Button
              onClick={handleProtocol}
              variant="outline"
              className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 text-[11px] font-black h-11 text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <ShieldCheck size={16} className="mr-2" /> PROTOCOLO
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
