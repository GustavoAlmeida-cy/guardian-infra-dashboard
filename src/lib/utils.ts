/**
 * @file utils.ts
 * @description Utilitários globais de estilização.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @function cn (Class Name)
 * Combina classes condicionais de forma inteligente.
 * * 1. 'clsx' lida com lógicas condicionais (ex: isOpen && "flex")
 * 2. 'twMerge' resolve conflitos de especificidade do Tailwind
 * (ex: "px-2 px-4" vira apenas "px-4")
 * * @param inputs - Array de strings, objetos ou valores booleanos de classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
