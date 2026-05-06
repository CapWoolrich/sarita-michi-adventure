import { useCallback, useEffect, useMemo, useState } from 'react';
import { WORLDS, getLevelConfig, getNextLevel, getWorldById } from './worldsConfig';
import { generateLevelCats } from './levels/generateLevelCats';
import { loadProgress, markLevelComplete, saveProgress, setCurrentWorldLevel, unlockWorld } from './progression/progressionStorage';

export default function useGameRuntime() {
  const initialProgress = loadProgress();
  const [progress, setProgress] = useState(initialProgress);
  const [worldId, setWorldId] = useState(initialProgress.currentWorldId);
  const [levelId, setLevelId] = useState(initialProgress.currentLevelId);
  const worldConfig = getWorldById(worldId) ?? WORLDS[0];
  const levelConfig = getLevelConfig(worldId, levelId) ?? worldConfig.levels[0];
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

  const totalCats = cats.length;
  const startLevel = useCallback((nextWorldId, nextLevelId) => {
    const nextWorld = getWorldById(nextWorldId) ?? WORLDS[0];
    const nextLevel = getLevelConfig(nextWorld.id, nextLevelId) ?? nextWorld.levels[0];
    setWorldId(nextWorld.id); setLevelId(nextLevel.id);
    setCats(generateLevelCats(nextWorld, nextLevel));
    setCapturedCatIds([]); setTimeLeft(nextLevel.timeLimit); setIsPaused(false); setIsLevelComplete(false);
    setNearestCatIdValue(null); setNearestCatDistance(Infinity); setLastCatchResult(null);
    setProgress((prev) => {
      const p = setCurrentWorldLevel(prev, nextWorld.id, nextLevel.id);
      saveProgress(p); return p;
    });
  }, []);

  const completeLevel = useCallback(() => {
    setIsLevelComplete(true); setIsPaused(true);
    setProgress((prev) => {
      let next = markLevelComplete(prev, worldId, levelId, score, score >= levelConfig.targetScore ? 3 : score >= levelConfig.targetScore * 0.75 ? 2 : 1);
      const unlockCandidate = WORLDS.find((w) => w.order === worldConfig.order + 1);
      if (unlockCandidate) next = unlockWorld(next, unlockCandidate.id);
      saveProgress(next); return next;
    });
  }, [levelId, levelConfig.targetScore, score, worldConfig.order, worldId]);

  const captureCat = useCallback((catId) => {
    if (!catId || !cats.some((c) => c.id === catId)) return;
    setCapturedCatIds((prev) => {
      if (prev.includes(catId)) return prev;
      const next = [...prev, catId];
      setScore((s) => s + (cats.find((c) => c.id === catId)?.points ?? 100));
      setLastCatchResult({ success: true, catId });
      if (next.length >= cats.length && cats.length > 0) completeLevel();
      return next;
    });
  }, [cats, completeLevel]);

  /**
   * Auto-avance: al completar un nivel, salta al SIGUIENTE MUNDO (nivel 1).
   * Esto efectivamente convierte cada mundo en un solo nivel "tour".
   */
  const goToNextLevel = useCallback(() => {
    const currentWorld = getWorldById(worldId);
    if (!currentWorld) return;
    const nextWorld = WORLDS.find((w) => w.order === currentWorld.order + 1);
    if (!nextWorld) return;
    // Auto-desbloquea el siguiente mundo si llegamos por avance natural
    setProgress((prev) => {
      if (prev.unlockedWorldIds.includes(nextWorld.id)) return prev;
      const updated = unlockWorld(prev, nextWorld.id);
      saveProgress(updated);
      return updated;
    });
    startLevel(nextWorld.id, nextWorld.levels[0].id);
  }, [startLevel, worldId]);

  const goToWorld = useCallback((nextWorldId) => {
    if (!progress.unlockedWorldIds.includes(nextWorldId)) return;
    const saved = progress.levels;
    const world = getWorldById(nextWorldId);
    const recent = world.levels.findLast((l) => saved[`${nextWorldId}:${l.id}`]?.completed) ?? world.levels[0];
    startLevel(nextWorldId, recent.id);
  }, [progress.levels, progress.unlockedWorldIds, startLevel]);

  const setNearestCat = useCallback(({ catId = null, distance = Infinity }) => { setNearestCatIdValue(catId); setNearestCatDistance(distance); }, []);
  const toggleSpeedMode = useCallback(() => setSpeedMode((m) => (m === 'normal' ? 'fast' : 'normal')), []);

  useEffect(() => { if (isPaused || isLevelComplete) return; const t = setInterval(() => setTimeLeft((v) => (v <= 1 ? 0 : v - 1)), 1000); return () => clearInterval(t); }, [isPaused, isLevelComplete]);
  useEffect(() => { if (timeLeft === 0) setIsPaused(true); }, [timeLeft]);

  return useMemo(() => ({
    worlds: WORLDS, progress, worldId, levelId, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete,
    nearestCatId, nearestCatDistance, lastCatchResult, speedMode, startLevel, captureCat, completeLevel, goToNextLevel, goToWorld, setNearestCat,
    setLastCatchResult, toggleSpeedMode, setIsPaused
  }), [progress, worldId, levelId, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, nearestCatId, nearestCatDistance, lastCatchResult, speedMode, startLevel, captureCat, completeLevel, goToNextLevel, goToWorld, setNearestCat, toggleSpeedMode]);
}
