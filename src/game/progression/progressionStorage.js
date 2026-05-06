import { WORLDS } from '../worldsConfig';

const KEY = 'michi-premium-progress-v1';
const defaultProgress = () => ({ currentWorldId: WORLDS[0].id, currentLevelId: WORLDS[0].levels[0].id, unlockedWorldIds: [WORLDS[0].id], levels: {} });
const isValid = (p) => !!p && WORLDS.some((w) => w.id === p.currentWorldId) && WORLDS.some((w) => w.id === p.currentWorldId && w.levels.some((l) => l.id === p.currentLevelId));

export function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!isValid(parsed)) return defaultProgress();
    return { ...defaultProgress(), ...parsed };
  } catch { return defaultProgress(); }
}
export const saveProgress = (p) => localStorage.setItem(KEY, JSON.stringify(p));
export function unlockWorld(progress, worldId) {
  if (progress.unlockedWorldIds.includes(worldId)) return progress;
  return { ...progress, unlockedWorldIds: [...progress.unlockedWorldIds, worldId] };
}
export const setCurrentWorldLevel = (progress, worldId, levelId) => ({ ...progress, currentWorldId: worldId, currentLevelId: levelId });
export function markLevelComplete(progress, worldId, levelId, score = 0, stars = 0) {
  return { ...progress, levels: { ...progress.levels, [`${worldId}:${levelId}`]: { completed: true, score, stars } } };
}
export const resetProgress = () => defaultProgress();
