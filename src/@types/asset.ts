/**
 * @file asset.ts
 * @description Definições de tipos para os ativos de infraestrutura monitorados.
 * Essencial para garantir a integridade dos dados entre o MapEngine e a Sidebar.
 */

/** * Níveis de risco padronizados pelo protocolo de Defesa Civil
 */
export type RiskLevel = "Baixo" | "Moderado" | "Alto" | "Crítico";

/**
 * Representação geográfica de coordenadas decimais
 */
export interface Coordenadas {
  latitude: number;
  longitude: number;
}

/**
 * Interface Principal do Ativo (Asset)
 * @property {number} id - Identificador único universal
 * @property {string} nome - Nome descritivo do ativo (Ex: Ponte X, Barragem Y)
 * @property {string} localizacao - Endereço ou descrição regional
 * @property {RiskLevel} risco_atual - Status de perigo imediato
 * @property {string} ultima_atualizacao - Data formatada em ISO ou string legível
 */
export interface Asset {
  id: number;
  nome: string;
  localizacao: string;
  risco_atual: RiskLevel;
  ultima_atualizacao: string;
  coordenadas: Coordenadas;

  // Propriedades Táticas (Pegadinhas do JSON/API)
  /** Tempo previsto até o evento climático atingir o ativo */
  tempo_estimado_impacto?: string;
  /** Lista de procedimentos de emergência cadastrados */
  acoes_contingencia?: string[];

  // Adição Recomendada: Para Acessibilidade no Mapa
  /** Descrição textual do status para leitores de tela */
  descricao_acessibilidade?: string;
}
