import { useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { List, Globe, AlertTriangle } from "lucide-react";

import "leaflet/dist/leaflet.css";

import { ScenarioToggle } from "./components/dashboard/ScenarioToggle";
import { SplashScreen } from "./components/dashboard/SplashScreen";
import { Sidebar } from "./components/dashboard/Sidebar";
import { AssetDetails } from "./components/dashboard/AssetDetails";
import { AssetDetailsDrawer } from "./components/dashboard/AssetDetailsDrawer";
import { MapEngine } from "./components/dashboard/MapEngine";
import { TacticalToast } from "./components/dashboard/TacticalToast";

import { useAssets } from "./hooks/useAssets";
import { useAssetStore } from "./store/useAssetStore";
import type { Asset } from "./@types/asset";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";

const queryClient = new QueryClient();

/**
 * MONITOR DE ALERTAS AUTOMÁTICOS
 */
function AutomatedAlerts({
  assets,
  isActive,
  source,
}: {
  assets: Asset[];
  isActive: boolean;
  source: string;
}) {
  const alertedIds = useRef<Set<number | string>>(new Set());

  // Limpa o histórico de alertas quando muda a cidade/fonte
  useEffect(() => {
    alertedIds.current.clear();
  }, [source]);

  useEffect(() => {
    // Só dispara se a splash screen já sumiu
    if (!isActive) return;

    assets.forEach((asset) => {
      const isCritical = asset.risco_atual === "Crítico";

      if (isCritical && !alertedIds.current.has(asset.id)) {
        alertedIds.current.add(asset.id);

        toast.custom(
          () => (
            <TacticalToast
              variant="danger"
              title="SISTEMA: RISCO CRÍTICO"
              icon={<AlertTriangle size={18} className="animate-pulse" />}
              description={`Emergência em ${asset.nome}. Inicie protocolos.`}
            />
          ),
          {
            duration: 10000,
            id: `critical-${asset.id}`, // ID único por asset permite múltiplos toasts simultâneos
          }
        );
      } else if (!isCritical && alertedIds.current.has(asset.id)) {
        alertedIds.current.delete(asset.id);
        toast.dismiss(`critical-${asset.id}`); // Remove o toast se o risco baixar
      }
    });
  }, [assets, isActive]);

  return null;
}

function DashboardContent() {
  const { dataSource, selectedAsset, setSelectedAsset, setLastUpdate } =
    useAssetStore();
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

  useEffect(() => {
    if (assets.length > 0) {
      setLastUpdate(new Date());
      if (selectedAsset) {
        const freshData = assets.find((a) => a.id === selectedAsset.id);
        if (
          freshData &&
          JSON.stringify(freshData) !== JSON.stringify(selectedAsset)
        ) {
          setSelectedAsset(freshData);
        }
      }
    }
  }, [assets, selectedAsset, setSelectedAsset, setLastUpdate]);

  return (
    <div className="relative flex h-screen w-full bg-zinc-950 overflow-hidden text-slate-50 font-sans">
      {/* O monitor agora sabe se a splash screen terminou (!showSplash) */}
      <AutomatedAlerts
        assets={assets}
        isActive={!showSplash}
        source={dataSource}
      />

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

        <div className="absolute top-6 right-6 z-1001">
          <ScenarioToggle />
        </div>

        <div className="flex-1 relative z-0">
          {isLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, #3f3f46 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="text-center space-y-6 z-20">
                <Globe className="w-16 h-16 text-zinc-800 animate-pulse mx-auto" />
                <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em] uppercase">
                  Sincronizando Rede Guardian...
                </p>
              </div>
            </div>
          ) : (
            <MapEngine assets={assets} />
          )}
        </div>

        {isMobile && (
          <div className="absolute bottom-8 right-6 z-20">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 cursor-pointer rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-none transition-transform active:scale-90"
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
        <aside className="w-auto border-l border-zinc-900 h-full bg-zinc-950 shadow-[-20px_0_50px_rgba(0,0,0,0.4)] z-20">
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
        expand={true} // Permite ver múltiplos alertas empilhados
        visibleToasts={5} // Mostra até 5 simultâneos
        toastOptions={{
          unstyled: true,
          className: "w-full flex justify-center md:justify-end px-4 md:px-6",
        }}
      />
      <DashboardContent />
    </QueryClientProvider>
  );
}
