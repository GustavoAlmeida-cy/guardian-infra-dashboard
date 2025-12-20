import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { List, Globe } from "lucide-react";

import "leaflet/dist/leaflet.css";

import { ScenarioToggle } from "./components/dashboard/ScenarioToggle";
import { SplashScreen } from "./components/dashboard/SplashScreen";
import { Sidebar } from "./components/dashboard/Sidebar";
import { AssetDetails } from "./components/dashboard/AssetDetails";
import { AssetDetailsDrawer } from "./components/dashboard/AssetDetailsDrawer";
import { MapEngine } from "./components/dashboard/MapEngine";
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
  const { data: assets = [], isLoading } = useAssets(
    dataSource as "nacional" | "bh"
  );

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
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* CAMADA PRINCIPAL: MAPA */}
      <main className="flex-1 relative h-full bg-zinc-900">
        {isLoading ? (
          <div className="absolute inset-0 z-100 flex items-center justify-center bg-zinc-950">
            {/* ... conteúdo do loading mantido ... */}
            <div className="text-center space-y-6 z-20">
              <Globe className="w-16 h-16 text-zinc-800 animate-pulse mx-auto" />
              <p className="text-zinc-500 animate-pulse text-[10px] font-mono tracking-[0.3em] uppercase">
                Sincronizando Rede Guardian...
              </p>
            </div>
          </div>
        ) : (
          <MapEngine assets={assets} />
        )}

        {/* CAMADA DE INTERFACE (HUD) - SOBREPOSTA AO MAPA */}
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Top Bar / Controles */}
          <div className="absolute top-6 right-6 pointer-events-auto">
            <ScenarioToggle />
          </div>

          {/* Detalhes do Ativo (Desktop) */}
          <AnimatePresence>
            {selectedAsset && !isMobile && (
              <div className="absolute top-24 right-6 pointer-events-auto w-96 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <AssetDetails key={selectedAsset.id} />
              </div>
            )}
          </AnimatePresence>

          {/* Mobile UI Elements */}
          {isMobile && (
            <>
              <AnimatePresence>
                {selectedAsset && <AssetDetailsDrawer key="mobile-drawer" />}
              </AnimatePresence>

              <div className="absolute bottom-8 right-6 pointer-events-auto">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      size="icon"
                      className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl border-none active:scale-90"
                    >
                      <List className="text-white" size={24} />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-zinc-950 border-zinc-800 h-[85vh]">
                    <DrawerTitle className="sr-only">
                      Menu de Ativos
                    </DrawerTitle>
                    <Sidebar assets={assets} isMobile={true} />
                  </DrawerContent>
                </Drawer>
              </div>
            </>
          )}
        </div>
      </main>

      {/* BARRA LATERAL (DESKTOP) - FIXA À ESQUERDA OU DIREITA */}
      {!isMobile && (
        <aside className="w-auto border-l border-zinc-900 h-full bg-zinc-950/50 backdrop-blur-xl z-60 relative overflow-hidden">
          <Sidebar assets={assets} />
        </aside>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" theme="dark" richColors />
      <DashboardContent />
    </QueryClientProvider>
  );
}
