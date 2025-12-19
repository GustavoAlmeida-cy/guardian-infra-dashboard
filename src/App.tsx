import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

// Componentes que vamos criar/ajustar
import { SplashScreen } from "./components/dashboard/SplashScreen";
import { Sidebar } from "./components/dashboard/Sidebar";
import { useAssets } from "./hooks/useAssets";
import { useAssetStore } from "./store/useAssetStore";

const queryClient = new QueryClient();

function DashboardContent() {
  const { dataSource } = useAssetStore();
  const { data: assets = [], isLoading } = useAssets(dataSource);
  const [showSplash, setShowSplash] = useState(true);

  // Lógica para esconder a Splash Screen após carregar
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden text-slate-50">
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* Lado Esquerdo: Mapa e Alertas */}
      <section className="flex-1 relative flex flex-col">
        {/* Aqui entrará o componente RiskMap em breve */}
        <div className="flex-1 flex items-center justify-center border-l border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-500 animate-pulse">
              Monitorando Ativos em Tempo Real...
            </p>
            <p className="text-[10px] text-zinc-700 mt-2">
              FONTE: {dataSource.toUpperCase()}
            </p>
          </div>
        </div>
      </section>

      {/* Lado Direito: Sidebar de Ativos */}
      <Sidebar assets={assets} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" theme="dark" richColors />
      <DashboardContent />
    </QueryClientProvider>
  );
}
