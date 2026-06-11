/**
 * Personajes jugables (primera versión ligera).
 * Reutilizan el mismo modelo 3D (ChibiDoll) con variaciones baratas:
 * colores de outfit/gorra y un aura opcional en el suelo.
 * Los modelos 3D propios por personaje quedan para una fase futura.
 *
 * unlock: 'free' | 'levels:N' (N niveles completados).
 */
export const CHARACTERS = [
  {
    id: 'sarita',
    name: 'Sarita',
    icon: '👧',
    description: 'La cazadora de michis original',
    dressColor: null, // usa el outfit activo del vestidor
    hatColor: null,
    aura: null,
    unlock: 'free'
  },
  {
    id: 'exploradora',
    name: 'Exploradora Kawaii',
    icon: '🧭',
    description: 'Lista para cualquier aventura',
    dressColor: '#7ac985',
    hatColor: '#ffd066',
    aura: '#aef0b2',
    unlock: 'free'
  },
  {
    id: 'guardiana-niebla',
    name: 'Guardiana Niebla',
    icon: '🌫️',
    description: 'Protectora de los mundos oscuros',
    dressColor: '#3b2f6a',
    hatColor: '#ff5f93',
    aura: '#8a7fd0',
    unlock: 'levels:9'
  },
  {
    id: 'runner-neon',
    name: 'Runner Neón',
    icon: '⚡',
    description: 'Velocidad y estilo cyber',
    dressColor: '#7c4dff',
    hatColor: '#00d4ff',
    aura: '#ff66cc',
    unlock: 'levels:15'
  },
  {
    id: 'princesa-estelar',
    name: 'Princesa Estelar',
    icon: '👑',
    description: 'Brilla como las estrellas de la villa',
    dressColor: '#ffd6a5',
    hatColor: '#c89eff',
    aura: '#ffe9b5',
    unlock: 'levels:21'
  }
];

export const getCharacterById = (id) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];

export function getCharacterUnlockLevel(character) {
  if (!character?.unlock || character.unlock === 'free') return 0;
  if (character.unlock.startsWith('levels:')) return parseInt(character.unlock.split(':')[1], 10) || 0;
  return 999;
}

export const isCharacterUnlocked = (character, completedLevels = 0) =>
  getCharacterUnlockLevel(character) <= completedLevels;

/** Personaje activo validado contra desbloqueo (fallback: Sarita). */
export function resolveActiveCharacter(settings, completedLevels = 0) {
  const selected = getCharacterById(settings?.selectedCharacterId ?? 'sarita');
  return isCharacterUnlocked(selected, completedLevels) ? selected : CHARACTERS[0];
}

/**
 * Look final del jugador (colores + aura) combinando personaje y outfit.
 * Regla: un outfit elegido a mano en el vestidor manda; si el vestidor está
 * en "auto", un personaje con colores propios define el look.
 */
export function resolvePlayerLook(settings, activeCharacter, activeOutfit) {
  const outfitIsManual = (settings?.outfitOverride ?? 'auto') !== 'auto';
  if (!outfitIsManual && activeCharacter?.dressColor) {
    return {
      dressColor: activeCharacter.dressColor,
      hatColor: activeCharacter.hatColor,
      auraColor: activeCharacter.aura ?? null
    };
  }
  return {
    dressColor: activeOutfit?.dressColor ?? null,
    hatColor: activeOutfit?.hatColor ?? null,
    auraColor: activeCharacter?.aura ?? null
  };
}
