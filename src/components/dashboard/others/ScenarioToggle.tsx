/**
 * @file ScenarioToggle.tsx
 * @description Seletor de contexto geoespacial (Nacional vs Regional).
 * Resolve conflitos de tipagem entre strings genéricas e literais do sistema.
 */

import { useState } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import { Globe, Map as MapIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- DEFINIÇÃO DE TIPOS ---
// Extraímos o tipo diretamente do que o Store espera para garantir sincronia
type DataSourceType = "nacional" | "bh";

interface Scenario {
  id: DataSourceType;
  label: string;
  icon: typeof Globe;
  city: string;
}

const SCENARIOS: Scenario[] = [
  { id: "nacional", label: "Nacional", icon: Globe, city: "Brasil" },
  { id: "bh", label: "Minas Gerais", icon: MapIcon, city: "Belo Horizonte" },
];

/**
 * @component ScenarioToggle
 * @description Switcher tático para alternar bases de dados.
 */
export function ScenarioToggle() {
  const { dataSource, setDataSource, lastUpdate } = useAssetStore();
  const [isOpen, setIsOpen] = useState(false);

  // Encontra o cenário ativo ou define o padrão (Fallback seguro)
  const activeScenario =
    SCENARIOS.find((s) => s.id === dataSource) || SCENARIOS[0];

  /**
   * @handler handleSourceChange
   * CORREÇÃO TS: O parâmetro agora usa DataSourceType em vez de string
   */
  const handleSourceChange = (id: DataSourceType) => {
    setDataSource(id);
    setIsOpen(false);
  };

  return (
    <div className="relative z-1001 flex flex-col gap-2">
      {/* TRIGGER: Botão de Seleção Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-3 p-1.5 pr-3 bg-zinc-950/95 border border-zinc-800/50 rounded-xl backdrop-blur-md cursor-pointer shadow-lg hover:border-zinc-700 transition-all w-fit group"
      >
        <div className="bg-red-600 p-2 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-transform group-active:scale-90">
          <activeScenario.icon size={14} className="text-white" />
        </div>

        <div className="flex flex-col min-w-20 text-left">
          <span className="text-[10px] font-black text-white uppercase tracking-wider italic leading-none">
            {activeScenario.label}
          </span>
          <span className="text-[8px] text-zinc-500 font-mono mt-1">
            {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-zinc-600 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN: Menu de Opções */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-14 left-0 w-44 bg-zinc-950/98 border border-zinc-800/50 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-110"
          >
            <ScrollArea className="h-full max-h-52 w-full p-1">
              <div className="flex flex-col gap-1" role="listbox">
                {SCENARIOS.map((scenario) => {
                  const isActive = dataSource === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSourceChange(scenario.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                        ${
                          isActive
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300"
                        }
                      `}
                    >
                      <scenario.icon
                        size={14}
                        className={isActive ? "text-red-500" : ""}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-tight">
                        {scenario.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="active-dot"
                          className="ml-auto w-1 h-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(220,38,38,1)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BEACON: Indicador de Conexão Ativa */}
      <div className="flex items-center gap-2 px-2 opacity-60 pointer-events-none">
        <div className="relative h-1 w-1">
          <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative block h-1 w-1 rounded-full bg-red-600"></span>
        </div>
        <span className="text-[7px] text-white font-mono uppercase tracking-[0.2em] leading-none">
          Live Stream: {activeScenario.city}
        </span>
      </div>
    </div>
  );
}
