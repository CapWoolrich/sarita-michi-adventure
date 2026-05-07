/**
 * Sistema de outfits de Sarita.
 * Modo combo: por defecto auto-cambia según mundo, pero player puede
 * forzar un outfit desde el Vestidor (override manual).
 *
 * Cada outfit tiene:
 * - id, name, icon
 * - tint: color que se aplica a las prendas del modelo (vestido/gorro)
 * - hatColor / dressColor opcional para fine control
 * - unlock: criterio (achievementId, totalCats, freeFromStart)
 */
export const OUTFITS = [
  { id: 'default',  name: 'Sarita',          icon: '👧', dressColor: '#c084fc', hatColor: '#ec4899', unlock: 'free' },
  { id: 'sakura',   name: 'Kimono Sakura',   icon: '🌸', dressColor: '#ff9bc8', hatColor: '#ff6ba6', unlock: 'free' },
  { id: 'beach',    name: 'Traje Playa',     icon: '🌊', dressColor: '#a8e0ff', hatColor: '#ffd87a', unlock: 'free' },
  { id: 'aurora',   name: 'Abrigo Aurora',   icon: '❄️', dressColor: '#7affd1', hatColor: '#cfe7ff', unlock: 'free' },
  { id: 'neon',     name: 'Cyber Sarita',    icon: '⚡', dressColor: '#7c4dff', hatColor: '#ff66cc', unlock: 'achievement:secret-city' },
  { id: 'lunar',    name: 'Princesa Lunar',  icon: '🌙', dressColor: '#a8c8ff', hatColor: '#d4b6ff', unlock: 'achievement:all-night' },
  { id: 'forest',   name: 'Hada del Bosque', icon: '🍃', dressColor: '#7ac985', hatColor: '#ffd066', unlock: 'achievement:all-day' },
  { id: 'kitty',    name: 'Disfraz Michi',   icon: '🐱', dressColor: '#ffd6c5', hatColor: '#ff8eb8', hasEars: true, unlock: 'achievement:collector-50' },
  { id: 'royal',    name: 'Reina Kawaii',    icon: '👑', dressColor: '#ffe079', hatColor: '#c084fc', unlock: 'achievement:master' }
];

// Mapeo automático: bioma → outfit
export const BIOME_OUTFITS = {
  'mystic-forest': 'forest',
  'sakura-city': 'sakura',
  'crystal-lake': 'default',
  'mist-grove': 'default',
  'pastel-port': 'beach',
  'cloud-valley': 'default',
  'moon-garden': 'lunar',
  'cotton-beach': 'beach',
  'aurora-mountain': 'aurora',
  'stellar-village': 'lunar',
  'neon-city': 'neon'
};

export function getOutfitById(id) {
  return OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];
}

export function isOutfitUnlocked(outfit, achievements, totalCats = 0) {
  if (!outfit?.unlock || outfit.unlock === 'free') return true;
  if (outfit.unlock.startsWith('achievement:')) {
    const id = outfit.unlock.split(':')[1];
    return !!achievements?.unlocked?.[id];
  }
  if (outfit.unlock.startsWith('totalCats:')) {
    const n = parseInt(outfit.unlock.split(':')[1], 10);
    return totalCats >= n;
  }
  return false;
}

/**
 * Resolver outfit activo:
 * - Si user override: ese outfit (si está desbloqueado)
 * - Sino: outfit auto-asignado por bioma actual
 */
export function resolveActiveOutfit(settings, biomeTheme, achievements) {
  const totalCats = achievements?.totalCaught ?? 0;
  const override = settings?.outfitOverride;
  if (override && override !== 'auto') {
    const o = getOutfitById(override);
    if (isOutfitUnlocked(o, achievements, totalCats)) return o;
  }
  const autoId = BIOME_OUTFITS[biomeTheme] ?? 'default';
  return getOutfitById(autoId);
}
