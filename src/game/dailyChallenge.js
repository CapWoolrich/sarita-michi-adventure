/**
 * Daily challenge — cada día, un mundo + regla especial determinista.
 * Se basa en el hash del día para que sea consistente para todos los jugadores.
 */
import { WORLDS } from './worldsConfig';

const RULES = [
  { id: 'all-golden', name: 'Día Dorado', desc: 'Todos los michis son dorados', icon: '✨' },
  { id: 'half-time', name: 'Carrera contra reloj', desc: 'La mitad del tiempo', icon: '⏱️' },
  { id: 'double-cats', name: 'Avalancha michi', desc: 'El doble de michis', icon: '🐾' },
  { id: 'no-radar', name: 'A ciegas', desc: 'Sin mini-radar', icon: '🔍' },
  { id: 'fast-cats', name: 'Velocistas', desc: 'Michis 2x más rápidos', icon: '⚡' }
];

function hashDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h) + dateStr.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTodayChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  const h = hashDate(today);
  // Solo selecciona entre los mundos NO secretos
  const candidates = WORLDS.filter((w) => !w.secret);
  const world = candidates[h % candidates.length];
  const rule = RULES[h % RULES.length];
  // Recompensa
  const rewardPoints = 1000 + (h % 4) * 250;
  return { world, rule, rewardPoints, today };
}

export function isChallengeCompletedToday(settings) {
  const today = new Date().toISOString().slice(0, 10);
  return settings?.dailyChallengeCompleted === today;
}

export function markChallengeCompleted(settings) {
  const today = new Date().toISOString().slice(0, 10);
  return { ...settings, dailyChallengeCompleted: today };
}

export function applyChallengeRules(rule, levelConfig, cats) {
  const r = { catCount: levelConfig.catCount, timeLimit: levelConfig.timeLimit };
  let mods = { allGolden: false, fastCats: false, hideRadar: false };
  switch (rule.id) {
    case 'all-golden':
      mods.allGolden = true;
      break;
    case 'half-time':
      r.timeLimit = Math.max(30, Math.floor(levelConfig.timeLimit * 0.5));
      break;
    case 'double-cats':
      r.catCount = Math.min(20, levelConfig.catCount * 2);
      break;
    case 'no-radar':
      mods.hideRadar = true;
      break;
    case 'fast-cats':
      mods.fastCats = true;
      break;
    default: break;
  }
  return { ...r, ...mods };
}
