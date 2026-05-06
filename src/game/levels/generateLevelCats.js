const SPAWN_POINTS = [
  [-20, 0.72, -18], [18, 0.72, -17], [22, 0.72, 8], [-16, 0.72, 19], [0, 0.72, -24],
  [8, 0.72, 22], [-24, 0.72, 4], [24, 0.72, -4], [-8, 0.72, -10], [12, 0.72, 12]
];
const CAT_PROFILES = [
  { id:'mochi', name:'Mochi', color:'#ffd6c5' }, { id:'luna', name:'Luna', color:'#c7dcff' }, { id:'kiki', name:'Kiki', color:'#ffe28d' },
  { id:'yuki', name:'Yuki', color:'#f7f7ff' }, { id:'sakura', name:'Sakura', color:'#ffc6df' }, { id:'niko', name:'Niko', color:'#c2f5db' }
];

export function generateLevelCats(worldConfig, levelConfig) {
  const count = Number(levelConfig?.catCount ?? 0);
  return Array.from({ length: count }, (_, index) => {
    const profile = CAT_PROFILES[index % CAT_PROFILES.length];
    const position = SPAWN_POINTS[index % SPAWN_POINTS.length];
    return {
      id: `${worldConfig.id}-${levelConfig.id}-${profile.id}-${index}`,
      profileId: profile.id,
      name: profile.name,
      color: worldConfig.palette[index % worldConfig.palette.length] ?? profile.color,
      position,
      points: 100
    };
  });
}
