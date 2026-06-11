import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WORLDS, getLevelConfig, getNextLevel, getWorldById } from './worldsConfig';
import { generateLevelCats } from './levels/generateLevelCats';
import { makeInitialHealth, INVULN_AFTER_HIT_MS, HEAL_PER_CAT, DIFFICULTY_TIME_MULT, DIFFICULTY_CAT_MULT } from './health/healthSystem';
import { loadProgress, markLevelComplete, saveProgress, setCurrentWorldLevel, unlockWorld } from './progression/progressionStorage';

const tuneLevel = (level, difficulty) => {
  const isEscape = level?.missionType === 'escape';
  const cMult = DIFFICULTY_CAT_MULT[difficulty] ?? 1;
  const tMult = DIFFICULTY_TIME_MULT[difficulty] ?? 1;
  const catCount = isEscape ? (level?.catCount ?? 8) : Math.max(3, Math.round((level?.catCount ?? 6) * cMult));
  const timeLimit = isEscape ? (level?.objectives?.escapeSeconds ?? 45) : Math.max(20, Math.floor((level?.timeLimit ?? 90) * tMult));
  const baseNeed = level?.objectives?.requiredCats ?? catCount;
  const requiredCats = isEscape ? 0 : level?.objectives?.requiresGoldenCat ? baseNeed : Math.min(catCount, Math.max(1, Math.round(baseNeed * cMult)));
  return { ...level, catCount, timeLimit, objectives: { ...(level?.objectives ?? {}), requiredCats }, modifiers: { ...(level?.modifiers ?? {}) } };
};
const initialMission = (level) => ({ activatedBellIds: [], requiredBells: level?.objectives?.requiredBells ?? 0, goldenCatCaptured: false, isGameOver: false, missionMessage: '', quest: { houses: [], items: 0, phase: 'collect' }, checkpointsHit: [] });
const QUEST_MISSIONS = ['city_quest', 'vehicle_dash'];
const makeBellSet = (worldId, levelId, count = 0) => Array.from({ length: count }, (_, i) => {
  const base = Array.from(`${worldId}-${levelId}`).reduce((sum, char, idx) => sum + char.charCodeAt(0) * (idx + 11), 0);
  const angle = (i / Math.max(1, count)) * Math.PI * 2 + (base % 9) * 0.09;
  const radius = 18 + ((base + i * 23) % 36);
  return { id: `${worldId}-${levelId}-bell-${i + 1}`, position: [Math.cos(angle) * radius, 1.05, Math.sin(angle) * radius] };
});
const makeCheckpoints = (worldId, levelId, count = 3) => {
  const base = Array.from(`${worldId}-${levelId}-dash`).reduce((sum, char, idx) => sum + char.charCodeAt(0) * (idx + 9), 0);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / Math.max(1, count)) * Math.PI * 2 + (base % 11) * 0.17;
    const radius = 26 + ((base + i * 29) % 22);
    return { id: `${worldId}-${levelId}-cp-${i + 1}`, position: [Math.cos(angle) * radius, 1.4, Math.sin(angle) * radius] };
  });
};
const makeExitPortal = (worldId, levelId, missionType) => {
  if (missionType !== 'escape') return null;
  const base = Array.from(`${worldId}-${levelId}-exit`).reduce((sum, char, idx) => sum + char.charCodeAt(0) * (idx + 7), 0);
  const angle = ((base % 360) * Math.PI) / 180;
  const radius = 70;
  return { id: `${worldId}-${levelId}-portal`, position: [Math.cos(angle) * radius, 1.05, Math.sin(angle) * radius], radius: 4.4 };
};

const COMBO_WINDOW_MS = 4500;
const COMBO_BONUS_STEP = 0.15;
const MAX_COMBO_MULTIPLIER = 2;
const COMBO_HEAL_BONUS = 0.25;
const EMPTY_COMBO = { count: 0, lastCaptureAt: 0, expiresAt: 0 };
const EMPTY_POWER = { turboUntil: 0, scoreMultiplierUntil: 0, frozenUntil: 0, magnetUntil: 0 };

const getComboReward = (basePoints, comboState, powerState, now = Date.now()) => {
  const isChain = comboState.lastCaptureAt > 0 && now - comboState.lastCaptureAt <= COMBO_WINDOW_MS;
  const comboCount = isChain ? comboState.count + 1 : 1;
  const comboMultiplier = Math.min(MAX_COMBO_MULTIPLIER, 1 + Math.max(0, comboCount - 1) * COMBO_BONUS_STEP);
  const powerMultiplier = powerState.scoreMultiplierUntil > now ? 2 : 1;
  const multiplier = comboMultiplier * powerMultiplier;
  return {
    comboCount,
    comboMultiplier: multiplier,
    pointsAwarded: Math.round(basePoints * multiplier),
    healBonus: comboCount > 1 && comboCount % 3 === 0 ? COMBO_HEAL_BONUS : 0,
    expiresAt: now + COMBO_WINDOW_MS,
    powerMultiplier
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
  const [powerState, setPowerState] = useState(EMPTY_POWER);
  const powerStateRef = useRef(EMPTY_POWER);
  const [health, setHealth] = useState(() => makeInitialHealth(difficulty));
  const [missionState, setMissionState] = useState(() => initialMission(levelConfig));
  const [levelNonce, setLevelNonce] = useState(0);
  const totalCats = cats.length;
  const currentLevelIndex = Math.max(0, worldConfig.levels.findIndex((l) => l.id === levelId));
  const isLastLevelInWorld = currentLevelIndex === worldConfig.levels.length - 1;
  const bells = useMemo(() => levelConfig.missionType === 'exploration' ? makeBellSet(worldId, levelId, levelConfig.objectives?.requiredBells ?? 0) : [], [levelConfig.missionType, levelConfig.objectives?.requiredBells, levelId, worldId]);
  const exitPortal = useMemo(() => makeExitPortal(worldId, levelId, levelConfig.missionType), [levelConfig.missionType, levelId, worldId]);
  const checkpoints = useMemo(() => levelConfig.missionType === 'vehicle_dash' ? makeCheckpoints(worldId, levelId, levelConfig.objectives?.checkpoints ?? 3) : [], [levelConfig.missionType, levelConfig.objectives?.checkpoints, levelId, worldId]);
  const now = Date.now();
  const isTurboActive = powerState.turboUntil > now;
  const isMagnetActive = powerState.magnetUntil > now;
  const isClockFrozen = powerState.frozenUntil > now;
  const isScoreMultiplierActive = powerState.scoreMultiplierUntil > now;

  const syncPowerState = useCallback((next) => {
    powerStateRef.current = next;
    setPowerState(next);
  }, []);

  const activatePowerUp = useCallback((type) => {
    const now = Date.now();
    const next = { ...powerStateRef.current };
    if (type === 'star') {
      next.scoreMultiplierUntil = now + 10000;
      syncPowerState(next);
      return { type, message: '⭐ Puntos x2 por 10s' };
    }
    if (type === 'time') {
      next.frozenUntil = now + 5000;
      syncPowerState(next);
      return { type, message: '⏱ Reloj congelado 5s' };
    }
    if (type === 'shield') {
      setHealth((h) => ({ ...h, invulnUntil: Math.max(h.invulnUntil, now + 5000) }));
      return { type, message: '🛡 Escudo activado' };
    }
    if (type === 'magnet') {
      next.magnetUntil = now + 8000;
      syncPowerState(next);
      return { type, message: '🧲 Imán activado 8s' };
    }
    if (type === 'turbo') {
      next.turboUntil = now + 7000;
      syncPowerState(next);
      return { type, message: '⚡ Turbo 7s' };
    }
    return { type, message: '✨ Potenciador activado' };
  }, [syncPowerState]);

  const startLevel = useCallback((nextWorldId, nextLevelId) => {
    const nextWorld = getWorldById(nextWorldId) ?? WORLDS[0];
    const nextLevel = tuneLevel(getLevelConfig(nextWorld.id, nextLevelId) ?? nextWorld.levels[0], difficulty);
    setWorldId(nextWorld.id); setLevelId(nextLevel.id); setCats(generateLevelCats(nextWorld, nextLevel));
    setCapturedCatIds([]); setScore(0); setTimeLeft(nextLevel.timeLimit); setIsPaused(false); setIsLevelComplete(false);
    comboStateRef.current = EMPTY_COMBO; setComboCount(0); setComboExpiresAt(0); powerStateRef.current = EMPTY_POWER; setPowerState(EMPTY_POWER);
    setNearestCatIdValue(null); setNearestCatDistance(Infinity); setLastCatchResult(null); setHealth(makeInitialHealth(difficulty)); setMissionState(initialMission(nextLevel));
    setLevelNonce((n) => n + 1);
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

  const completeEscape = useCallback((source = 'portal') => {
    if (isLevelComplete || missionState.isGameOver || levelConfig.missionType !== 'escape') return;
    const bonus = source === 'portal' ? 260 : 160;
    const finalScore = score + bonus + Math.max(0, timeLeft) * 5;
    setScore(finalScore);
    setMissionState((s) => ({ ...s, missionMessage: source === 'portal' ? '¡Llegaste al portal!' : '¡Sobreviviste el escape!' }));
    completeLevel(finalScore);
  }, [completeLevel, isLevelComplete, levelConfig.missionType, missionState.isGameOver, score, timeLeft]);

  // Completa misiones tipo quest (city_quest: volver a la plaza; vehicle_dash: 3 anillos)
  const completeQuest = useCallback((source = 'quest') => {
    if (isLevelComplete || missionState.isGameOver || !QUEST_MISSIONS.includes(levelConfig.missionType)) return;
    const bonus = source === 'dash' ? 320 : 280;
    const finalScore = score + bonus + Math.max(0, timeLeft) * 5;
    setScore(finalScore);
    setMissionState((s) => ({ ...s, missionMessage: source === 'dash' ? '¡Carrera completada!' : '¡Misión de ciudad completada!' }));
    completeLevel(finalScore);
  }, [completeLevel, isLevelComplete, levelConfig.missionType, missionState.isGameOver, score, timeLeft]);

  // Progreso de city_quest: casas visitadas (dedupe por id) + tesoros encontrados
  const recordQuestEvent = useCallback((kind, id) => {
    if (levelConfig.missionType !== 'city_quest' || isLevelComplete || missionState.isGameOver) return null;
    const needHouses = levelConfig.objectives?.questHouses ?? 2;
    const needItems = levelConfig.objectives?.questItems ?? 2;
    const quest = missionState.quest ?? { houses: [], items: 0, phase: 'collect' };
    let houses = quest.houses;
    let items = quest.items;
    if (kind === 'house') {
      if (houses.includes(id)) return { houses: houses.length, items, phase: quest.phase, needHouses, needItems, duplicate: true };
      houses = [...houses, id];
    } else if (kind === 'item') {
      items += 1;
    } else {
      return null;
    }
    const phase = quest.phase === 'collect' && houses.length >= needHouses && items >= needItems ? 'return' : quest.phase;
    setMissionState((s) => ({
      ...s,
      quest: { houses, items, phase },
      missionMessage: phase === 'return' ? '¡Vuelve a la plaza!' : s.missionMessage
    }));
    return { houses: houses.length, items, phase, needHouses, needItems };
  }, [isLevelComplete, levelConfig.missionType, levelConfig.objectives, missionState]);

  // Checkpoints de vehicle_dash (dedupe por id; completa vía efecto)
  const hitCheckpoint = useCallback((cpId) => {
    if (levelConfig.missionType !== 'vehicle_dash' || isLevelComplete || missionState.isGameOver) return null;
    if ((missionState.checkpointsHit ?? []).includes(cpId)) return null;
    const count = (missionState.checkpointsHit?.length ?? 0) + 1;
    setMissionState((s) => s.checkpointsHit.includes(cpId) ? s : { ...s, checkpointsHit: [...s.checkpointsHit, cpId] });
    return { count, total: levelConfig.objectives?.checkpoints ?? 3 };
  }, [isLevelComplete, levelConfig.missionType, levelConfig.objectives, missionState]);

  const captureCat = useCallback((catId) => {
    if (levelConfig.missionType === 'escape') return { success: false, reason: 'escape_mode' };
    if (!catId || !cats.some((c) => c.id === catId)) return { success: false, reason: 'invalid_cat' };
    if (capturedCatIds.includes(catId)) return { success: false, reason: 'already_captured' };
    if (levelConfig.missionType === 'exploration' && missionState.activatedBellIds.length < missionState.requiredBells) { setLastCatchResult({ success: false, reason: 'bells_required' }); setMissionState((s) => ({ ...s, missionMessage: 'Activa las campanitas primero' })); return { success: false, reason: 'bells_required' }; }
    const cat = cats.find((c) => c.id === catId);
    const basePoints = cat?.points ?? 100;
    const comboReward = getComboReward(basePoints, comboStateRef.current, powerStateRef.current);
    comboStateRef.current = { count: comboReward.comboCount, lastCaptureAt: Date.now(), expiresAt: comboReward.expiresAt };
    setComboCount(comboReward.comboCount);
    setComboExpiresAt(comboReward.expiresAt);
    setCapturedCatIds((prev) => {
      if (prev.includes(catId)) return prev;
      const next = [...prev, catId]; const nextScore = score + comboReward.pointsAwarded; const goldenCatCaptured = missionState.goldenCatCaptured || !!cat?.golden;
      setScore(nextScore); setLastCatchResult({ success: true, catId, golden: !!cat?.golden, ...comboReward }); setMissionState((s) => ({ ...s, goldenCatCaptured, missionMessage: '' })); setHealth((h) => ({ ...h, current: Math.min(h.max, h.current + HEAL_PER_CAT + comboReward.healBonus) }));
      const need = levelConfig.objectives?.requiredCats ?? cats.length;
      // En misiones quest los michis son bonus: el nivel se completa por la quest
      const done = QUEST_MISSIONS.includes(levelConfig.missionType) ? false : levelConfig.missionType === 'golden' ? goldenCatCaptured : levelConfig.objectives?.requiresGoldenCat ? next.length >= need && goldenCatCaptured : next.length >= need;
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
    const hasActive = Object.values(powerState).some((until) => until > Date.now());
    if (!hasActive) return undefined;
    const id = setInterval(() => {
      const now = Date.now();
      const current = powerStateRef.current;
      if (Object.values(current).every((until) => until <= now)) syncPowerState(EMPTY_POWER);
      else setPowerState({ ...current });
    }, 500);
    return () => clearInterval(id);
  }, [powerState, syncPowerState]);
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
  useEffect(() => { if (isPaused || isLevelComplete || missionState.isGameOver || isClockFrozen) return; const t = setInterval(() => setTimeLeft((v) => (v <= 1 ? 0 : v - 1)), 1000); return () => clearInterval(t); }, [isPaused, isLevelComplete, missionState.isGameOver, isClockFrozen]);
  useEffect(() => { if (timeLeft === 0 && !isLevelComplete) { if (levelConfig.missionType === 'escape') completeEscape('survival'); else { setIsPaused(true); setMissionState((s) => ({ ...s, isGameOver: true, missionMessage: 'Se acabó el tiempo' })); } } }, [completeEscape, isLevelComplete, levelConfig.missionType, timeLeft]);
  useEffect(() => {
    if (levelConfig.missionType !== 'vehicle_dash' || isLevelComplete || missionState.isGameOver) return;
    const need = levelConfig.objectives?.checkpoints ?? 3;
    if ((missionState.checkpointsHit?.length ?? 0) >= need) completeQuest('dash');
  }, [completeQuest, isLevelComplete, levelConfig.missionType, levelConfig.objectives, missionState.checkpointsHit, missionState.isGameOver]);

  return useMemo(() => ({ worlds: WORLDS, progress, worldId, levelId, currentLevelIndex, isLastLevelInWorld, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, isGameOver: missionState.isGameOver, nearestCatId, nearestCatDistance, lastCatchResult, comboCount, comboExpiresAt, comboWindowMs: COMBO_WINDOW_MS, speedMode, powerState, isTurboActive, isMagnetActive, isClockFrozen, isScoreMultiplierActive, health, missionState, bells, exitPortal, checkpoints, levelNonce, takeDamage, difficulty, setDifficulty, startLevel, captureCat, completeLevel, completeEscape, completeQuest, recordQuestEvent, hitCheckpoint, restartLevel, goToNextLevel, goToWorld, setNearestCat, setLastCatchResult, activateBell, addScore, addTime, activatePowerUp, toggleSpeedMode, setIsPaused }), [progress, worldId, levelId, currentLevelIndex, isLastLevelInWorld, worldConfig, levelConfig, cats, totalCats, capturedCatIds, score, timeLeft, isPaused, isLevelComplete, missionState, bells, exitPortal, checkpoints, levelNonce, nearestCatId, nearestCatDistance, lastCatchResult, comboCount, comboExpiresAt, speedMode, powerState, isTurboActive, isMagnetActive, isClockFrozen, isScoreMultiplierActive, health, takeDamage, difficulty, startLevel, captureCat, completeLevel, completeEscape, completeQuest, recordQuestEvent, hitCheckpoint, restartLevel, goToNextLevel, goToWorld, setNearestCat, activateBell, addScore, addTime, activatePowerUp, toggleSpeedMode]);
}
