import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Configuração do Build e Servidor de Desenvolvimento - Vite
 * Define a estratégia de compilação e mapeamento de caminhos (Aliases).
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Configurações de build para otimizar o carregamento de mapas pesados
  build: {
    chunkSizeWarningLimit: 1000, // Aumentado devido à densidade de bibliotecas geoespaciais
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa bibliotecas grandes em chunks distintos para melhor cache do navegador
          "vendor-maps": ["leaflet", "react-leaflet"],
          "vendor-ui": ["framer-motion", "lucide-react"],
        },
      },
    },
  },
});
