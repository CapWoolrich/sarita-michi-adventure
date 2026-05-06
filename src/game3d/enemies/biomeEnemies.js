/** Configuración de enemigos por bioma */
export const BIOME_ENEMIES = {
  'mystic-forest':  { type: 'wolf', color: '#3a2a1a', speed: 1.3 },
  'sakura-city':    null, // sin enemigos en mundo "tutorial-ish"
  'crystal-lake':   { type: 'crab', color: '#ff7a5a', speed: 0.9 },
  'mist-grove':     { type: 'wolf', color: '#1a1a1a', speed: 1.4 },
  'pastel-port':    { type: 'crab', color: '#ff9b6f', speed: 1.0 },
  'cloud-valley':   { type: 'owl', color: '#cfd6e8', speed: 1.2 },
  'moon-garden':    { type: 'owl', color: '#3a2e6a', speed: 1.4 },
  'cotton-beach':   { type: 'crab', color: '#ff8eb8', speed: 1.0 },
  'aurora-mountain':{ type: 'wolf', color: '#5a6f82', speed: 1.5 },
  'stellar-village':{ type: 'drone', color: '#ff3a8a', speed: 1.6 },
  'neon-city':      { type: 'drone', color: '#00d4ff', speed: 1.7 }
};

export function getEnemyConfig(biome) {
  return BIOME_ENEMIES[biome] ?? null;
}
