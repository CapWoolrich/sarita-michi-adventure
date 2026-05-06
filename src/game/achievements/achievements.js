/**
 * Sistema de logros con persistencia en localStorage.
 * Cada logro define: id, título, descripción, icono, condición.
 */
import { WORLDS } from '../worldsConfig';

export const ACHIEVEMENTS = [
  { id: 'first-cat', icon: '🐾', title: 'Primer rescate', desc: 'Atrapa tu primer michi', tier: 'bronze' },
  { id: 'first-world', icon: '🌳', title: 'Primer mundo', desc: 'Completa el Bosque Místico', tier: 'silver' },
  { id: 'all-day', icon: '☀️', title: 'Día completo', desc: 'Completa los 5 mundos diurnos', tier: 'silver' },
  { id: 'all-night', icon: '🌙', title: 'Noche eterna', desc: 'Completa los 4 mundos nocturnos', tier: 'silver' },
  { id: 'perfect-level', icon: '⭐', title: 'Perfeccionista', desc: 'Completa un nivel con 3 estrellas', tier: 'silver' },
  { id: 'speed-runner', icon: '⚡', title: 'Velocista', desc: 'Termina un nivel con +30s de tiempo', tier: 'gold' },
  { id: 'collector-25', icon: '🧺', title: 'Coleccionista', desc: 'Rescata 25 michis en total', tier: 'silver' },
  { id: 'collector-50', icon: '🎀', title: 'Gran rescatista', desc: 'Rescata 50 michis en total', tier: 'gold' },
  { id: 'master', icon: '👑', title: 'Maestra de michis', desc: 'Completa los 10 mundos principales', tier: 'gold' },
  { id: 'secret-city', icon: '🌃', title: 'Aventura secreta', desc: 'Desbloquea Ciudad Neón', tier: 'platinum' },
  { id: 'secret-master', icon: '💎', title: 'Leyenda kawaii', desc: 'Completa Ciudad Neón con 3 estrellas', tier: 'platinum' }
];

const KEY = 'sarita.achievements.v1';

export function loadAchievements() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (!raw) return { unlocked: {}, totalCaught: 0 };
    return { unlocked: {}, totalCaught: 0, ...JSON.parse(raw) };
  } catch { return { unlocked: {}, totalCaught: 0 }; }
}

export function saveAchievements(state) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

const DAY_THEMES = ['mystic-forest', 'sakura-city', 'crystal-lake', 'pastel-port', 'cotton-beach'];
const NIGHT_THEMES = ['mist-grove', 'moon-garden', 'aurora-mountain', 'stellar-village'];

export function evaluateAchievements({ event, state, payload, prog }) {
  const unlocked = { ...state.unlocked };
  const newly = [];
  const grant = (id) => { if (!unlocked[id]) { unlocked[id] = Date.now(); newly.push(id); } };

  if (event === 'cat-caught') {
    const total = (state.totalCaught ?? 0) + 1;
    state.totalCaught = total;
    if (total >= 1) grant('first-cat');
    if (total >= 25) grant('collector-25');
    if (total >= 50) grant('collector-50');
  }

  if (event === 'level-complete') {
    const { worldId, score, targetScore, timeLeft } = payload;
    const stars = score >= targetScore ? 3 : score >= targetScore * 0.75 ? 2 : 1;
    if (stars === 3) grant('perfect-level');
    if (timeLeft >= 30) grant('speed-runner');
    if (worldId === 'world-1') grant('first-world');
    if (worldId === 'world-11' && stars === 3) grant('secret-master');

    const completedWorldThemes = WORLDS
      .filter((w) => Object.keys(prog.levels ?? {}).some((k) => k.startsWith(`${w.id}:`) && prog.levels[k].completed))
      .map((w) => w.theme);
    if (worldId) {
      const cw = WORLDS.find((w) => w.id === worldId);
      if (cw && !completedWorldThemes.includes(cw.theme)) completedWorldThemes.push(cw.theme);
    }
    if (DAY_THEMES.every((t) => completedWorldThemes.includes(t))) grant('all-day');
    if (NIGHT_THEMES.every((t) => completedWorldThemes.includes(t))) grant('all-night');

    const mainWorlds = WORLDS.filter((w) => !w.secret);
    const allMainCompleted = mainWorlds.every((w) => completedWorldThemes.includes(w.theme));
    if (allMainCompleted) grant('master');
  }

  if (event === 'world-unlocked') {
    if (payload?.worldId === 'world-11') grant('secret-city');
  }

  return { newUnlocked: newly, newState: { ...state, unlocked } };
}

export function getAchievementById(id) { return ACHIEVEMENTS.find((a) => a.id === id); }
