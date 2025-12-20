import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/**
 * Ponto de entrada da aplicação Guardian Infra.
 * * O operador '!' garante ao TypeScript que o elemento 'root' existe no DOM,
 * evitando verificações de nulidade desnecessárias em tempo de execução.
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Falha ao encontrar o elemento raiz. Verifique o seu index.html."
  );
}

createRoot(rootElement).render(
  /**
   * StrictMode: Ajuda a identificar efeitos colaterais e componentes obsoletos
   * durante o desenvolvimento, essencial para a estabilidade de dashboards táticos.
   */
  <StrictMode>
    <App />
  </StrictMode>
);
