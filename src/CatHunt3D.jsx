import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Game3DCanvas from './game3d/Game3DCanvas';
import MobileGameInputLayer from './game3d/MobileGameInputLayer';
import useGameRuntime from './game/useGameRuntime';
import MinimalHUD from './game/components/MinimalHUD';
import LevelIntroCard from './game/components/LevelIntroCard';
import WorldMapPanel from './game/components/WorldMapPanel';
import SplashScreen from './game/components/SplashScreen';
import LevelTransition from './game/components/LevelTransition';
import CatCollection from './game/components/CatCollection';
import AchievementsPanel, { AchievementToast } from './game/components/AchievementsPanel';
import { evaluateAchievements, loadAchievements, saveAchievements, getAchievementById } from './game/achievements/achievements';
import { haptic, setHapticsEnabled } from './game/haptics';
import { loadSettings, saveSettings, checkDailyStreak, recordHighScore } from './game/persistence/userSettings';
import { getGraphicsProfile } from './game/graphicsSettings';
import PauseMenu from './game/components/PauseMenu';
import SettingsPanel from './game/components/SettingsPanel';
import TutorialOverlay from './game/components/TutorialOverlay';
import MiniMap from './game/components/MiniMap';
import HealthBar from './game/components/HealthBar';
import LoadingScreen from './game/components/LoadingScreen';
import DifficultySelector from './game/components/DifficultySelector';
import ShareProgressModal from './game/components/ShareProgressModal';
import VictoryScreen from './game/components/VictoryScreen';
import Wardrobe from './game/components/Wardrobe';
import MultiplayerLobby from './game/components/MultiplayerLobby';
import GameOverPanel from './game/components/GameOverPanel';
import { resolveActiveOutfit } from './game/outfits/outfits';
import { PeerSession } from './game/multiplayer/peerSession';
import { loadEndlessState, saveEndlessState, getEndlessLevel } from './game/endlessMode';
import { DIFFICULTY_ENEMY_COUNT } from './game/health/healthSystem';
import { startBiomeAudio, muteBiomeAudio, unmuteBiomeAudio, playCaptureChime } from './game/audio/BiomeAudio.js';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

export default function CatHunt3D() {
  const runtime = useGameRuntime();
  const [screen, setScreen] = useState('splash');
  const [mute, setMute] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isWorldPanelOpen, setIsWorldPanelOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [achievementsState, setAchievementsState] = useState(() => loadAchievements());
  const [achievementToast, setAchievementToast] = useState(null);
  const [settings, setSettings] = useState(() => loadSettings());
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);
  const [isLoadingScreen, setIsLoadingScreen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [allWorldsCompleted, setAllWorldsCompleted] = useState(false);
  const invulnUntilRef = useRef(0);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [endlessState, setEndlessState] = useState(() => loadEndlessState());
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [mpSession, setMpSession] = useState(null);
  const [mpStatus, setMpStatus] = useState('idle');
  const [mpRoomCode, setMpRoomCode] = useState(null);
  const [remotePlayers, setRemotePlayers] = useState([]);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const game3dRef = useRef(null);
  const touchState = useRef({ joystick: { x: 0, y: 0, magnitude: 0, active: false }, joy: { x: 0, y: 0, magnitude: 0, active: false }, look: { dx: 0, dy: 0 } });

  const activeOutfit = useMemo(() => resolveActiveOutfit(settings, runtime.worldConfig.theme, achievementsState), [settings, runtime.worldConfig.theme, achievementsState]);
  const graphicsProfile = useMemo(() => getGraphicsProfile(settings), [settings]);
  const visibleCats = useMemo(() => runtime.cats.filter((c) => !runtime.capturedCatIds.includes(c.id)).length, [runtime.cats, runtime.capturedCatIds]);
  const missionEnemyBonus = runtime.levelConfig?.modifiers?.enemyBonus ?? 0;
  const radarRange = runtime.levelConfig?.modifiers?.radarRange ?? 30;
  const missionObjectiveText = useMemo(() => {
    const level = runtime.levelConfig ?? {};
    const missionType = level.missionType ?? 'rescue';
    const requiredCats = level.objectives?.requiredCats ?? level.catCount ?? runtime.totalCats;
    const requiredBells = level.objectives?.requiredBells ?? 0;
    if (missionType === 'golden') return 'Encuentra al Michi Dorado';
    if (missionType === 'time_attack') return `Atrapa ${requiredCats} michis antes de que acabe el tiempo`;
    if (missionType === 'exploration') return `Activa ${requiredBells} campanitas y rescata ${requiredCats} michis`;
    if (missionType === 'careful') return `Rescata ${requiredCats} michis sin perder corazones`;
    if (missionType === 'fog') return `Radar limitado: rescata ${requiredCats} michis`;
    if (missionType === 'slow_zone') return `Cruza zonas lentas y rescata ${requiredCats} michis`;
    if (missionType === 'city_hide') return `Busca escondites y rescata ${requiredCats} michis`;
    if (missionType === 'mountain_jump') return `Usa saltos suaves y rescata ${requiredCats} michis`;
    if (missionType === 'finale') return `Rescate final: ${requiredCats} michis y Michi Dorado`;
    return `Atrapa ${requiredCats} michis`;
  }, [runtime.levelConfig, runtime.totalCats]);

  const showFeedback = useCallback((msg) => {
    if (!msg) return;
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 1500);
  }, []);

  useEffect(() => {
    if (screen !== 'game' || !missionObjectiveText) return;
    const t = setTimeout(() => showFeedback(missionObjectiveText), 3900);
    return () => clearTimeout(t);
  }, [screen, runtime.worldId, runtime.levelId, missionObjectiveText, showFeedback]);

  useEffect(() => {
    if (!mpSession || screen !== 'game') return;
    const id = setInterval(() => {
      const pos = game3dRef.current?.getPlayerPosition?.();
      if (pos) mpSession.sendPosition(pos.x, pos.z, 0, runtime.speedMode === 'fast' ? 'run' : 'idle');
    }, 100);
    return () => clearInterval(id);
  }, [mpSession, screen, runtime.speedMode]);

  useEffect(() => {
    if (!mpSession) { setRemotePlayers([]); return; }
    const id = setInterval(() => setRemotePlayers(mpSession.getRemotePlayers()), 100);
    return () => clearInterval(id);
  }, [mpSession]);

  useEffect(() => () => { mpSession?.destroy?.(); }, []);

  useEffect(() => { setHapticsEnabled(settings.hapticsEnabled); saveSettings(settings); }, [settings]);

  useEffect(() => {
    const info = checkDailyStreak(settings);
    if (info.isNewDay) {
      const updated = { ...settings, dailyStreak: { count: info.count, lastDate: info.today } };
      setSettings(updated);
      setStreakInfo(info);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (screen === 'game' && !settings.tutorialSeen) setIsTutorialOpen(true); }, [screen]);

  useEffect(() => {
    if (runtime.isPaused && !runtime.isGameOver && !isTransitionOpen && !isLoadingScreen) setIsPauseMenuOpen(true);
    else setIsPauseMenuOpen(false);
  }, [runtime.isPaused, runtime.isGameOver, isTransitionOpen, isLoadingScreen]);

  useEffect(() => { if (screen === 'game') startBiomeAudio(runtime.worldConfig.theme).catch(() => {}); }, [screen, runtime.worldConfig.theme]);
  useEffect(() => { if (mute || !settings.audioEnabled) muteBiomeAudio(); else unmuteBiomeAudio(); }, [mute, settings.audioEnabled]);

  useEffect(() => {
    if (screen === 'game') setIsLoadingScreen(true);
    else { setIsLoadingScreen(false); setIsTransitionOpen(false); setIsPauseMenuOpen(false); setIsVictoryOpen(false); }
  }, [screen, runtime.worldId]);

  useEffect(() => { if (isLoadingScreen) runtime.setIsPaused?.(true); }, [isLoadingScreen]);
  useEffect(() => {
    if (!isLoadingScreen) return;
    const t = setTimeout(() => { setIsLoadingScreen(false); runtime.setIsPaused?.(false); }, 5000);
    return () => clearTimeout(t);
  }, [isLoadingScreen]);

  const onUpgradeDifficulty = useCallback((newDiff) => {
    runtime.setDifficulty?.(newDiff);
    setSettings((s) => ({ ...s, difficulty: newDiff }));
    setIsVictoryOpen(false);
    setIsTransitionOpen(false);
    runtime.startLevel?.('world-1', 'nivel-1');
  }, [runtime]);

  const onStartEndless = useCallback(() => {
    const next = getEndlessLevel(0);
    const newState = { active: true, level: 0, bestLevel: Math.max(endlessState.bestLevel, 0) };
    setEndlessState(newState);
    saveEndlessState(newState);
    setIsVictoryOpen(false);
    setIsTransitionOpen(false);
    runtime.startLevel?.(next.world.id, next.world.levels[0].id);
  }, [endlessState, runtime]);

  const onPowerUpCollect = useCallback((type) => {
    haptic.success();
    if (type === 'star') {
      runtime.addScore?.(200);
      showFeedback('⭐ +200 pts');
    } else if (type === 'time') {
      runtime.addTime?.(10);
      showFeedback('⏱ +10 segundos');
    } else if (type === 'shield') {
      showFeedback('🛡 Escudo activado');
      invulnUntilRef.current = Date.now() + 5000;
    } else if (type === 'magnet') {
      showFeedback('🧲 Imán activado');
    }
  }, [runtime, showFeedback]);

  const onLoadingComplete = useCallback(() => { setIsLoadingScreen(false); runtime.setIsPaused?.(false); }, []);
  useEffect(() => { invulnUntilRef.current = runtime.health?.invulnUntil ?? 0; }, [runtime.health?.invulnUntil]);

  useEffect(() => {
    if (runtime.isLevelComplete && runtime.isLastLevelInWorld && (runtime.worldId === 'world-10' || runtime.worldId === 'world-11')) {
      const t = setTimeout(() => { setIsTransitionOpen(false); setIsVictoryOpen(true); }, 3200);
      return () => clearTimeout(t);
    }
  }, [runtime.worldId, runtime.isLastLevelInWorld, runtime.isLevelComplete]);

  useEffect(() => {
    if (runtime.isLevelComplete && !isTransitionOpen) {
      setIsTransitionOpen(true);
      setSettings((prev) => recordHighScore(prev, runtime.worldId, runtime.score));
      grantAchievements('level-complete', { worldId: runtime.worldId, levelId: runtime.levelId, score: runtime.score, targetScore: runtime.levelConfig.targetScore, timeLeft: runtime.timeLeft });
    }
  }, [runtime.isLevelComplete, isTransitionOpen]);

  useEffect(() => {
    const last = runtime.progress?.unlockedWorldIds?.slice(-1)?.[0];
    if (last) grantAchievements('world-unlocked', { worldId: last });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.progress?.unlockedWorldIds?.length]);

  const grantAchievements = (event, payload) => {
    setAchievementsState((prev) => {
      const { newUnlocked, newState } = evaluateAchievements({ event, state: { ...prev }, payload, prog: runtime.progress });
      saveAchievements(newState);
      if (newUnlocked.length > 0) {
        const first = getAchievementById(newUnlocked[0]);
        setAchievementToast(first);
        haptic.achievement();
        setTimeout(() => setAchievementToast(null), 3500);
      }
      return newState;
    });
  };

  const onCatch = () => {
    if (runtime.isLevelComplete || runtime.isGameOver) return;
    if (runtime.levelConfig?.missionType === 'exploration' && (runtime.missionState?.activatedBellIds?.length ?? 0) < (runtime.missionState?.requiredBells ?? 0)) {
      haptic.fail();
      showFeedback('Activa las campanitas primero');
      return;
    }
    const result = game3dRef.current?.attemptCatch?.();
    if (result?.success) {
      const captureResult = runtime.captureCat(result.catId);
      if (captureResult?.success === false) {
        haptic.fail();
        showFeedback(captureResult.reason === 'bells_required' ? 'Activa las campanitas primero' : 'No se pudo capturar');
        return;
      }
      playCaptureChime().catch(() => {});
      haptic.capture();
      const isGoldenCat = game3dRef.current?.isGolden?.(result.catId);
      const comboText = captureResult.comboCount > 1 ? ` | x${captureResult.comboCount} Combo` : '';
      const pointsText = `+${captureResult.pointsAwarded ?? 100} pts${comboText}`;
      if (isGoldenCat) {
        setSettings((s) => ({ ...s, goldenCatsCaught: (s.goldenCatsCaught ?? 0) + 1 }));
        showFeedback(`Michi DORADO ${pointsText}`);
      } else {
        showFeedback(pointsText);
      }
      grantAchievements('cat-caught', { catId: result.catId });
    } else {
      runtime.setLastCatchResult(result ?? { success: false, reason: 'no_cat' });
      haptic.fail();
      showFeedback('Acércate un poquito más');
    }
  };

  const onTransitionAdvance = () => {
    setIsTransitionOpen(false);
    if (runtime.isLastLevelInWorld && (runtime.worldId === 'world-10' || runtime.worldId === 'world-11')) {
      setIsVictoryOpen(true);
      return;
    }
    runtime.goToNextLevel?.();
  };

  if (screen === 'splash') {
    return (
      <>
        <SplashScreen
          hasProgress={(runtime.progress?.unlockedWorldIds?.length ?? 0) > 1}
          onStart={() => setScreen('game')}
          onContinue={() => setScreen('game')}
          onWorlds={() => setIsWorldPanelOpen(true)}
          onCollection={() => setIsCollectionOpen(true)}
          onHowToPlay={() => showFeedback('Mueve el joystick · Toca Atrapar al acercarte a un michi')}
          onCredits={() => showFeedback('CAT HUNTER creado por Bernard y Sarita')}
          onAchievements={() => setIsAchievementsOpen(true)}
          onShare={() => setIsShareOpen(true)}
          onDifficulty={() => setIsDifficultyOpen(true)}
          onWardrobe={() => setIsWardrobeOpen(true)}
          onMultiplayer={() => setIsMultiplayerOpen(true)}
          currentDifficulty={runtime.difficulty}
          dailyStreak={settings.dailyStreak?.count ?? 0}
          goldenCats={settings.goldenCatsCaught ?? 0}
          highScores={settings.highScores ?? {}}
        />
        {feedback && <div className="catch-feedback">{feedback}</div>}
        <WorldMapPanel isOpen={isWorldPanelOpen} worlds={runtime.worlds} currentWorldId={runtime.worldId} unlockedWorldIds={runtime.progress.unlockedWorldIds} progress={runtime.progress} onSelectWorld={(wid) => { runtime.goToWorld(wid); setIsWorldPanelOpen(false); setScreen('game'); }} onClose={() => setIsWorldPanelOpen(false)} onLockedWorld={() => showFeedback('Completa el mundo anterior para desbloquearlo')} />
        <CatCollection isOpen={isCollectionOpen} worlds={runtime.worlds} progress={runtime.progress} onClose={() => setIsCollectionOpen(false)} />
        <AchievementsPanel isOpen={isAchievementsOpen} achievements={achievementsState} onClose={() => setIsAchievementsOpen(false)} />
        <Wardrobe isOpen={isWardrobeOpen} currentOutfitId={settings.outfitOverride ?? 'auto'} achievements={achievementsState} totalCats={achievementsState?.totalCaught ?? 0} onSelect={(id) => { setSettings((s) => ({ ...s, outfitOverride: id })); setIsWardrobeOpen(false); }} onClose={() => setIsWardrobeOpen(false)} />
        <MultiplayerLobby
          isOpen={isMultiplayerOpen}
          status={mpStatus}
          roomCode={mpRoomCode}
          playersCount={remotePlayers.length}
          onCreateRoom={async () => { const sess = new PeerSession({ onPlayerJoin: () => showFeedback('👋 Jugador conectado'), onPlayerLeave: () => showFeedback('👋 Jugador desconectado'), onMessage: () => {}, onStatus: setMpStatus }); const { roomCode } = await sess.createRoom(); setMpSession(sess); setMpRoomCode(roomCode); sess.sendHello({ name: 'Sarita', color: activeOutfit?.hatColor, outfitId: settings.outfitOverride ?? 'auto' }); }}
          onJoinRoom={async (code) => { const sess = new PeerSession({ onPlayerJoin: () => showFeedback('✨ Conectado al host'), onPlayerLeave: () => showFeedback('Host desconectado'), onMessage: () => {}, onStatus: setMpStatus }); await sess.joinRoom(code); setMpSession(sess); setMpRoomCode(code); sess.sendHello({ name: 'Sarita', color: activeOutfit?.hatColor, outfitId: settings.outfitOverride ?? 'auto' }); }}
          onClose={() => setIsMultiplayerOpen(false)}
        />
        <DifficultySelector isOpen={isDifficultyOpen} current={runtime.difficulty} allCompleted={false} onSelect={(diff) => { runtime.setDifficulty(diff); setSettings((s) => ({ ...s, difficulty: diff })); setIsDifficultyOpen(false); }} onClose={() => setIsDifficultyOpen(false)} />
        <ShareProgressModal isOpen={isShareOpen} settings={settings} achievements={achievementsState} onClose={() => setIsShareOpen(false)} />
        <AchievementToast achievement={achievementToast} />
      </>
    );
  }

  return (
    <div>
      <LevelIntroCard
        worldKey={`${runtime.worldId}-${runtime.levelId}`}
        worldIndex={runtime.worldConfig.order}
        worldName={runtime.worldConfig.name}
        levelName={runtime.levelConfig.id.replace('-', ' ')}
        totalWorlds={runtime.worlds.length}
        missionTitle={runtime.levelConfig.missionTitle}
        objectiveText={missionObjectiveText}
      />

      <MinimalHUD capturedCount={runtime.capturedCatIds.length} totalCats={runtime.totalCats} timeLeft={runtime.timeLeft} comboCount={runtime.comboCount} lastCatchResult={runtime.lastCatchResult} isPaused={runtime.isPaused} onPause={() => runtime.setIsPaused((v) => !v)} onHome={() => setScreen('splash')} />

      <Game3DCanvas
        ref={game3dRef}
        touchState={touchState}
        cats={runtime.cats}
        capturedCatIds={runtime.capturedCatIds}
        isPaused={runtime.isPaused}
        isLevelComplete={runtime.isLevelComplete}
        speedMode={runtime.speedMode}
        levelIndex={runtime.currentLevelIndex ?? 0}
        worldTheme={runtime.worldConfig.theme}
        mapRadius={110}
        lowQuality={settings.graphicsQuality === 'low'}
        graphicsProfile={graphicsProfile}
        outfitColor={activeOutfit?.dressColor}
        hatColor={activeOutfit?.hatColor}
        remotePlayers={remotePlayers}
        enemyCount={(DIFFICULTY_ENEMY_COUNT[runtime.difficulty] ?? 1) + missionEnemyBonus}
        onEnemyHit={() => { runtime.takeDamage?.(); haptic.fail(); }}
        onPowerUpCollect={onPowerUpCollect}
        invulnUntilRef={invulnUntilRef}
        onNearestCatChange={(catId, distance) => runtime.setNearestCat({ catId, distance })}
        runtimeKey={`${runtime.worldId}-${runtime.levelId}-${runtime.totalCats}`}
        bells={runtime.bells ?? []}
        activatedBellIds={runtime.missionState?.activatedBellIds ?? []}
        onBellActivate={(bellId) => { runtime.activateBell?.(bellId); haptic.success(); showFeedback('🔔 Campanita activada'); }}
      />

      <MobileGameInputLayer touchState={touchState} speedMode={runtime.speedMode} isCatInCaptureRange={runtime.nearestCatDistance <= 2.6} onCatch={onCatch} onJump={() => game3dRef.current?.requestJump?.()} onToggleSpeed={runtime.toggleSpeedMode} />

      {feedback && <div className="catch-feedback">{feedback}</div>}

      <WorldMapPanel isOpen={isWorldPanelOpen} worlds={runtime.worlds} currentWorldId={runtime.worldId} unlockedWorldIds={runtime.progress.unlockedWorldIds} progress={runtime.progress} onSelectWorld={(wid) => { runtime.goToWorld(wid); setIsWorldPanelOpen(false); }} onClose={() => setIsWorldPanelOpen(false)} onLockedWorld={() => showFeedback('Completa el mundo anterior para desbloquearlo')} />

      <LevelTransition open={isTransitionOpen} score={runtime.score} capturedCount={runtime.capturedCatIds.length} totalCats={runtime.totalCats} targetScore={runtime.levelConfig.targetScore} onAdvance={onTransitionAdvance} />
      <GameOverPanel isOpen={runtime.isGameOver} message={runtime.missionState?.missionMessage || 'Intenta de nuevo'} onRestart={() => runtime.restartLevel?.()} onHome={() => setScreen('splash')} />
      <MiniMap getRadarSnapshot={() => game3dRef.current?.getRadarSnapshot?.()} mapRange={radarRange} />
      <HealthBar current={runtime.health?.current ?? 3} max={runtime.health?.max ?? 3} />

      <PauseMenu isOpen={isPauseMenuOpen} audioEnabled={settings.audioEnabled} hapticsEnabled={settings.hapticsEnabled} onResume={() => { runtime.setIsPaused(false); setIsPauseMenuOpen(false); }} onRestart={() => { setIsPauseMenuOpen(false); runtime.restartLevel?.(); }} onHome={() => { setIsPauseMenuOpen(false); setScreen('splash'); }} onSettings={() => setIsSettingsOpen(true)} onToggleAudio={() => setSettings((s) => ({ ...s, audioEnabled: !s.audioEnabled }))} onToggleHaptics={() => setSettings((s) => ({ ...s, hapticsEnabled: !s.hapticsEnabled }))} />
      <SettingsPanel isOpen={isSettingsOpen} settings={settings} onChange={setSettings} onClose={() => setIsSettingsOpen(false)} />
      <TutorialOverlay isOpen={isTutorialOpen} onClose={() => { setIsTutorialOpen(false); setSettings((s) => ({ ...s, tutorialSeen: true })); }} />
      <LoadingScreen isOpen={isLoadingScreen} worldName={runtime.worldConfig.name} onComplete={onLoadingComplete} />
      <DifficultySelector isOpen={isDifficultyOpen || allWorldsCompleted} current={runtime.difficulty} allCompleted={allWorldsCompleted} onSelect={(diff) => { runtime.setDifficulty(diff); setSettings((s) => ({ ...s, difficulty: diff })); setIsDifficultyOpen(false); if (allWorldsCompleted) { setAllWorldsCompleted(false); runtime.startLevel('world-1', 'nivel-1'); setScreen('game'); } }} onClose={() => setIsDifficultyOpen(false)} />
      <ShareProgressModal isOpen={isShareOpen} settings={settings} achievements={achievementsState} onClose={() => setIsShareOpen(false)} />
      <VictoryScreen isOpen={isVictoryOpen} totalScore={Object.values(settings?.highScores ?? {}).reduce((s, v) => s + (v ?? 0), 0)} totalCats={achievementsState?.totalCaught ?? 0} goldenCats={settings?.goldenCatsCaught ?? 0} achievementsEarned={Object.keys(achievementsState?.unlocked ?? {}).length} currentDifficulty={runtime.difficulty} onUpgradeDifficulty={onUpgradeDifficulty} onStartEndless={onStartEndless} onHome={() => { setIsVictoryOpen(false); setIsTransitionOpen(false); setScreen('splash'); }} />
      <AchievementToast achievement={achievementToast} />
      {DEBUG_INPUT && <pre data-game-ui="true" style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 99, background: 'rgba(0,0,0,.72)', color: '#fff', padding: 8, fontSize: 11 }}>{JSON.stringify({ world: runtime.worldId, level: runtime.levelId, visibleCats, captured: runtime.capturedCatIds.length, nearestCatId: runtime.nearestCatId, nearestDist: runtime.nearestCatDistance }, null, 2)}</pre>}
    </div>
  );
}
