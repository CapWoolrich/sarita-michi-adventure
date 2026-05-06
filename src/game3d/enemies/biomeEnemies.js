/**
 * Cada mundo tiene un peligro ÚNICO con identidad propia.
 */
export const BIOME_ENEMIES = {
  'mystic-forest':  { type: 'wolf',      color: '#3a2a1a', speed: 1.3, name: 'Lobo del bosque' },
  'sakura-city':    { type: 'fox',       color: '#e87a3a', speed: 1.2, name: 'Zorro travieso' },
  'crystal-lake':   { type: 'crocodile', color: '#3a7a4a', speed: 1.1, name: 'Cocodrilo del lago' },
  'mist-grove':     { type: 'ghost',     color: '#9bbfb0', speed: 1.0, name: 'Espíritu de la niebla' },
  'pastel-port':    { type: 'shark',     color: '#5a7a9c', speed: 1.5, name: 'Tiburón del puerto' },
  'cloud-valley':   { type: 'dragon',    color: '#a8c8ff', speed: 1.3, name: 'Dragón de las nubes' },
  'moon-garden':    { type: 'bat',       color: '#3a2a5a', speed: 1.4, name: 'Murciélago lunar' },
  'cotton-beach':   { type: 'crab',      color: '#ff8eb8', speed: 1.0, name: 'Cangrejo gigante' },
  'aurora-mountain':{ type: 'yeti',      color: '#e8eef4', speed: 1.2, name: 'Yeti de las montañas' },
  'stellar-village':{ type: 'alien',     color: '#7ce88a', speed: 1.5, name: 'Alien intergaláctico' },
  'neon-city':      { type: 'cyberbot',  color: '#7c4dff', speed: 1.6, name: 'CyberBot vigilante' }
};

export function getEnemyConfig(biome) {
  return BIOME_ENEMIES[biome] ?? null;
}
