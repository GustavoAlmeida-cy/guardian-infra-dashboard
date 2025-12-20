import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { List } from "lucide-react";

import { ScenarioToggle } from "./components/dashboard/ScenarioToggle";
import { SplashScreen } from "./components/dashboard/SplashScreen";
import { Sidebar } from "./components/dashboard/Sidebar";
import { AssetDetails } from "./components/dashboard/AssetDetails";
import { useAssets } from "./hooks/useAssets";
import { useAssetStore } from "./store/useAssetStore";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";

const queryClient = new QueryClient();

function DashboardContent() {
  const { dataSource, selectedAsset } = useAssetStore();
  const { data: assets = [], isLoading } = useAssets(dataSource);
  const [showSplash, setShowSplash] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="relative flex h-screen w-full bg-zinc-950 overflow-hidden text-slate-50 font-sans">
      {/* Camada de Splash Screen */}
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* ÁREA PRINCIPAL: MAPA E INTERFACE OVERLAY */}
      <section className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Camada de Detalhes do Ativo - AnimatePresence gerencia a saída */}
        <AnimatePresence>
          {selectedAsset && <AssetDetails key={selectedAsset.id} />}
        </AnimatePresence>

        {/* CONTROLES FLUTUANTES (Sempre visíveis sobre o mapa) */}
        <div className="absolute top-6 right-6 z-30">
          <ScenarioToggle />
        </div>

        {/* Placeholder do Mapa (Espaço onde o Leaflet/Mapbox entrará) */}
        <div className="flex-1 flex items-center justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950">
          <div className="text-center p-6 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-500 animate-pulse text-xs md:text-sm font-mono tracking-[0.2em] uppercase">
                {isLoading
                  ? "Sincronizando Satélites..."
                  : "Rede de Monitoramento Ativa"}
              </p>
              <div className="h-px w-12 bg-red-600/50 animate-bounce" />
            </div>

            <p className="text-[10px] text-zinc-800 tracking-[0.5em] font-black uppercase">
              {dataSource === "bh"
                ? "Regional: Minas Gerais"
                : "Nacional: Brasil"}
            </p>
          </div>
        </div>

        {/* INTERFACE MOBILE */}
        {isMobile && (
          <div className="absolute bottom-8 right-6 z-40">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] border-none transition-transform active:scale-90"
                >
                  <List className="text-white" size={24} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-zinc-950 border-zinc-800 h-[85vh] outline-none">
                <DrawerTitle className="sr-only">Menu de Ativos</DrawerTitle>
                <div className="overflow-hidden h-full pt-2">
                  <Sidebar assets={assets} isMobile={true} />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      </section>

      {/* SIDEBAR DESKTOP */}
      {!isMobile && (
        <aside className="w-96 border-l border-zinc-900 h-full bg-zinc-950 shadow-[-20px_0_50px_rgba(0,0,0,0.4)] z-20">
          <Sidebar assets={assets} />
        </aside>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: { background: "#09090b", border: "1px solid #27272a" },
        }}
      />
      <DashboardContent />
    </QueryClientProvider>
  );
}
