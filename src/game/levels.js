export const LEVELS = [
  {
    id: 'meadow',
    name: 'Pradera Encantada',
    worldName: 'Claro de los Pétalos',
    timeLimit: 95,
    catCount: 4,
    theme: { sky: '#d8f2ff', fog: '#e9f9ff', ground: '#b9e8b1' },
    catProfiles: [
      { id: 'mochi', name: 'Mochi', personality: 'Dulce y dormilón', phrase: 'Ama las flores mágicas', color: '#ffd6c5' },
      { id: 'luna', name: 'Luna', personality: 'Curiosa y brillante', phrase: 'Sigue las luciérnagas', color: '#c7dcff' },
      { id: 'kiki', name: 'Kiki', personality: 'Juguetona y feliz', phrase: 'Salta entre senderos', color: '#ffe28d' },
      { id: 'yuki', name: 'Yuki', personality: 'Suave y tranquila', phrase: 'Descansa junto al lago', color: '#f7f7ff' }
    ]
  },
  {
    id: 'forest',
    name: 'Bosque Místico',
    worldName: 'Arboleda de Niebla',
    timeLimit: 90,
    catCount: 6,
    theme: { sky: '#c9f0e5', fog: '#dcf8ef', ground: '#9ed6a4' },
    catProfiles: [
      { id: 'sakura', name: 'Sakura', personality: 'Cariñosa y elegante', phrase: 'Colecciona pétalos', color: '#ffc6df' },
      { id: 'niko', name: 'Niko', personality: 'Valiente y veloz', phrase: 'Explora troncos secretos', color: '#c2f5db' },
      { id: 'tofu', name: 'Tofu', personality: 'Calmado y tierno', phrase: 'Busca honguitos brillantes', color: '#e3e8ef' },
      { id: 'chispa', name: 'Chispa', personality: 'Traviesa y luminosa', phrase: 'Deja huellas doradas', color: '#ffbd93' }
    ]
  }
];

const SPAWN_POINTS = [
  [-20, 0.7, -18], [18, 0.7, -17], [22, 0.7, 8], [-16, 0.7, 19],
  [0, 0.7, -24], [8, 0.7, 22], [-24, 0.7, 4], [24, 0.7, -4],
  [-8, 0.7, -10], [12, 0.7, 12]
];

export function generateLevelCats(levelConfig) {
  return Array.from({ length: levelConfig.catCount }, (_, index) => {
    const profile = levelConfig.catProfiles[index % levelConfig.catProfiles.length];
    return {
      id: `${levelConfig.id}-${profile.id}-${index}`,
      profileId: profile.id,
      name: profile.name,
      personality: profile.personality,
      phrase: profile.phrase,
      color: profile.color,
      position: SPAWN_POINTS[index % SPAWN_POINTS.length],
      points: 100
    };
  });
}
