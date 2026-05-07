/**
 * Modo Endless: cada "nivel endless" es un mundo random con multiplicadores
 * de dificultad incrementales.
 */
import { WORLDS } from './worldsConfig';

const KEY = 'sarita.endlessMode.v1';

export function loadEndlessState() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (!raw) return { active: false, level: 0, bestLevel: 0 };
    return JSON.parse(raw);
  } catch { return { active: false, level: 0, bestLevel: 0 }; }
}

export function saveEndlessState(s) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function getEndlessLevel(level) {
  // Mundo random determinista por nivel
  const candidates = WORLDS.filter((w) => !w.secret);
  const world = candidates[(level * 7) % candidates.length];
  // Multiplicadores incrementales
  const catMult = 1 + Math.min(2, level * 0.15);
  const timeMult = Math.max(0.4, 1 - level * 0.05);
  const baseLevel = world.levels[0];
  const adjusted = {
    ...baseLevel,
    catCount: Math.min(20, Math.round(baseLevel.catCount * catMult)),
    timeLimit: Math.max(30, Math.round(baseLevel.timeLimit * timeMult)),
    targetScore: baseLevel.targetScore + level * 100
  };
  return { world, level: adjusted, endlessLevel: level };
}
