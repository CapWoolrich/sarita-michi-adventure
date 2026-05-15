import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
const makeBellSet = (worldId, levelId, count = 0) => Array.from({ length: count }, (_, i) => {
  const base = Array.from(`${worldId}-${levelId}`).reduce((sum, char, idx) => sum + char.charCodeAt(0) * (idx + 11), 0);
  const angle = (i / Math.max(1, count)) * Math.PI * 2 + (base % 9) * 0.09;
  const radius = 18 + ((base + i * 23) % 36);
  return { id: `${worldId}-${levelId}-bell-${i + 1}`, position: [Math.cos(angle) * radius, 1.05, Math.sin(angle) * radius] };
});

const COMBO_WINDOW_MS = 4500;
const COMBO_BONUS_STEP = 0.15;
const MAX_COMBO_MULTIPLIER = 2;
const COMBO_HEAL_BONUS = 0.25;
const EMPTY_COMBO = { count: 0, lastCaptureAt: 0, expiresAt: 0 };

const getComboReward = (basePoints, comboState, now = Date.now()) => {
  const isChain = comboState.lastCaptureAt > 0 && now - comboState.lastCaptureAt <= COMBO_WINDOW_MS;
  const comboCount = isChain ? comboState.count + 1 : 1;
  const multiplier = Math.min(MAX_COMBO_MULTIPLIER, 1 + Math.max(0, comboCount - 1) * COMBO_BONUS_STEP);
  return {
    comboCount,
    comboMultiplier: multiplier,
    pointsAwarded: Math.round(basePoints * multiplier),
    healBonus: comboCount > 1 && comboCount % 3 === 0 ? COMBO_HEAL_BONUS : 0,
    expiresAt: now + COMBO_WINDOW_MS
  };
};

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
  const [comboCount, setComboCount] = useState(0);
  const [comboExpiresAt, setComboExpiresAt] = useState(0);
  const comboStateRef = useRef(EMPTY_COMBO);
  const [speedMode, setSpeedMode] = useState('normal');
  const [health, setHealth] = useState(() => makeInitialHealth(difficulty));
  const [missionState, setMissionState] = useState(() => initialMission(levelConfig));
  const totalCats = cats.length;
  const currentLevelIndex = Math.max(0, worldConfig.levels.findIndex((l) => l.id === levelId));
  const isLastLevelInWorld = currentLevelIndex === worldConfig.levels.length - 1;
  const bells = useMemo(() => levelConfig.missionType === 'exploration' ? makeBellSet(worldId, levelId, levelConfig.objectives?.requiredBells ?? 0) : [], [levelConfig.missionType, levelConfig.objectives?.requiredBells, levelId, worldId]);

  const startLevel = useCallback((nextWorldId, nextLevelId) => {
    const nextWorld = getWorldById(nextWorldId) ?? WORLDS[0];
    const nextLevel = tuneLevel(getLevelConfig(nextWorld.id, nextLevelId) ?? nextWorld.levels[0], difficulty);
    setWorldId(nextWorld.id); setLevelId(nextLevel.id); setCats(generateLevelCats(nextWorld, nextLevel));
    setCapturedCatIds([]); setScore(0); setTimeLeft(nextLevel.timeLimit); setIsPaused(false); setIsLevelComplete(false);
    comboStateRef.current = EMPTY_COMBO; setComboCount(0); setComboExpiresAt(0);
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
    if (capturedCatIds.includes(catId)) return { success: false, reason: 'already_captured' };
    if (levelConfig.missionType === 'exploration' && missionState.activatedBellIds.length < missionState.requiredBells) { setLastCatchResult({ success: false, reason: 'bells_required' }); setMissionState((s) => ({ ...s, missionMessage: 'Activa las campanitas primero' })); return { success: false, reason: 'bells_required' }; }
    const cat = cats.find((c) => c.id === catId);
    const basePoints = cat?.points ?? 100;
    const comboReward = getComboReward(basePoints, comboStateRef.current);
    comboStateRef.current = { count: comboReward.comboCount, lastCaptureAt: Date.now(), expiresAt: comboReward.expiresAt };
    setComboCount(comboReward.comboCount);
    setComboExpiresAt(comboReward.expiresAt);
    setCapturedCatIds((prev) => {
      if (prev.includes(catId)) return prev;
      const next = [...prev, catId]; const nextScore = score + comboReward.pointsAwarded; const goldenCatCaptured = missionState.goldenCatCaptured || !!cat?.golden;
      setScore(nextScore); setLastCatchResult({ success: true, catId, golden: !!cat?.golden, ...comboReward }); setMissionState((s) => ({ ...s, goldenCatCaptured, missionMessage: '' })); setHealth((h) => ({ ...h, current: Math.min(h.max, h.current + HEAL_PER_CAT + comboReward.healBonus) }));
      const need = levelConfig.objectives?.requiredCats ?? cats.length;
      const done = levelConfig.missionType === 'golden' ? goldenCatCaptured : levelConfig.objectives?.requiresGoldenCat ? next.length >= need && goldenCatCaptured : next.length >= need;
      if (done) completeLevel(nextScore);
      return next;
    });
    return { success: true, catId, golden: !!cat?.golden, ...comboReward };
  }, [capturedCatIds, cats, completeLevel, levelConfig.missionType, levelConfig.objectives, missionState.activatedBellIds.length, missionState.goldenCatCaptured, missionState.requiredBells, score]);

  const takeDamage = useCallback(() => { setHealth((h) => { const now = Date.now(); if (now < h.invulnUntil) return h; const current = Math.max(0, h.current - 1); if (current === 0) { setIsPaused(true); setMissionState((s) => ({ ...s, isGameOver: true, missionMessage: 'Sin corazones' })); } return { ...h, current, invulnUntil: now + INVULN_AFTER_HIT_MS }; }); }, []);
  const goToNextLevel = useCallback(() => { const next = getNextLevel(worldId, levelId); if (!next) return; if (next.worldId !== worldId) setProgress((prev) => { if (prev.unlockedWorldIds.includes(next.worldId)) return prev; const updated = unlockWorld(prev, next.worldId); saveProgress(updated); return updated; }); startLevel(next.worldId, next.levelId); }, [levelId, startLevel, worldId]);
  const goToWorld = useCallback((nextWorldId) => { if (!progress.unlockedWorldIds.includes(nextWorldId)) return; const world = getWorldById(nextWorldId); const firstIncomplete = world.levels.find((l) => !progress.levels?.[`${nextWorldId}:${l.id}`]?.completed); startLevel(nextWorldId, (firstIncomplete ?? world.levels[0]).id); }, [progress, startLevel]);
  const restartLevel = useCallback(() => startLevel(worldId, levelId), [levelId, startLevel, worldId]);
  const activateBell = useCallback((bellId) => setMissionState((s) => { if (!bellId || s.activatedBellIds.includes(bellId)) return s; const activatedBellIds = [...s.activatedBellIds, bellId]; return { ...s, activatedBellIds, missionMessage: activatedBellIds.length >= s.requiredBells ? '¡Campanitas listas!' : 'Campanita activada' }; }), []);
  const addScore = useCallback((points = 0) => setScore((s) => s + points), []);
  const addTime = useCallback((seconds = 0) => setTimeLeft((t) => Math.max(0, Math.min(999, t + seconds))), []);
  const setNearestCat = useCallback(({ catId = null, distance = Infinity }) => { setNearestCatIdValue(catId); setNearestCatDistance(distance); }, []);
  const toggleSpeedMode = useCallback(() => setSpeedMode((m) => (m === 'normal' ? 'fast' : 'normal')), []);
  useEffect(() => {
    if (!comboExpiresAt) return undefined;
    const delay = Math.max(0, comboExpiresAt - Date.now()) + 40;
    const timeout = setTimeout(() => {
      if (comboStateRef.current.expiresAt <= Date.now()) {
        comboStateRef.current = EMPTY_COMBO;
        setComboCount(0);
        setComboExpiresAt(0);
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [comboExpiresAt]);
  useEffect(() => { if (isPaused || isLevelComplete || missionState.isGameOver) return; const t = setInterval(() => setTimeLeft((v) => (v <= 1 ? 0 : v - 1)), 1000); return () => clearInterval(t); }, [isPaused, isLevelComplete, missionState.isGameOver]);
  useEffect(() => { if (timeLeft === 0 && !isLevelComplete) { setIsPaused(true); setMissionState((s) => ({ ...s, isGameOver: true, missionMessage: 'Se acabó el tiempo' })); } }, [isLevelComplete, timeLeft]);

  return useMemo(() => ({ worlds: WORLDS, progress, worldId, levelId, currentLevelIndex, isLastLevelInWorld, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, isGameOver: missionState.isGameOver, nearestCatId, nearestCatDistance, lastCatchResult, comboCount, comboExpiresAt, comboWindowMs: COMBO_WINDOW_MS, speedMode, health, missionState, bells, takeDamage, difficulty, setDifficulty, startLevel, captureCat, completeLevel, restartLevel, goToNextLevel, goToWorld, setNearestCat, setLastCatchResult, activateBell, addScore, addTime, toggleSpeedMode, setIsPaused }), [progress, worldId, levelId, currentLevelIndex, isLastLevelInWorld, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, missionState, bells, nearestCatId, nearestCatDistance, lastCatchResult, comboCount, comboExpiresAt, speedMode, health, takeDamage, difficulty, startLevel, captureCat, completeLevel, restartLevel, goToNextLevel, goToWorld, setNearestCat, activateBell, addScore, addTime, toggleSpeedMode]);
}
