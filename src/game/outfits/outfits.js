/**
 * Sistema de outfits de Sarita.
 * Se desbloquea un outfit nuevo cada 3 niveles completados.
 */
export const OUTFITS = [
  { id: 'default',  name: 'Sarita Base',        icon: '👧', dressColor: '#c084fc', hatColor: '#ec4899', unlock: 'levels:0' },
  { id: 'sakura',   name: 'Kimono Sakura',      icon: '🌸', dressColor: '#ff9bc8', hatColor: '#ff6ba6', unlock: 'levels:3' },
  { id: 'beach',    name: 'Traje Playa',        icon: '🌊', dressColor: '#a8e0ff', hatColor: '#ffd87a', unlock: 'levels:6' },
  { id: 'forest',   name: 'Hada del Bosque',    icon: '🍃', dressColor: '#7ac985', hatColor: '#ffd066', unlock: 'levels:9' },
  { id: 'lunar',    name: 'Princesa Lunar',     icon: '🌙', dressColor: '#a8c8ff', hatColor: '#d4b6ff', unlock: 'levels:12' },
  { id: 'aurora',   name: 'Abrigo Aurora',      icon: '❄️', dressColor: '#7affd1', hatColor: '#cfe7ff', unlock: 'levels:15' },
  { id: 'kitty',    name: 'Disfraz Michi',      icon: '🐱', dressColor: '#ffd6c5', hatColor: '#ff8eb8', hasEars: true, unlock: 'levels:18' },
  { id: 'royal',    name: 'Reina Kawaii',       icon: '👑', dressColor: '#ffe079', hatColor: '#c084fc', unlock: 'levels:21' },
  { id: 'neon',     name: 'Cyber Sarita',       icon: '⚡', dressColor: '#7c4dff', hatColor: '#ff66cc', unlock: 'levels:24' },
  { id: 'shadow',   name: 'Guardiana Niebla',   icon: '🖤', dressColor: '#3b2f6a', hatColor: '#ff5f93', unlock: 'levels:27' }
];

export const BIOME_OUTFITS = {
  'mystic-forest': 'forest',
  'sakura-city': 'sakura',
  'crystal-lake': 'beach',
  'mist-grove': 'shadow',
  'pastel-port': 'beach',
  'cloud-valley': 'aurora',
  'moon-garden': 'lunar',
  'cotton-beach': 'beach',
  'aurora-mountain': 'aurora',
  'stellar-village': 'royal',
  'neon-city': 'neon'
};

export function getOutfitById(id) {
  return OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];
}

export function getUnlockLevel(outfit) {
  if (!outfit?.unlock || outfit.unlock === 'free') return 0;
  if (outfit.unlock.startsWith('levels:')) return parseInt(outfit.unlock.split(':')[1], 10) || 0;
  return 999;
}

export function getCompletedLevelCount(progress) {
  return Object.values(progress?.levels ?? {}).filter((level) => level?.completed).length;
}

export function isOutfitUnlocked(outfit, achievements, totalCats = 0, completedLevels = 0) {
  if (!outfit?.unlock || outfit.unlock === 'free') return true;
  if (outfit.unlock.startsWith('levels:')) return completedLevels >= getUnlockLevel(outfit);
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

export function getNextOutfitUnlock(completedLevels = 0) {
  return OUTFITS.find((outfit) => getUnlockLevel(outfit) > completedLevels) ?? null;
}

export function getUnlockedOutfits(achievements, totalCats = 0, completedLevels = 0) {
  return OUTFITS.filter((outfit) => isOutfitUnlocked(outfit, achievements, totalCats, completedLevels));
}

export function resolveActiveOutfit(settings, biomeTheme, achievements, completedLevels = 0) {
  const totalCats = achievements?.totalCaught ?? 0;
  const override = settings?.outfitOverride;
  if (override && override !== 'auto') {
    const o = getOutfitById(override);
    if (isOutfitUnlocked(o, achievements, totalCats, completedLevels)) return o;
  }
  const autoId = BIOME_OUTFITS[biomeTheme] ?? 'default';
  const autoOutfit = getOutfitById(autoId);
  if (isOutfitUnlocked(autoOutfit, achievements, totalCats, completedLevels)) return autoOutfit;
  return OUTFITS[0];
}
