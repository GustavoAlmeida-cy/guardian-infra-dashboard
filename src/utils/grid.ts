/**
 * @file grid.ts
 * @description Lógica de Snapping Hexagonal para o MapEngine.
 * Organiza os ativos em uma grade geométrica para evitar sobreposição visual.
 */

/** * Tamanho do lote hexagonal (aprox. 350-400 metros).
 * Ajuste este valor para aumentar ou diminuir a densidade da grade.
 */
const GRID_SIZE = 0.0035;

/**
 * @function getSnappedCenter
 * @description Converte coordenadas lat/lng para o centro do hexágono mais próximo.
 * @param lat Latitude original
 * @param lng Longitude original
 * @returns {[number, number]} Coordenadas ajustadas [lat, lng]
 */
export const getSnappedCenter = (lat: number, lng: number) => {
  const size = GRID_SIZE;

  // 1. Projeção: Converte para espaço de coordenadas axial
  const q = ((Math.sqrt(3) / 3) * lng - (1 / 3) * lat) / size;
  const r = ((2 / 3) * lat) / size;

  // 2. Arredondamento para o "cubo" mais próximo
  let qi = Math.round(q);
  let ri = Math.round(r);
  const si = Math.round(-q - r);

  const q_diff = Math.abs(qi - q);
  const r_diff = Math.abs(ri - r);
  const s_diff = Math.abs(si - (-q - r));

  // Ajuste de erro de arredondamento para manter a integridade hexagonal (q + r + s = 0)
  if (q_diff > r_diff && q_diff > s_diff) {
    qi = -ri - si;
  } else if (r_diff > s_diff) {
    ri = -qi - si;
  }

  // 3. Reversão: Converte de volta para coordenadas geográficas centralizadas
  const resLng = size * (Math.sqrt(3) * qi + (Math.sqrt(3) / 2) * ri);
  const resLat = size * ((3 / 2) * ri);

  return [resLat, resLng] as [number, number];
};
