import { useMemo, useState } from "react";
import { toast } from "sonner"; // IMPORTADO
import { TacticalToast } from "@/components/dashboard/TacticalToast"; // IMPORTADO
import {
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
  Terminal, // IMPORTADO
} from "lucide-react";
import { useAssetStore } from "@/store/useAssetStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

export function AssetDetailsDrawer() {
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

  // --- HANDLERS PARA TOASTS ---
  const handleAction = () => {
    if (!selectedAsset) return;
    toast.custom(() => (
      <TacticalToast
        variant="danger"
        title="Resposta Mobile Ativada"
        icon={<Zap size={18} className="fill-current animate-pulse" />}
        description={`Mobilização tática iniciada para ${selectedAsset.nome}.`}
      />
    ));
  };

  const handleProtocol = () => {
    if (!selectedAsset) return;
    toast.custom(() => (
      <TacticalToast
        variant="info"
        title="Protocolo de Segurança"
        icon={<ShieldCheck size={18} />}
        description={`Verificando integridade do Ativo #${selectedAsset.id}.`}
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
          title="Coordenadas Copiadas"
          icon={<Terminal size={18} />}
          description={coords}
        />
      ),
      { duration: 2000 }
    );

    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedAsset || !riskTheme) return null;

  return (
    <Drawer
      open={!!selectedAsset}
      onOpenChange={(open) => !open && setSelectedAsset(null)}
    >
      <DrawerContent className="bg-zinc-950 border-zinc-800 focus:outline-none h-[85vh] flex flex-col">
        <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-zinc-800" />

        <DrawerHeader className="text-left px-6 pt-6 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <DrawerTitle className="text-xl font-black text-white italic tracking-tight uppercase">
                {selectedAsset.nome}
              </DrawerTitle>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-zinc-900 text-zinc-500 text-[9px] w-fit px-1.5 py-0.5 rounded font-mono border border-zinc-800">
                    #{selectedAsset.id}
                  </span>

                  <button
                    onClick={handleCopyCoords}
                    className="group flex items-center gap-2 px-2 py-0.5 bg-zinc-900/50 rounded border border-zinc-800/50 hover:border-zinc-700 transition-colors"
                  >
                    <MapPin
                      size={10}
                      className="text-zinc-600 group-hover:text-zinc-400"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 group-active:text-white">
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

                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                  <Info size={12} style={{ color: riskTheme.color }} />
                  Monitoramento de Infraestrutura
                </div>
              </div>
            </div>

            <div
              className="px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg border border-white/5"
              style={{
                backgroundColor: `${riskTheme.color}20`,
                color: riskTheme.color,
              }}
            >
              {selectedAsset.risco_atual}
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-8">
            {/* Status Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1">
                  <Clock size={10} /> Impacto
                </span>
                <div className="text-xs font-black text-white italic">
                  {selectedAsset.tempo_estimado_impacto}
                </div>
              </div>

              <div className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
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

              <div className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                <span className="text-[9px] text-zinc-500 uppercase font-black flex items-center gap-1">
                  <TrendingUp size={10} /> Tendência
                </span>
                <div className="text-xs font-black text-zinc-300 uppercase tracking-tighter flex items-center gap-1">
                  <riskTheme.icon
                    size={12}
                    style={{ color: riskTheme.color }}
                  />
                  {riskTheme.trend}
                </div>
              </div>
            </div>

            {/* Gráfico Dinâmico */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ backgroundColor: riskTheme.color }}
                  />
                  Análise Preditiva
                </span>
              </div>

              <div className="h-48 w-full bg-zinc-900/20 rounded-xl p-2 border border-zinc-800/30">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient
                        id="mobileColor"
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
                      fill="url(#mobileColor)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ações Mobile */}
            <div className="grid grid-cols-1 gap-3 pb-8">
              <Button
                onClick={handleAction} // ADICIONADO
                className="w-full h-14 text-white text-[11px] font-black shadow-xl border-none active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: riskTheme.color }}
              >
                <Zap size={16} className="mr-2 fill-current animate-pulse" />
                ACIONAR RESPOSTA
              </Button>
              <Button
                onClick={handleProtocol} // ADICIONADO
                variant="outline"
                className="w-full h-14 border-zinc-800 bg-zinc-900/50 text-[11px] font-black text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                <ShieldCheck size={16} className="mr-2" />
                PROTOCOLO
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
