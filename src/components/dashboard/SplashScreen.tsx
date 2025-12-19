import { motion } from "framer-motion";
import { ShieldAlert, Cpu } from "lucide-react";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white"
    >
      {/* Elemento de Background Sutil */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ShieldAlert size={80} className="text-red-600 shadow-red-500/50" />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <h1 className="text-3xl font-black tracking-[0.2em] uppercase italic text-zinc-100">
          Guardian <span className="text-red-600">Infra</span>
        </h1>

        <div className="flex items-center gap-2 mt-2">
          <Cpu size={14} className="text-zinc-500 animate-pulse" />
          <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase font-bold">
            Sipremo Intelligence System
          </p>
        </div>

        {/* Status Loader */}
        <div className="mt-12 w-64">
          <div className="flex justify-between mb-2">
            <span className="text-[9px] uppercase tracking-widest text-zinc-600">
              Sincronizando Ativos
            </span>
            <span className="text-[9px] uppercase tracking-widest text-zinc-600">
              v2.0.25
            </span>
          </div>
          <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
