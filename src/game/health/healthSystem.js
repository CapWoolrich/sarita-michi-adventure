export const DIFFICULTY_HEALTH = { easy: 5, medium: 3, hard: 2 };
export const DIFFICULTY_TIME_MULT = { easy: 1.4, medium: 1.0, hard: 0.7 };
export const DIFFICULTY_CAT_MULT = { easy: 0.85, medium: 1.0, hard: 1.2 };
export const DIFFICULTY_ENEMY_COUNT = { easy: 0, medium: 1, hard: 2 };
export const HEAL_PER_CAT = 1;
export const INVULN_AFTER_HIT_MS = 1500;
export const HIT_RADIUS = 1.6;

export function makeInitialHealth(difficulty = 'medium') {
  return { max: DIFFICULTY_HEALTH[difficulty] ?? 3, current: DIFFICULTY_HEALTH[difficulty] ?? 3, invulnUntil: 0 };
}
