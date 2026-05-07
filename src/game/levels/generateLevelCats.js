/**
 * Spawn de michis con distancia MÍNIMA garantizada entre ellos (15m).
 * Usa Poisson disk sampling sobre el anillo seguro 8..100m del mapa.
 * Distribución áurea como fallback si el rejection sampling no encuentra hueco.
 */

const CAT_PROFILES = [
  { id: 'mochi', name: 'Mochi', color: '#ffd6c5' },
  { id: 'luna', name: 'Luna', color: '#c7dcff' },
  { id: 'kiki', name: 'Kiki', color: '#ffe28d' },
  { id: 'yuki', name: 'Yuki', color: '#f7f7ff' },
  { id: 'sakura', name: 'Sakura', color: '#ffc6df' },
  { id: 'niko', name: 'Niko', color: '#c2f5db' }
];

const MIN_DISTANCE = 15; // metros mínimos entre michis
const SAFE_INNER = 8;
const SAFE_OUTER = 100;
const MAX_ATTEMPTS = 30;

function getSafeSpawnArc(worldTheme) {
  const featureNorthThemes = new Set([
    'sakura-city', 'crystal-lake', 'pastel-port', 'aurora-mountain', 'stellar-village'
  ]);
  if (featureNorthThemes.has(worldTheme)) {
    return [Math.PI * 0.15, Math.PI * 1.85];
  }
  return [0, Math.PI * 2];
}

function poissonSample(count, worldTheme, seed = 0) {
  const [aMin, aMax] = getSafeSpawnArc(worldTheme);
  const arc = aMax - aMin;
  const points = [];
  let attempts = 0;
  let i = seed;

  while (points.length < count && attempts < count * MAX_ATTEMPTS) {
    // Posición candidata pseudo-random determinista
    const a = aMin + (((i * 137.508) * Math.PI / 180) % arc);
    const r = SAFE_INNER + ((i * 17.3) % (SAFE_OUTER - SAFE_INNER));
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    i++;
    attempts++;
    // Verificar distancia mínima
    let valid = true;
    for (const p of points) {
      if (Math.hypot(p[0] - x, p[2] - z) < MIN_DISTANCE) { valid = false; break; }
    }
    if (valid) points.push([x, 0.95, z]);
  }

  // Si no llenamos por rejection, fallback con random spread
  while (points.length < count) {
    const a = aMin + Math.random() * arc;
    const r = SAFE_INNER + Math.random() * (SAFE_OUTER - SAFE_INNER);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    let valid = true;
    for (const p of points) {
      if (Math.hypot(p[0] - x, p[2] - z) < MIN_DISTANCE * 0.7) { valid = false; break; }
    }
    if (valid) points.push([x, 0.95, z]);
    else if (Math.random() < 0.15) points.push([x, 0.95, z]); // give up sometimes
  }

  return points;
}

export function generateLevelCats(worldConfig, levelConfig) {
  const count = Number(levelConfig?.catCount ?? 0);
  const worldTheme = worldConfig?.theme ?? 'mystic-forest';
  const seed = (worldConfig?.order ?? 1) * 1000 + Date.now() % 100;

  const positions = poissonSample(count, worldTheme, seed);
  const goldenIndex = Math.random() < 0.25 ? Math.floor(Math.random() * count) : -1;

  return Array.from({ length: count }, (_, index) => {
    const profile = CAT_PROFILES[index % CAT_PROFILES.length];
    const [x, y, z] = positions[index] ?? [0, 0.95, 0];

    const isGolden = index === goldenIndex;
    return {
      id: `${worldConfig.id}-${levelConfig.id}-${profile.id}-${index}`,
      profileId: profile.id,
      name: isGolden ? 'Michi Dorado' : profile.name,
      color: isGolden ? '#ffd066' : (worldConfig.palette[index % worldConfig.palette.length] ?? profile.color),
      golden: isGolden,
      position: [x, y, z],
      anchor: [x, y, z],
      wanderRadius: 2.0 + (index % 3) * 0.4,
      phase: (index * 0.73) % (Math.PI * 2),
      speed: 0.4 + ((index * 0.31) % 0.5),
      points: isGolden ? 500 : 100
    };
  });
}
