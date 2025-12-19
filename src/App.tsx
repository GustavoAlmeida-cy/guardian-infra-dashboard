import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { List } from "lucide-react"; // Ícone para o botão mobile

import { SplashScreen } from "./components/dashboard/SplashScreen";
import { Sidebar } from "./components/dashboard/Sidebar";
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
  const { dataSource } = useAssetStore();
  const { data: assets = [], isLoading } = useAssets(dataSource);
  const [showSplash, setShowSplash] = useState(true);

  // Hook simples para detectar mobile sem precisar de bibliotecas extras
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
    <div className="relative flex h-screen w-full bg-zinc-950 overflow-hidden text-slate-50">
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* ÁREA PRINCIPAL: MAPA */}
      <section className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Aqui entrará o componente RiskMap */}
        <div className="flex-1 flex items-center justify-center border-zinc-800">
          <div className="text-center p-6">
            <p className="text-zinc-500 animate-pulse text-sm md:text-base">
              Monitorando Ativos em Tempo Real...
            </p>
            <p className="text-[10px] text-zinc-700 mt-2 tracking-[0.2em]">
              FONTE: {dataSource.toUpperCase()}
            </p>
          </div>
        </div>

        {/* BOTÃO FLUTUANTE MOBILE (Aparece apenas < 1024px) */}
        {isMobile && (
          <div className="absolute bottom-8 right-6 z-40">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 cursor-pointer rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 border-none"
                >
                  <List className="text-white" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-zinc-950 border-zinc-800 h-[80vh]">
                <DrawerTitle className="sr-only">Lista de Ativos</DrawerTitle>
                <div className="overflow-hidden h-full">
                  <Sidebar assets={assets} isMobile={true} />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      </section>

      {/* SIDEBAR DESKTOP (Escondida no mobile) */}
      {!isMobile && (
        <div className="w-85 border-l border-zinc-800 h-full">
          <Sidebar assets={assets} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <DashboardContent />
    </QueryClientProvider>
  );
}
