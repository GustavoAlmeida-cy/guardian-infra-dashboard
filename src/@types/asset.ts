export type RiskLevel = "Baixo" | "Moderado" | "Alto" | "Crítico";

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export interface Asset {
  id: number;
  nome: string;
  localizacao: string;
  risco_atual: RiskLevel;
  ultima_atualizacao: string;
  coordenadas: Coordenadas;
  // Opcionais para tratar as "pegadinhas" do JSON
  tempo_estimado_impacto?: string;
  acoes_contingencia?: string[];
}
