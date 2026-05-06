import { useCallback, useEffect, useMemo, useState } from 'react';
import { WORLDS, getLevelConfig, getNextLevel, getWorldById } from './worldsConfig';
import { generateLevelCats } from './levels/generateLevelCats';
import { makeInitialHealth, INVULN_AFTER_HIT_MS, HEAL_PER_CAT, DIFFICULTY_TIME_MULT, DIFFICULTY_CAT_MULT } from './health/healthSystem';
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
  const [difficulty, setDifficulty] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sarita.userSettings.v1') ?? '{}').difficulty || 'medium'; } catch { return 'medium'; }
  });
  const [health, setHealth] = useState(() => makeInitialHealth(difficulty));

  const totalCats = cats.length;
  const startLevel = useCallback((nextWorldId, nextLevelId) => {
    const nextWorld = getWorldById(nextWorldId) ?? WORLDS[0];
    const nextLevel = getLevelConfig(nextWorld.id, nextLevelId) ?? nextWorld.levels[0];
    setWorldId(nextWorld.id); setLevelId(nextLevel.id);
    // Aplicar multiplicadores de dificultad
    const tMult = DIFFICULTY_TIME_MULT[difficulty] ?? 1;
    const cMult = DIFFICULTY_CAT_MULT[difficulty] ?? 1;
    const adjustedLevel = {
      ...nextLevel,
      timeLimit: Math.max(20, Math.floor(nextLevel.timeLimit * tMult)),
      catCount: Math.max(3, Math.round(nextLevel.catCount * cMult))
    };
    setCats(generateLevelCats(nextWorld, adjustedLevel));
    setCapturedCatIds([]); setTimeLeft(Math.max(20, Math.floor(nextLevel.timeLimit * (DIFFICULTY_TIME_MULT[difficulty] ?? 1)))); setIsPaused(false); setIsLevelComplete(false);
    setNearestCatIdValue(null); setNearestCatDistance(Infinity); setLastCatchResult(null);
    setHealth(makeInitialHealth(difficulty));
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
      // Heal por captura
      setHealth((h) => ({ ...h, current: Math.min(h.max, h.current + HEAL_PER_CAT) }));
      if (next.length >= cats.length && cats.length > 0) completeLevel();
      return next;
    });
  }, [cats, completeLevel]);

  const takeDamage = useCallback(() => {
    setHealth((h) => {
      const now = Date.now();
      if (now < h.invulnUntil) return h;
      const newCurrent = Math.max(0, h.current - 1);
      const newH = { ...h, current: newCurrent, invulnUntil: now + INVULN_AFTER_HIT_MS };
      if (newCurrent === 0) {
        // Game over -> reiniciar nivel
        setIsPaused(true);
      }
      return newH;
    });
  }, []);

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
    nearestCatId, nearestCatDistance, lastCatchResult, speedMode, health, takeDamage, difficulty, setDifficulty, startLevel, captureCat, completeLevel, goToNextLevel, goToWorld, setNearestCat,
    setLastCatchResult, toggleSpeedMode, setIsPaused
  }), [progress, worldId, levelId, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, nearestCatId, nearestCatDistance, lastCatchResult, speedMode, health, takeDamage, difficulty, setDifficulty, startLevel, captureCat, completeLevel, goToNextLevel, goToWorld, setNearestCat, toggleSpeedMode]);
}
