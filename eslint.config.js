import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * Configuração de Linter - Guardian Infra Dashboard
 * Foco: Tipagem estrita, boas práticas de Hooks e performance HMR.
 */
export default defineConfig([
  // Ignora artefatos de build do pipeline
  globalIgnores(["dist"]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Garante a integridade da tipagem proibindo o tipo 'any'
      "@typescript-eslint/no-explicit-any": "error",

      // Avisa sobre variáveis declaradas mas não utilizadas (exceto as iniciadas com _)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Configuração de exportação constante para melhor performance do React Refresh
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]);
