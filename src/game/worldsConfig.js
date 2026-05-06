const WORLD_NAMES = [
  'Bosque Místico','Ciudad Sakura','Lago Cristal','Arboleda de Niebla','Puerto Pastel',
  'Valle de las Nubes','Jardín Lunar','Playa Algodón','Montaña Aurora','Villa Estelar'
];

const baseLevels = [
  { id: 'nivel-1', catCount: 6, timeLimit: 95, targetScore: 500 },
  { id: 'nivel-2', catCount: 7, timeLimit: 90, targetScore: 650 },
  { id: 'nivel-3', catCount: 8, timeLimit: 88, targetScore: 800 },
  { id: 'nivel-4', catCount: 9, timeLimit: 85, targetScore: 900 },
  { id: 'nivel-5', catCount: 10, timeLimit: 82, targetScore: 1000 }
];

export const WORLDS = [
  { id:'world-1', order:1, name:WORLD_NAMES[0], theme:'mystic-forest', palette:['#d7f5bf','#fef5c5','#c6ebdb'], skyType:'day', terrain:'forest-path', thumbnail:'linear-gradient(135deg,#9fd67f,#f7e9a2)', levels:baseLevels },
  { id:'world-2', order:2, name:WORLD_NAMES[1], theme:'sakura-city', palette:['#ffd3e8','#f0ddff','#ffe8c7'], skyType:'pink-day', terrain:'city', thumbnail:'linear-gradient(135deg,#ffb4d6,#d6c1ff)', levels:baseLevels.map((l,i)=>({ ...l, catCount:l.catCount+i%2 })) },
  { id:'world-3', order:3, name:WORLD_NAMES[2], theme:'crystal-lake', palette:['#bde7ff','#d8f4ff','#b8d5ff'], skyType:'clear', terrain:'lake', thumbnail:'linear-gradient(135deg,#91d5ff,#8aa8ff)', levels:baseLevels },
  { id:'world-4', order:4, name:WORLD_NAMES[3], theme:'mist-grove', palette:['#c9d7c6','#e4ece5','#aac0b1'], skyType:'mist', terrain:'grove', thumbnail:'linear-gradient(135deg,#90a794,#cad7c5)', levels:baseLevels },
  { id:'world-5', order:5, name:WORLD_NAMES[4], theme:'pastel-port', palette:['#ffd8bf','#cbe7ff','#ffe9f2'], skyType:'sunset', terrain:'port', thumbnail:'linear-gradient(135deg,#ffc9a2,#9fd8ff)', levels:baseLevels },
  { id:'world-6', order:6, name:WORLD_NAMES[5], theme:'cloud-valley', palette:['#d8ecff','#fbe8ff','#cfe0ff'], skyType:'airy', terrain:'cloudy', thumbnail:'linear-gradient(135deg,#b8d6ff,#f4d4ff)', levels:baseLevels },
  { id:'world-7', order:7, name:WORLD_NAMES[6], theme:'moon-garden', palette:['#8390d8','#4b538f','#b2a5ff'], skyType:'night', terrain:'lantern-garden', thumbnail:'linear-gradient(135deg,#5660ab,#8e7adb)', levels:baseLevels.map((l)=>({ ...l, timeLimit:l.timeLimit-5 })) },
  { id:'world-8', order:8, name:WORLD_NAMES[7], theme:'cotton-beach', palette:['#ffe6c6','#bceeff','#ffdaef'], skyType:'beach', terrain:'sand', thumbnail:'linear-gradient(135deg,#ffd9aa,#8de8ff)', levels:baseLevels },
  { id:'world-9', order:9, name:WORLD_NAMES[8], theme:'aurora-mountain', palette:['#87a4d5','#5b72a3','#7ed9c2'], skyType:'aurora', terrain:'mountain', thumbnail:'linear-gradient(135deg,#5d7ec2,#6ed6ba)', levels:baseLevels.map((l)=>({ ...l, timeLimit:l.timeLimit-8 })) },
  { id:'world-10', order:10, name:WORLD_NAMES[9], theme:'stellar-village', palette:['#ffddb8','#8a78d4','#2f2d67'], skyType:'starry', terrain:'village-night', thumbnail:'linear-gradient(135deg,#ffca9a,#7361d6)', levels:baseLevels.map((l)=>({ ...l, timeLimit:l.timeLimit-10 })) }
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
