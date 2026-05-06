import { useCallback, useEffect, useMemo, useState } from 'react';
import { LEVELS, generateLevelCats } from './levels';

export default function useGameRuntime() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelConfig, setLevelConfig] = useState(LEVELS[0]);
  const [cats, setCats] = useState(() => generateLevelCats(LEVELS[0]));
  const [capturedCatIds, setCapturedCatIds] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [nearestCatId, setNearestCatIdValue] = useState(null);
  const [nearestCatDistance, setNearestCatDistance] = useState(Infinity);
  const [lastCatchResult, setLastCatchResult] = useState(null);
  const [speedMode, setSpeedMode] = useState('normal');

  const totalCats = cats.length;
  const startLevel = useCallback((levelIndex) => {
    const resolved = ((levelIndex % LEVELS.length) + LEVELS.length) % LEVELS.length;
    const nextLevel = LEVELS[resolved];
    const nextCats = generateLevelCats(nextLevel);
    setCurrentLevelIndex(resolved); setLevelConfig(nextLevel); setCats(nextCats);
    setCapturedCatIds([]); setTimeLeft(nextLevel.timeLimit); setIsPaused(false); setIsLevelComplete(false);
    setNearestCatIdValue(null); setNearestCatDistance(Infinity); setLastCatchResult(null);
  }, []);

  const completeLevel = useCallback(() => { setIsLevelComplete(true); setIsPaused(true); }, []);
  const captureCat = useCallback((catId) => {
    if (!catId) return;
    if (!cats.some((c) => c.id === catId)) return;
    setCapturedCatIds((prev) => {
      if (prev.includes(catId)) return prev;
      const next = [...prev, catId];
      const points = cats.find((c) => c.id === catId)?.points ?? 100;
      setScore((s) => s + points);
      setLastCatchResult({ success: true, catId });
      if (next.length >= cats.length && cats.length > 0) completeLevel();
      return next;
    });
  }, [cats, completeLevel]);
  const goToNextLevel = useCallback(() => startLevel(currentLevelIndex + 1), [currentLevelIndex, startLevel]);
  const resetLevel = useCallback(() => startLevel(currentLevelIndex), [currentLevelIndex, startLevel]);
  const setNearestCat = useCallback(({ catId = null, distance = Infinity }) => { setNearestCatIdValue(catId); setNearestCatDistance(distance); }, []);
  const toggleSpeedMode = useCallback(() => setSpeedMode((m) => (m === 'normal' ? 'fast' : 'normal')), []);

  useEffect(() => {
    if (isPaused || isLevelComplete) return;
    const t = setInterval(() => setTimeLeft((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => clearInterval(t);
  }, [isPaused, isLevelComplete]);

  useEffect(() => { if (timeLeft === 0) setIsPaused(true); }, [timeLeft]);

  return useMemo(() => ({
    currentLevelIndex, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete,
    nearestCatId, nearestCatDistance, lastCatchResult, speedMode,
    startLevel, captureCat, completeLevel, goToNextLevel, resetLevel, setNearestCat,
    setLastCatchResult, toggleSpeedMode, setIsPaused
  }), [currentLevelIndex, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, nearestCatId, nearestCatDistance, lastCatchResult, speedMode, startLevel, captureCat, completeLevel, goToNextLevel, resetLevel, setNearestCat, toggleSpeedMode]);
}
