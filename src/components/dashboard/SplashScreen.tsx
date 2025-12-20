import { motion } from "framer-motion";
import { ShieldAlert, Cpu, Activity } from "lucide-react";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden"
    >
      {/* Scanline Effect - Estética de Monitor Militar */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-20 bg-size-[100%_2px,3px_100%]" />

      {/* Background Glow Otimizado */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)]"
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-30 flex flex-col items-center px-6 text-center"
      >
        {/* Ícone Adaptativo */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <ShieldAlert
              size={64}
              className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] sm:w-20 sm:h-20"
            />
          </motion.div>

          {/* Anéis de Pulso */}
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border border-red-600/30 rounded-full"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        {/* Tipografia Mobile-First */}
        <h1 className="text-2xl sm:text-4xl font-black tracking-[0.15em] uppercase italic text-zinc-100 flex items-center gap-2">
          Guardian <span className="text-red-600">Infra</span>
        </h1>

        <div className="flex items-center justify-center gap-2 mt-3 px-4 py-1 border-y border-white/5 bg-white/2">
          <Cpu size={12} className="text-red-500/80" />
          <p className="text-[8px] sm:text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-medium">
            Sipremo Intelligence{" "}
            <span className="hidden sm:inline">System</span>
          </p>
          <Activity size={12} className="text-red-500/80 animate-pulse" />
        </div>

        {/* Status Loader Otimizado */}
        <div className="mt-16 w-full max-w-60">
          <div className="flex justify-between items-end mb-2">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[8px] uppercase tracking-[0.2em] text-red-500 font-bold"
            >
              Iniciando Protocolos...
            </motion.span>
            <span className="text-[8px] font-mono text-zinc-600">v2.0.25</span>
          </div>

          <div className="h-0.75 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-linear-to-r from-red-800 to-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "circOut" }}
            />
          </div>

          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-red-600 rounded-full animate-ping" />
              <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-bold">
                Encrypted Link
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-zinc-700 rounded-full" />
              <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-bold">
                Secure Node
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
