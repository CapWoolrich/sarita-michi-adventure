/**
 * Spawn de michis con distancia mínima garantizada entre ellos.
 * Usa sampling determinístico para que cada mundo/nivel sea estable.
 */

const CAT_PROFILES = [
  { id: 'mochi', name: 'Mochi', color: '#ffd6c5' },
  { id: 'luna', name: 'Luna', color: '#c7dcff' },
  { id: 'kiki', name: 'Kiki', color: '#ffe28d' },
  { id: 'yuki', name: 'Yuki', color: '#f7f7ff' },
  { id: 'sakura', name: 'Sakura', color: '#ffc6df' },
  { id: 'niko', name: 'Niko', color: '#c2f5db' }
];

const MIN_DISTANCE = 15;
const SAFE_INNER = 8;
const SAFE_OUTER = 100;
const MAX_ATTEMPTS = 30;

function hashString(value = '') {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
  if (count <= 0) return [];
  const random = mulberry32(seed);
  const [aMin, aMax] = getSafeSpawnArc(worldTheme);
  const arc = aMax - aMin;
  const points = [];
  let attempts = 0;
  let i = seed % 997;

  while (points.length < count && attempts < count * MAX_ATTEMPTS) {
    const jitter = random() * 0.28;
    const a = aMin + ((((i * 137.508) * Math.PI / 180) + jitter) % arc);
    const r = SAFE_INNER + ((i * 17.3 + random() * 9) % (SAFE_OUTER - SAFE_INNER));
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    i++;
    attempts++;

    let valid = true;
    for (const p of points) {
      if (Math.hypot(p[0] - x, p[2] - z) < MIN_DISTANCE) { valid = false; break; }
    }
    if (valid) points.push([x, 0.95, z]);
  }

  while (points.length < count) {
    const a = aMin + random() * arc;
    const r = SAFE_INNER + random() * (SAFE_OUTER - SAFE_INNER);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    let valid = true;
    for (const p of points) {
      if (Math.hypot(p[0] - x, p[2] - z) < MIN_DISTANCE * 0.7) { valid = false; break; }
    }
    if (valid || random() < 0.15) points.push([x, 0.95, z]);
  }

  return points;
}

function poissonSampleEscape(count, seed) {
  const random = mulberry32(seed);
  const points = [];
  let i = 1;
  // SPAWN CERCA: 8..20m del centro — visibles desde el inicio
  while (points.length < count && i < count * 30) {
    const a = random() * Math.PI * 2;
    const r = 15 + random() * 35;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    let valid = true;
    for (const p of points) {
      if (Math.hypot(p[0] - x, p[2] - z) < 12) { valid = false; break; }
    }
    if (valid) points.push([x, 0.95, z]);
    i++;
  }
  while (points.length < count) {
    const a = random() * Math.PI * 2;
    const r = 15 + random() * 35;
    points.push([Math.cos(a) * r, 0.95, Math.sin(a) * r]);
  }
  return points;
}

export function generateLevelCats(worldConfig, levelConfig) {
  const count = Number(levelConfig?.catCount ?? 0);
  if (count <= 0) return [];

  const worldTheme = worldConfig?.theme ?? 'mystic-forest';
  const seed = hashString(`${worldConfig?.id ?? 'world-1'}:${levelConfig?.id ?? 'nivel-1'}:${levelConfig?.missionType ?? 'rescue'}`);
  const random = mulberry32(seed + 31);

  const positions = (levelConfig?.missionType === 'escape') ? poissonSampleEscape(count, seed) : poissonSample(count, worldTheme, seed);
  const mustHaveGolden = levelConfig?.forceGoldenCat || levelConfig?.missionType === 'golden' || levelConfig?.missionType === 'finale';
  const goldenIndex = mustHaveGolden
    ? Math.max(0, Math.floor(random() * count))
    : (random() < 0.25 ? Math.floor(random() * count) : -1);

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
      speed: (levelConfig?.missionType === 'escape') ? 0.9 + ((index * 0.21) % 0.4) : 0.4 + ((index * 0.31) % 0.5),
      points: isGolden ? 500 : 100
    };
  });
}
