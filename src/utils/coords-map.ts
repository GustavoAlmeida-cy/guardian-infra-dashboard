/**
 * @file coords-map.ts
 * @description Dicionário de geolocalização para fallback de ativos sem coordenadas nativas.
 * Essencial para o mapeamento do cenário Nacional (Guardian Infra).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Mapeamento de Capitais: Coordenadas centrais para representação tática.
 */
export const CIDADE_COORDS: Record<string, GeoPoint> = {
  "São Paulo, SP": { lat: -23.5505, lng: -46.6333 },
  "Rio de Janeiro, RJ": { lat: -22.9068, lng: -43.1729 },
  "Belo Horizonte, MG": { lat: -19.9217, lng: -43.9333 },
  "Porto Alegre, RS": { lat: -30.0346, lng: -51.2177 },
  "Salvador, BA": { lat: -12.9714, lng: -38.5014 },
  "Curitiba, PR": { lat: -25.429, lng: -49.2671 },
  "Recife, PE": { lat: -8.0578, lng: -34.8778 },
  "Fortaleza, CE": { lat: -3.7172, lng: -38.5433 },
};

/**
 * Fallback estratégico: Caso uma localização não seja encontrada,
 * retorna o centro geográfico do Brasil para manter o ativo visível.
 */
export const DEFAULT_COORD: GeoPoint = { lat: -15.7801, lng: -47.9292 };

/**
 * @function getCoordsByLocation
 * Busca segura de coordenadas com tratamento de erro.
 */
export const getCoordsByLocation = (location: string): GeoPoint => {
  return CIDADE_COORDS[location] || DEFAULT_COORD;
};
