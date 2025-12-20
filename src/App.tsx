import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { List, Globe } from "lucide-react";

import { ScenarioToggle } from "./components/dashboard/ScenarioToggle";
import { SplashScreen } from "./components/dashboard/SplashScreen";
import { Sidebar } from "./components/dashboard/Sidebar";
import { AssetDetails } from "./components/dashboard/AssetDetails";
import { AssetDetailsDrawer } from "./components/dashboard/AssetDetailsDrawer";
import { useAssets } from "./hooks/useAssets";
import { useAssetStore } from "./store/useAssetStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Certifique-on de ter esse componente shadcn
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";

const queryClient = new QueryClient();

function DashboardContent() {
  const { dataSource, selectedAsset } = useAssetStore();

  // SOLUÇÃO DO ERRO TS(2345): Casting do dataSource para o tipo esperado pelo hook
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

      <section className="flex-1 relative flex flex-col h-full overflow-hidden">
        <AnimatePresence>
          {selectedAsset &&
            (isMobile ? (
              <AssetDetailsDrawer key="mobile-drawer" />
            ) : (
              <AssetDetails key={selectedAsset.id} />
            ))}
        </AnimatePresence>

        <div className="absolute top-6 right-6 z-30">
          <ScenarioToggle />
        </div>

        {/* MAPA / SKELETON DE CARREGAMENTO */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              {/* Efeito de Grade de Radar (Skeleton de Fundo) */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, #3f3f46 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Overlay de Scan Line */}
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: "100%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-full h-20 bg-linear-to-b from-transparent via-red-500/10 to-transparent z-0"
              />

              <div className="text-center space-y-6 z-20">
                <div className="relative">
                  <Globe className="w-16 h-16 text-zinc-800 animate-pulse mx-auto" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-red-600 rounded-full blur-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-zinc-500 animate-pulse text-xs md:text-sm font-mono tracking-[0.3em] uppercase">
                    Sincronizando Satélites...
                  </p>
                  <div className="flex justify-center gap-1">
                    <Skeleton className="h-1 w-8 bg-red-600/30" />
                    <Skeleton className="h-1 w-12 bg-red-600/50" />
                    <Skeleton className="h-1 w-8 bg-red-600/30" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MAPA ATIVO (Placeholder atualizado) */
            <div className="flex-1 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950">
              <div className="text-center p-6 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-red-500/80 text-xs md:text-sm font-mono tracking-[0.2em] uppercase font-black">
                    Rede de Monitoramento Ativa
                  </p>
                  <div className="h-px w-24 bg-linear-to-r from-transparent via-red-600 to-transparent" />
                </div>
                <p className="text-[10px] text-zinc-600 tracking-[0.5em] font-black uppercase">
                  {dataSource === "bh"
                    ? "Regional: Minas Gerais"
                    : "Nacional: Brasil"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* LISTA DE ATIVOS MOBILE */}
        {isMobile && (
          <div className="absolute bottom-8 right-6 z-40">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-none transition-transform active:scale-90"
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
