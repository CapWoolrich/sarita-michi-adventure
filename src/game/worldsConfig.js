import { getMissionCopy } from './missions/missionTypes';

const WORLD_NAMES = [
  'Bosque Místico','Ciudad Sakura','Lago Cristal','Arboleda de Niebla','Puerto Pastel',
  'Valle de las Nubes','Jardín Lunar','Playa Algodón','Montaña Aurora','Villa Estelar'
];

const baseLevels = [
  { id: 'nivel-1', catCount: 6, timeLimit: 90, targetScore: 500 },
  { id: 'nivel-2', catCount: 7, timeLimit: 75, targetScore: 700 },
  { id: 'nivel-3', catCount: 8, timeLimit: 70, targetScore: 900 }
];

const missionConfig = {
  rescue: {},
  golden: { forceGoldenCat: true, objectives: { requiredCats: 1, requiresGoldenCat: true }, modifiers: { goldenRequired: true, goldenMood: true } },
  time_attack: { catCount: 5, timeLimit: 55, objectives: { requiredCats: 5 }, modifiers: { urgentTimer: true } },
  exploration: { objectives: { requiredCats: 5, requiredBells: 3 }, modifiers: { bellsBeforeCapture: true } },
  careful: { modifiers: { enemyBonus: 1, damageMatters: true } },
  fog: { modifiers: { radarRange: 14, extraFog: true } },
  slow_zone: { modifiers: { slowZones: true } },
  city_hide: { modifiers: { cityProps: true, nearestHint: true } },
  city_quest: { catCount: 5, timeLimit: 160, targetScore: 700, objectives: { questHouses: 2, questItems: 2 }, modifiers: { cityProps: true, cityQuest: true } },
  vehicle_dash: { catCount: 4, timeLimit: 80, targetScore: 700, objectives: { checkpoints: 3 }, modifiers: { vehicleDash: true } },
  mountain_jump: { modifiers: { platforms: true } },
  escape: { catCount: 12, timeLimit: 60, targetScore: 900, objectives: { escapeSeconds: 45, exitPortal: true }, modifiers: { escapeMode: true, exitPortal: true, enemyBonus: 2, chaseCats: true, extraFog: true, zombieMode: true } },
  finale: { catCount: 10, timeLimit: 110, targetScore: 1400, forceGoldenCat: true, objectives: { requiredCats: 10, requiresGoldenCat: true }, modifiers: { finale: true, enemyBonus: 1, celebration: true, goldenMood: true } }
};

function makeLevel(index, missionType) {
  const base = baseLevels[index] ?? baseLevels[0];
  const copy = getMissionCopy(missionType);
  const extra = missionConfig[missionType] ?? {};
  const level = { ...base, ...extra, id: base.id, missionType, missionTitle: copy.title, missionDescription: copy.description };
  level.objectives = { requiredCats: level.catCount, ...(extra.objectives ?? {}) };
  level.modifiers = { ...(extra.modifiers ?? {}) };
  return level;
}

const levels = (pattern) => pattern.slice(0, 3).map((missionType, index) => makeLevel(index, missionType));

export const WORLDS = [
  { id:'world-1', order:1, name:WORLD_NAMES[0], theme:'mystic-forest', palette:['#d7f5bf','#fef5c5','#c6ebdb'], skyType:'day', terrain:'forest-path', thumbnail:'linear-gradient(135deg,#9fd67f,#f7e9a2)', levels:levels(['rescue','escape','exploration']) },
  { id:'world-2', order:2, name:WORLD_NAMES[1], theme:'sakura-city', palette:['#ffd3e8','#f0ddff','#ffe8c7'], skyType:'pink-day', terrain:'city', thumbnail:'linear-gradient(135deg,#ffb4d6,#d6c1ff)', levels:levels(['city_quest','escape','careful']) },
  { id:'world-3', order:3, name:WORLD_NAMES[2], theme:'crystal-lake', palette:['#bde7ff','#d8f4ff','#b8d5ff'], skyType:'clear', terrain:'lake', thumbnail:'linear-gradient(135deg,#91d5ff,#8aa8ff)', levels:levels(['slow_zone','escape','time_attack']) },
  { id:'world-4', order:4, name:WORLD_NAMES[3], theme:'mist-grove', palette:['#c9d7c6','#e4ece5','#aac0b1'], skyType:'mist', terrain:'grove', thumbnail:'linear-gradient(135deg,#90a794,#cad7c5)', levels:levels(['fog','escape','exploration']) },
  { id:'world-5', order:5, name:WORLD_NAMES[4], theme:'pastel-port', palette:['#ffd8bf','#cbe7ff','#ffe9f2'], skyType:'sunset', terrain:'port', thumbnail:'linear-gradient(135deg,#ffc9a2,#9fd8ff)', levels:levels(['city_hide','escape','time_attack']) },
  { id:'world-6', order:6, name:WORLD_NAMES[5], theme:'cloud-valley', palette:['#d8ecff','#fbe8ff','#cfe0ff'], skyType:'airy', terrain:'cloudy', thumbnail:'linear-gradient(135deg,#b8d6ff,#f4d4ff)', levels:levels(['mountain_jump','escape','golden']) },
  { id:'world-7', order:7, name:WORLD_NAMES[6], theme:'moon-garden', palette:['#8390d8','#4b538f','#b2a5ff'], skyType:'night', terrain:'lantern-garden', thumbnail:'linear-gradient(135deg,#5660ab,#8e7adb)', levels:levels(['fog','careful','escape']) },
  { id:'world-8', order:8, name:WORLD_NAMES[7], theme:'cotton-beach', palette:['#ffe6c6','#bceeff','#ffdaef'], skyType:'beach', terrain:'sand', thumbnail:'linear-gradient(135deg,#ffd9aa,#8de8ff)', levels:levels(['slow_zone','escape','time_attack']) },
  { id:'world-9', order:9, name:WORLD_NAMES[8], theme:'aurora-mountain', palette:['#87a4d5','#5b72a3','#7ed9c2'], skyType:'aurora', terrain:'mountain', thumbnail:'linear-gradient(135deg,#5d7ec2,#6ed6ba)', levels:levels(['mountain_jump','escape','time_attack']) },
  { id:'world-10', order:10, name:WORLD_NAMES[9], theme:'stellar-village', palette:['#ffddb8','#8a78d4','#2f2d67'], skyType:'starry', terrain:'village-night', thumbnail:'linear-gradient(135deg,#ffca9a,#7361d6)', levels:levels(['vehicle_dash','escape','finale']) },
  { id:'world-11', order:11, name:'Ciudad Neón', theme:'neon-city', palette:['#ff66cc','#7c4dff','#00d4ff','#ffd066'], skyType:'neon-night', terrain:'city-neon', thumbnail:'linear-gradient(135deg,#7c4dff,#ff66cc,#00d4ff)', secret:true, levels:levels(['city_hide','escape','finale']) }
];

export const getWorldById = (worldId) => WORLDS.find((w) => w.id === worldId) ?? null;
export const getLevelConfig = (worldId, levelId) => getWorldById(worldId)?.levels.find((l) => l.id === levelId) ?? null;
export function getNextLevel(worldId, levelId) {
  const world = getWorldById(worldId); if (!world) return null;
  const index = world.levels.findIndex((l) => l.id === levelId);
  if (index < 0) return null;
  if (index < world.levels.length - 1) return { worldId, levelId: world.levels[index + 1].id };
  const nextWorld = WORLDS.find((w) => w.order === world.order + 1);
  return nextWorld ? { worldId: nextWorld.id, levelId: nextWorld.levels[0].id } : null;
}
export const isWorldUnlocked = (worldId, unlockedWorldIds = []) => unlockedWorldIds.includes(worldId);
