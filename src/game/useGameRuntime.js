import { useCallback, useEffect, useMemo, useState } from 'react';
import { WORLDS, getLevelConfig, getNextLevel, getWorldById } from './worldsConfig';
import { generateLevelCats } from './levels/generateLevelCats';
import { makeInitialHealth, INVULN_AFTER_HIT_MS, HEAL_PER_CAT, DIFFICULTY_TIME_MULT, DIFFICULTY_CAT_MULT } from './health/healthSystem';
import { loadProgress, markLevelComplete, saveProgress, setCurrentWorldLevel, unlockWorld } from './progression/progressionStorage';

const tuneLevel = (level, difficulty) => {
  const cMult = DIFFICULTY_CAT_MULT[difficulty] ?? 1;
  const tMult = DIFFICULTY_TIME_MULT[difficulty] ?? 1;
  const catCount = Math.max(3, Math.round((level?.catCount ?? 6) * cMult));
  const timeLimit = Math.max(20, Math.floor((level?.timeLimit ?? 90) * tMult));
  const baseNeed = level?.objectives?.requiredCats ?? catCount;
  const requiredCats = level?.objectives?.requiresGoldenCat ? baseNeed : Math.min(catCount, Math.max(1, Math.round(baseNeed * cMult)));
  return { ...level, catCount, timeLimit, objectives: { ...(level?.objectives ?? {}), requiredCats }, modifiers: { ...(level?.modifiers ?? {}) } };
};
const initialMission = (level) => ({ activatedBellIds: [], requiredBells: level?.objectives?.requiredBells ?? 0, goldenCatCaptured: false, isGameOver: false, missionMessage: '' });

export default function useGameRuntime() {
  const initialProgress = loadProgress();
  const [difficulty, setDifficulty] = useState(() => { try { return JSON.parse(localStorage.getItem('sarita.userSettings.v1') ?? '{}').difficulty || 'medium'; } catch { return 'medium'; } });
  const [progress, setProgress] = useState(initialProgress);
  const [worldId, setWorldId] = useState(initialProgress.currentWorldId);
  const [levelId, setLevelId] = useState(initialProgress.currentLevelId);
  const worldConfig = getWorldById(worldId) ?? WORLDS[0];
  const rawLevel = getLevelConfig(worldId, levelId) ?? worldConfig.levels[0];
  const levelConfig = useMemo(() => tuneLevel(rawLevel, difficulty), [rawLevel, difficulty]);
  const [cats, setCats] = useState(() => generateLevelCats(worldConfig, levelConfig));
  const [capturedCatIds, setCapturedCatIds] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(levelConfig.timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [nearestCatId, setNearestCatIdValue] = useState(null);
  const [nearestCatDistance, setNearestCatDistance] = useState(Infinity);
  const [lastCatchResult, setLastCatchResult] = useState(null);
  const [speedMode, setSpeedMode] = useState('normal');
  const [health, setHealth] = useState(() => makeInitialHealth(difficulty));
  const [missionState, setMissionState] = useState(() => initialMission(levelConfig));
  const totalCats = cats.length;
  const currentLevelIndex = Math.max(0, worldConfig.levels.findIndex((l) => l.id === levelId));
  const isLastLevelInWorld = currentLevelIndex === worldConfig.levels.length - 1;

  const startLevel = useCallback((nextWorldId, nextLevelId) => {
    const nextWorld = getWorldById(nextWorldId) ?? WORLDS[0];
    const nextLevel = tuneLevel(getLevelConfig(nextWorld.id, nextLevelId) ?? nextWorld.levels[0], difficulty);
    setWorldId(nextWorld.id); setLevelId(nextLevel.id); setCats(generateLevelCats(nextWorld, nextLevel));
    setCapturedCatIds([]); setScore(0); setTimeLeft(nextLevel.timeLimit); setIsPaused(false); setIsLevelComplete(false);
    setNearestCatIdValue(null); setNearestCatDistance(Infinity); setLastCatchResult(null); setHealth(makeInitialHealth(difficulty)); setMissionState(initialMission(nextLevel));
    setProgress((prev) => { const p = setCurrentWorldLevel(prev, nextWorld.id, nextLevel.id); saveProgress(p); return p; });
  }, [difficulty]);

  const completeLevel = useCallback((finalScore = score) => {
    setIsLevelComplete(true); setIsPaused(true);
    setProgress((prev) => {
      let next = markLevelComplete(prev, worldId, levelId, finalScore, finalScore >= levelConfig.targetScore ? 3 : finalScore >= levelConfig.targetScore * 0.75 ? 2 : 1);
      if (isLastLevelInWorld) { const unlockCandidate = WORLDS.find((w) => w.order === worldConfig.order + 1); if (unlockCandidate) next = unlockWorld(next, unlockCandidate.id); }
      saveProgress(next); return next;
    });
  }, [isLastLevelInWorld, levelId, levelConfig.targetScore, score, worldConfig.order, worldId]);

  const captureCat = useCallback((catId) => {
    if (!catId || !cats.some((c) => c.id === catId)) return { success: false, reason: 'invalid_cat' };
    if (levelConfig.missionType === 'exploration' && missionState.activatedBellIds.length < missionState.requiredBells) { setLastCatchResult({ success: false, reason: 'bells_required' }); setMissionState((s) => ({ ...s, missionMessage: 'Activa las campanitas primero' })); return { success: false, reason: 'bells_required' }; }
    const cat = cats.find((c) => c.id === catId);
    setCapturedCatIds((prev) => {
      if (prev.includes(catId)) return prev;
      const next = [...prev, catId]; const points = cat?.points ?? 100; const nextScore = score + points; const goldenCatCaptured = missionState.goldenCatCaptured || !!cat?.golden;
      setScore(nextScore); setLastCatchResult({ success: true, catId }); setMissionState((s) => ({ ...s, goldenCatCaptured, missionMessage: '' })); setHealth((h) => ({ ...h, current: Math.min(h.max, h.current + HEAL_PER_CAT) }));
      const need = levelConfig.objectives?.requiredCats ?? cats.length;
      const done = levelConfig.missionType === 'golden' ? goldenCatCaptured : levelConfig.objectives?.requiresGoldenCat ? next.length >= need && goldenCatCaptured : next.length >= need;
      if (done) completeLevel(nextScore);
      return next;
    });
    return { success: true, catId, golden: !!cat?.golden };
  }, [cats, completeLevel, levelConfig.missionType, levelConfig.objectives, missionState.activatedBellIds.length, missionState.goldenCatCaptured, missionState.requiredBells, score]);

  const takeDamage = useCallback(() => { setHealth((h) => { const now = Date.now(); if (now < h.invulnUntil) return h; const current = Math.max(0, h.current - 1); if (current === 0) { setIsPaused(true); setMissionState((s) => ({ ...s, isGameOver: true, missionMessage: 'Sin corazones' })); } return { ...h, current, invulnUntil: now + INVULN_AFTER_HIT_MS }; }); }, []);
  const goToNextLevel = useCallback(() => { const next = getNextLevel(worldId, levelId); if (!next) return; if (next.worldId !== worldId) setProgress((prev) => { if (prev.unlockedWorldIds.includes(next.worldId)) return prev; const updated = unlockWorld(prev, next.worldId); saveProgress(updated); return updated; }); startLevel(next.worldId, next.levelId); }, [levelId, startLevel, worldId]);
  const goToWorld = useCallback((nextWorldId) => { if (!progress.unlockedWorldIds.includes(nextWorldId)) return; const world = getWorldById(nextWorldId); const firstIncomplete = world.levels.find((l) => !progress.levels?.[`${nextWorldId}:${l.id}`]?.completed); startLevel(nextWorldId, (firstIncomplete ?? world.levels[0]).id); }, [progress, startLevel]);
  const restartLevel = useCallback(() => startLevel(worldId, levelId), [levelId, startLevel, worldId]);
  const activateBell = useCallback((bellId) => setMissionState((s) => { if (!bellId || s.activatedBellIds.includes(bellId)) return s; const activatedBellIds = [...s.activatedBellIds, bellId]; return { ...s, activatedBellIds, missionMessage: activatedBellIds.length >= s.requiredBells ? '¡Campanitas listas!' : 'Campanita activada' }; }), []);
  const addScore = useCallback((points = 0) => setScore((s) => s + points), []);
  const addTime = useCallback((seconds = 0) => setTimeLeft((t) => Math.max(0, Math.min(999, t + seconds))), []);
  const setNearestCat = useCallback(({ catId = null, distance = Infinity }) => { setNearestCatIdValue(catId); setNearestCatDistance(distance); }, []);
  const toggleSpeedMode = useCallback(() => setSpeedMode((m) => (m === 'normal' ? 'fast' : 'normal')), []);
  useEffect(() => { if (isPaused || isLevelComplete || missionState.isGameOver) return; const t = setInterval(() => setTimeLeft((v) => (v <= 1 ? 0 : v - 1)), 1000); return () => clearInterval(t); }, [isPaused, isLevelComplete, missionState.isGameOver]);
  useEffect(() => { if (timeLeft === 0 && !isLevelComplete) { setIsPaused(true); setMissionState((s) => ({ ...s, isGameOver: true, missionMessage: 'Se acabó el tiempo' })); } }, [isLevelComplete, timeLeft]);

  return useMemo(() => ({ worlds: WORLDS, progress, worldId, levelId, currentLevelIndex, isLastLevelInWorld, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, isGameOver: missionState.isGameOver, nearestCatId, nearestCatDistance, lastCatchResult, speedMode, health, missionState, takeDamage, difficulty, setDifficulty, startLevel, captureCat, completeLevel, restartLevel, goToNextLevel, goToWorld, setNearestCat, setLastCatchResult, activateBell, addScore, addTime, toggleSpeedMode, setIsPaused }), [progress, worldId, levelId, currentLevelIndex, isLastLevelInWorld, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, missionState, nearestCatId, nearestCatDistance, lastCatchResult, speedMode, health, takeDamage, difficulty, startLevel, captureCat, completeLevel, restartLevel, goToNextLevel, goToWorld, setNearestCat, activateBell, addScore, addTime, toggleSpeedMode]);
}
