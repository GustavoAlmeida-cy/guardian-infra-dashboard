import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Simulação de __dirname para ambientes ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa bibliotecas grandes em chunks distintos para melhor cache do navegador
          "vendor-maps": ["leaflet", "react-leaflet"],
          "vendor-ui": ["framer-motion", "lucide-react", "recharts"],
        },
      },
    },
  },
});
