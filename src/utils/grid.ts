const GRID_SIZE = 0.0035; // Define o tamanho dos "lotes" hexagonais

export const getSnappedCenter = (lat: number, lng: number) => {
  const size = GRID_SIZE;
  const q = ((Math.sqrt(3) / 3) * lng - (1 / 3) * lat) / size;
  const r = ((2 / 3) * lat) / size;

  let qi = Math.round(q);
  let ri = Math.round(r);
  const si = Math.round(-q - r);

  const q_diff = Math.abs(qi - q);
  const r_diff = Math.abs(ri - r);
  const s_diff = Math.abs(si - (-q - r));

  if (q_diff > r_diff && q_diff > s_diff) qi = -ri - si;
  else if (r_diff > s_diff) ri = -qi - si;

  const resLng = size * (Math.sqrt(3) * qi + (Math.sqrt(3) / 2) * ri);
  const resLat = size * ((3 / 2) * ri);

  return [resLat, resLng] as [number, number];
};
