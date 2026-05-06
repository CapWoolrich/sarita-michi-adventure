/**
 * Spawn de michis en zonas seguras:
 * - Anillo interno (radio 5..12) — siempre visible, ANTES de los árboles del bioma (que empiezan en r≈11).
 * - Distribución áurea (137.5°) para que se vean bien repartidos sin solaparse.
 * - Sin colocarse encima de cualquier feature central (montañas, faro, torii, lago).
 * Cada gato lleva un offset de fase y un radio de ronda para su IA de wander.
 */

const CAT_PROFILES = [
  { id: 'mochi', name: 'Mochi', color: '#ffd6c5' },
  { id: 'luna', name: 'Luna', color: '#c7dcff' },
  { id: 'kiki', name: 'Kiki', color: '#ffe28d' },
  { id: 'yuki', name: 'Yuki', color: '#f7f7ff' },
  { id: 'sakura', name: 'Sakura', color: '#ffc6df' },
  { id: 'niko', name: 'Niko', color: '#c2f5db' }
];

/**
 * Devuelve la zona segura para spawn según el bioma — evita los features centrales
 * que están al norte (lago, faro, torii, montaña).
 */
function getSafeSpawnZones(worldTheme) {
  // Por defecto, círculo completo en el anillo seguro.
  const all = [0, Math.PI * 2];
  // Mundos con feature al norte: limitar a la mitad sur (PI..2PI) para evitar superposición.
  const featureNorthThemes = new Set([
    'sakura-city',     // Torii al norte
    'crystal-lake',    // Lago al norte
    'pastel-port',     // Faro/mar al este — no critical
    'aurora-mountain', // Montañas al norte
    'stellar-village'  // Planeta al norte
  ]);
  if (featureNorthThemes.has(worldTheme)) {
    return [Math.PI * 0.15, Math.PI * 1.85]; // evita la franja directa al norte
  }
  return all;
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // 137.5° en radianes

export function generateLevelCats(worldConfig, levelConfig) {
  const count = Number(levelConfig?.catCount ?? 0);
  const worldTheme = worldConfig?.theme ?? 'mystic-forest';
  const [aMin, aMax] = getSafeSpawnZones(worldTheme);
  const arc = aMax - aMin;

  // 25% chance de que aparezca un michi dorado en cualquier nivel (vale 500 pts)
  const goldenIndex = Math.random() < 0.25 ? Math.floor(Math.random() * count) : -1;

  return Array.from({ length: count }, (_, index) => {
    const profile = CAT_PROFILES[index % CAT_PROFILES.length];
    // Distribución áurea dentro del arco seguro
    const angle = aMin + ((index * GOLDEN) % arc);
    const radius = 6 + ((index * 1.7) % 18); // 6..24, mucho más dispersos
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = 0.95; // ligeramente más alto para asegurar visibilidad por encima de hierba/props

    const isGolden = index === goldenIndex;
    return {
      id: `${worldConfig.id}-${levelConfig.id}-${profile.id}-${index}`,
      profileId: profile.id,
      name: isGolden ? 'Michi Dorado' : profile.name,
      color: isGolden ? '#ffd066' : (worldConfig.palette[index % worldConfig.palette.length] ?? profile.color),
      golden: isGolden,
      position: [x, y, z],
      anchor: [x, y, z],
      wanderRadius: 1.8 + (index % 3) * 0.4,
      phase: (index * 0.73) % (Math.PI * 2),
      speed: 0.4 + ((index * 0.31) % 0.5),
      points: isGolden ? 500 : 100
    };
  });
}
