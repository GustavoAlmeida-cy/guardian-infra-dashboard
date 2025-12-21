"use client";

/**
 * GUARDIAN INFRA - CORE APPLICATION
 * Arquitetura: React 19 + TanStack Query V5 + Zustand
 * Objetivo: Orquestrar o monitoramento tático, alertas críticos e sincronização de dados.
 */
import "leaflet/dist/leaflet.css";

import { useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { List, Globe, AlertTriangle } from "lucide-react";

// Components: Dashboard
import { ScenarioToggle } from "./components/dashboard/others/ScenarioToggle";
import { SplashScreen } from "./components/dashboard/others/SplashScreen";
import { Sidebar } from "./components/dashboard/Sidebar";
import { AssetDetails } from "./components/dashboard/assets/AssetDetails";
import { AssetDetailsDrawer } from "./components/dashboard/assets/AssetDetailsDrawer";
import { MapEngine } from "./components/dashboard/MapEngine";
import { TacticalToast } from "./components/dashboard/tacticals/TacticalToast";

// Hooks & State
import { useAssets } from "./hooks/useAssets";
import { useAssetStore } from "./store/useAssetStore";
import type { Asset } from "./@types/asset";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

/**
 * @component AutomatedAlerts
 * Monitora ativos críticos e dispara notificações.
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

  useEffect(() => {
    alertedIds.current.clear();
  }, [source]);

  useEffect(() => {
    if (!isActive) return;

    assets.forEach((asset) => {
      const isCritical = asset.risco_atual === "Crítico";
      const toastId = `critical-${asset.id}`;

      if (isCritical && !alertedIds.current.has(asset.id)) {
        alertedIds.current.add(asset.id);

        toast.custom(
          (t) => (
            <TacticalToast
              t={t}
              variant="danger"
              title="SISTEMA: RISCO CRÍTICO"
              icon={<AlertTriangle size={18} className="animate-pulse" />}
              description={`Emergência em ${asset.nome}. Inicie protocolos.`}
              onClose={() => toast.dismiss(t)}
            />
          ),
          { duration: 10000, id: toastId }
        );
      } else if (!isCritical && alertedIds.current.has(asset.id)) {
        alertedIds.current.delete(asset.id);
        toast.dismiss(toastId);
      }
    });
  }, [assets, isActive]);

  return null;
}

/**
 * @component DashboardContent
 * Layout e sincronização de dados.
 */
function DashboardContent() {
  const { dataSource, selectedAsset, setSelectedAsset, setLastUpdate } =
    useAssetStore();
  const { data: assets = [], isLoading } = useAssets(
    dataSource as "nacional" | "bh"
  );

  const [showSplash, setShowSplash] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Responsividade
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Splash Screen Lifecycle
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Sincronização de Dados e Dependências Corrigidas
  useEffect(() => {
    if (assets.length > 0) {
      setLastUpdate(new Date());

      if (selectedAsset) {
        const freshData = assets.find((a) => a.id === selectedAsset.id);
        if (freshData && freshData.risco_atual !== selectedAsset.risco_atual) {
          setSelectedAsset(freshData);
        }
      }
    }
    // Incluídas as funções estáveis do store e o objeto de comparação
  }, [assets, selectedAsset, setSelectedAsset, setLastUpdate]);

  return (
    <main
      className="relative flex h-screen w-full bg-zinc-950 overflow-hidden text-slate-50 font-sans selection:bg-red-500/30"
      aria-label="Painel de Monitoramento Guardian Infra"
    >
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

        <div className="absolute top-10 right-4 z-1001">
          <ScenarioToggle />
        </div>

        <div className="flex-1 relative z-0">
          {isLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950">
              <div className="text-center space-y-6">
                <Globe className="w-16 h-16 text-zinc-800 animate-pulse mx-auto" />
                <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em] uppercase">
                  Sincronizando Rede...
                </p>
              </div>
            </div>
          ) : (
            <MapEngine assets={assets} />
          )}
        </div>

        {isMobile && (
          <nav className="absolute bottom-10 right-6 z-20">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-none"
                >
                  <List className="text-white" size={24} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-zinc-950 border-zinc-800 h-[85vh]">
                <DrawerTitle className="sr-only">Menu de Ativos</DrawerTitle>
                <div className="overflow-hidden h-full pt-2">
                  <Sidebar assets={assets} isMobile={true} />
                </div>
              </DrawerContent>
            </Drawer>
          </nav>
        )}
      </section>

      {!isMobile && (
        <aside className="w-auto border-l border-zinc-900 h-full bg-zinc-950 shadow-[-20px_0_50px_rgba(0,0,0,0.4)] z-20">
          <Sidebar assets={assets} />
        </aside>
      )}
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        theme="dark"
        expand={true}
        visibleToasts={5}
        toastOptions={{ unstyled: true }}
      />
      <DashboardContent />
    </QueryClientProvider>
  );
}
