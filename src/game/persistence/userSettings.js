/**
 * Settings de usuario persistentes.
 * audioVolume: 0..1 (master volume del audio Tone.js)
 * hapticsEnabled: bool
 * graphicsQuality: 'low' | 'high' (low desactiva postFX para móviles débiles)
 * tutorialSeen: bool
 * dailyStreak: { count, lastDate }
 * goldenCatsCaught: number
 */

const KEY = 'sarita.userSettings.v1';

const DEFAULTS = {
  audioVolume: 0.7,
  audioEnabled: true,
  hapticsEnabled: true,
  graphicsQuality: 'high',
  tutorialSeen: false,
  dailyStreak: { count: 0, lastDate: null },
  goldenCatsCaught: 0,
  highScores: {} // { worldId: bestScore }
};

export function loadSettings() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULTS }; }
}

export function saveSettings(s) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

/** Actualiza el daily streak — devuelve { count, isNewDay, isStreakBroken } */
export function checkDailyStreak(settings) {
  const today = new Date().toISOString().slice(0, 10);
  const last = settings.dailyStreak?.lastDate;
  if (last === today) {
    return { count: settings.dailyStreak.count, isNewDay: false, isStreakBroken: false };
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let count = settings.dailyStreak?.count ?? 0;
  let isStreakBroken = false;
  if (last === yesterday) {
    count += 1;
  } else if (last) {
    count = 1;
    isStreakBroken = true;
  } else {
    count = 1;
  }
  return { count, isNewDay: true, isStreakBroken, today };
}

export function recordHighScore(settings, worldId, score) {
  const prev = settings.highScores?.[worldId] ?? 0;
  if (score > prev) {
    return { ...settings, highScores: { ...settings.highScores, [worldId]: score } };
  }
  return settings;
}
