import { useEffect, useMemo, useRef, useState } from 'react';
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
import { ACHIEVEMENTS, evaluateAchievements, loadAchievements, saveAchievements, getAchievementById } from './game/achievements/achievements';
import { haptic, setHapticsEnabled } from './game/haptics';
import { loadSettings, saveSettings, checkDailyStreak, recordHighScore } from './game/persistence/userSettings';
import PauseMenu from './game/components/PauseMenu';
import SettingsPanel from './game/components/SettingsPanel';
import TutorialOverlay from './game/components/TutorialOverlay';
import MiniMap from './game/components/MiniMap';
import HealthBar from './game/components/HealthBar';
import LoadingScreen from './game/components/LoadingScreen';
import DifficultySelector from './game/components/DifficultySelector';
import DailyChallengeBadge from './game/components/DailyChallengeBadge';
import ShareProgressModal from './game/components/ShareProgressModal';
import { DIFFICULTY_ENEMY_COUNT } from './game/health/healthSystem';
import { isChallengeCompletedToday, markChallengeCompleted } from './game/dailyChallenge';
import { startBiomeAudio, muteBiomeAudio, unmuteBiomeAudio, playCaptureChime } from './game/audio/BiomeAudio.js';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

export default function CatHunt3D() {
  const runtime = useGameRuntime();
  const [screen, setScreen] = useState('splash'); // splash | game
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
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const game3dRef = useRef(null);
  const touchState = useRef({
    joystick: { x: 0, y: 0, magnitude: 0, active: false },
    joy: { x: 0, y: 0, magnitude: 0, active: false },
    look: { dx: 0, dy: 0 }
  });

  const visibleCats = useMemo(() => runtime.cats.filter((c) => !runtime.capturedCatIds.includes(c.id)).length, [runtime.cats, runtime.capturedCatIds]);

  // Aplicar settings al cargar
  useEffect(() => {
    setHapticsEnabled(settings.hapticsEnabled);
    saveSettings(settings);
  }, [settings]);

  // Daily streak check (al montar)
  useEffect(() => {
    const info = checkDailyStreak(settings);
    if (info.isNewDay) {
      const updated = { ...settings, dailyStreak: { count: info.count, lastDate: info.today } };
      setSettings(updated);
      setStreakInfo(info);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-show tutorial primera vez
  useEffect(() => {
    if (screen === 'game' && !settings.tutorialSeen) {
      setIsTutorialOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Pause menu sigue al estado de pausa
  useEffect(() => {
    if (runtime.isPaused && !isTransitionOpen) setIsPauseMenuOpen(true);
    else setIsPauseMenuOpen(false);
  }, [runtime.isPaused, isTransitionOpen]);

  // Audio ambiental: arranca/cambia con el bioma actual
  useEffect(() => {
    if (screen === 'game') {
      startBiomeAudio(runtime.worldConfig.theme).catch(() => {});
    }
  }, [screen, runtime.worldConfig.theme]);

  useEffect(() => {
    if (mute || !settings.audioEnabled) muteBiomeAudio(); else unmuteBiomeAudio();
  }, [mute, settings.audioEnabled]);

  // Loading screen al cambiar de mundo
  useEffect(() => {
    if (screen === 'game') {
      setIsLoadingScreen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.worldId]);

  // Sincronizar invulnerable ref con health
  useEffect(() => {
    invulnUntilRef.current = runtime.health?.invulnUntil ?? 0;
  }, [runtime.health?.invulnUntil]);

  // Detectar si completó todos los mundos
  useEffect(() => {
    if (runtime.worldId === 'world-11' && runtime.isLevelComplete) {
      setAllWorldsCompleted(true);
    }
  }, [runtime.worldId, runtime.isLevelComplete]);

  // Detecta nivel completado → abre transición
  useEffect(() => {
    if (runtime.isLevelComplete && !isTransitionOpen) {
      setIsTransitionOpen(true);
      // Track high score + golden cats
      setSettings((prev) => recordHighScore(prev, runtime.worldId, runtime.score));
      grantAchievements('level-complete', {
        worldId: runtime.worldId,
        levelId: runtime.levelId,
        score: runtime.score,
        targetScore: runtime.levelConfig.targetScore,
        timeLeft: runtime.timeLeft
      });
    }
  }, [runtime.isLevelComplete, isTransitionOpen]);

  useEffect(() => {
    // Detect new world unlock
    const last = runtime.progress?.unlockedWorldIds?.slice(-1)?.[0];
    if (last) grantAchievements('world-unlocked', { worldId: last });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.progress?.unlockedWorldIds?.length]);


  const grantAchievements = (event, payload) => {
    setAchievementsState((prev) => {
      const { newUnlocked, newState } = evaluateAchievements({
        event,
        state: { ...prev },
        payload,
        prog: runtime.progress
      });
      saveAchievements(newState);
      if (newUnlocked.length > 0) {
        // Mostrar primer logro como toast
        const first = getAchievementById(newUnlocked[0]);
        setAchievementToast(first);
        haptic.achievement();
        setTimeout(() => setAchievementToast(null), 3500);
      }
      return newState;
    });
  };

  const onCatch = () => {
    if (runtime.isLevelComplete) return;
    const result = game3dRef.current?.attemptCatch?.();
    if (result?.success) {
      runtime.captureCat(result.catId);
      playCaptureChime().catch(() => {});
      haptic.capture();
      const isGoldenCat = game3dRef.current?.isGolden?.(result.catId);
      if (isGoldenCat) {
        setSettings((s) => ({ ...s, goldenCatsCaught: (s.goldenCatsCaught ?? 0) + 1 }));
        showFeedback('✨ ¡Michi DORADO! +500 pts');
      }
      grantAchievements('cat-caught', { catId: result.catId });
    } else {
      runtime.setLastCatchResult(result ?? { success: false, reason: 'no_cat' });
      haptic.fail();
      setFeedback('Acércate un poquito más');
      setTimeout(() => setFeedback(''), 1100);
    }
  };

  const onTransitionAdvance = () => {
    setIsTransitionOpen(false);
    runtime.goToNextLevel?.();
  };

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 1500);
  };

  // SPLASH SCREEN
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
          onCredits={() => showFeedback('Creado por Bernard y Sarita 💜')}
          onAchievements={() => setIsAchievementsOpen(true)}
          onShare={() => setIsShareOpen(true)}
          onDifficulty={() => setIsDifficultyOpen(true)}
          currentDifficulty={runtime.difficulty}
          dailyStreak={settings.dailyStreak?.count ?? 0}
          goldenCats={settings.goldenCatsCaught ?? 0}
          highScores={settings.highScores ?? {}}
        />
        {feedback && <div className="catch-feedback">{feedback}</div>}
        <WorldMapPanel
          isOpen={isWorldPanelOpen}
          worlds={runtime.worlds}
          currentWorldId={runtime.worldId}
          unlockedWorldIds={runtime.progress.unlockedWorldIds}
          progress={runtime.progress}
          onSelectWorld={(wid) => {
            runtime.goToWorld(wid);
            setIsWorldPanelOpen(false);
            setScreen('game');
          }}
          onClose={() => setIsWorldPanelOpen(false)}
          onLockedWorld={() => showFeedback('Completa el mundo anterior para desbloquearlo')}
        />
        <CatCollection
          isOpen={isCollectionOpen}
          worlds={runtime.worlds}
          progress={runtime.progress}
          onClose={() => setIsCollectionOpen(false)}
        />
        <AchievementsPanel
          isOpen={isAchievementsOpen}
          achievements={achievementsState}
          onClose={() => setIsAchievementsOpen(false)}
        />
        <DifficultySelector
          isOpen={isDifficultyOpen}
          current={runtime.difficulty}
          allCompleted={false}
          onSelect={(diff) => {
            runtime.setDifficulty(diff);
            setSettings((s) => ({ ...s, difficulty: diff }));
            setIsDifficultyOpen(false);
          }}
          onClose={() => setIsDifficultyOpen(false)}
        />
        <ShareProgressModal
          isOpen={isShareOpen}
          settings={settings}
          achievements={achievementsState}
          onClose={() => setIsShareOpen(false)}
        />
        <AchievementToast achievement={achievementToast} />
      </>
    );
  }

  return (
    <div>
      {/* Intro card (visible los primeros 2.8s de cada nivel) */}
      <LevelIntroCard
        worldKey={`${runtime.worldId}-${runtime.levelId}`}
        worldIndex={runtime.worldConfig.order}
        worldName={runtime.worldConfig.name}
        levelName={runtime.levelConfig.id.replace('-', ' ')}
        totalWorlds={runtime.worlds.length}
      />

      {/* HUD minimalista — solo timer + michis arriba-izq, pause + home arriba-der */}
      <MinimalHUD
        capturedCount={runtime.capturedCatIds.length}
        totalCats={runtime.totalCats}
        timeLeft={runtime.timeLeft}
        isPaused={runtime.isPaused}
        onPause={() => runtime.setIsPaused((v) => !v)}
        onHome={() => setScreen('splash')}
      />

      <Game3DCanvas
        ref={game3dRef}
        touchState={touchState}
        cats={runtime.cats}
        capturedCatIds={runtime.capturedCatIds}
        isPaused={runtime.isPaused}
        isLevelComplete={runtime.isLevelComplete}
        speedMode={runtime.speedMode}
        levelIndex={0}
        worldTheme={runtime.worldConfig.theme}
        mapRadius={28}
        lowQuality={settings.graphicsQuality === 'low'}
        enemyCount={DIFFICULTY_ENEMY_COUNT[runtime.difficulty] ?? 1}
        onEnemyHit={() => { runtime.takeDamage?.(); haptic.fail(); }}
        invulnUntilRef={invulnUntilRef}
        onNearestCatChange={(catId, distance) => runtime.setNearestCat({ catId, distance })}
        runtimeKey={`${runtime.worldId}-${runtime.levelId}-${runtime.totalCats}`}
      />

      <MobileGameInputLayer
        touchState={touchState}
        speedMode={runtime.speedMode}
        isCatInCaptureRange={runtime.nearestCatDistance <= 2.6}
        onCatch={onCatch}
        onJump={() => game3dRef.current?.requestJump?.()}
        onToggleSpeed={runtime.toggleSpeedMode}
      />

      {feedback && <div className="catch-feedback">{feedback}</div>}

      <WorldMapPanel
        isOpen={isWorldPanelOpen}
        worlds={runtime.worlds}
        currentWorldId={runtime.worldId}
        unlockedWorldIds={runtime.progress.unlockedWorldIds}
        progress={runtime.progress}
        onSelectWorld={(wid) => {
          runtime.goToWorld(wid);
          setIsWorldPanelOpen(false);
        }}
        onClose={() => setIsWorldPanelOpen(false)}
        onLockedWorld={() => showFeedback('Completa el mundo anterior para desbloquearlo')}
      />

      <LevelTransition
        open={isTransitionOpen}
        score={runtime.score}
        capturedCount={runtime.capturedCatIds.length}
        totalCats={runtime.totalCats}
        targetScore={runtime.levelConfig.targetScore}
        onAdvance={onTransitionAdvance}
      />

      <MiniMap getRadarSnapshot={() => game3dRef.current?.getRadarSnapshot?.()} />
      <HealthBar current={runtime.health?.current ?? 3} max={runtime.health?.max ?? 3} />

      <PauseMenu
        isOpen={isPauseMenuOpen}
        audioEnabled={settings.audioEnabled}
        hapticsEnabled={settings.hapticsEnabled}
        onResume={() => {
          runtime.setIsPaused(false);
          setIsPauseMenuOpen(false);
        }}
        onRestart={() => {
          setIsPauseMenuOpen(false);
          runtime.startLevel(runtime.worldId, runtime.levelId);
        }}
        onHome={() => {
          setIsPauseMenuOpen(false);
          setScreen('splash');
        }}
        onSettings={() => setIsSettingsOpen(true)}
        onToggleAudio={() => setSettings((s) => ({ ...s, audioEnabled: !s.audioEnabled }))}
        onToggleHaptics={() => setSettings((s) => ({ ...s, hapticsEnabled: !s.hapticsEnabled }))}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onChange={setSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          setSettings((s) => ({ ...s, tutorialSeen: true }));
        }}
      />

      <LoadingScreen
        isOpen={isLoadingScreen}
        worldName={runtime.worldConfig.name}
        onComplete={() => setIsLoadingScreen(false)}
      />

      <DifficultySelector
        isOpen={isDifficultyOpen || allWorldsCompleted}
        current={runtime.difficulty}
        allCompleted={allWorldsCompleted}
        onSelect={(diff) => {
          runtime.setDifficulty(diff);
          setSettings((s) => ({ ...s, difficulty: diff }));
          setIsDifficultyOpen(false);
          if (allWorldsCompleted) {
            setAllWorldsCompleted(false);
            // Reiniciar desde mundo 1
            runtime.startLevel('world-1', 'nivel-1');
            setScreen('game');
          }
        }}
        onClose={() => setIsDifficultyOpen(false)}
      />

      <ShareProgressModal
        isOpen={isShareOpen}
        settings={settings}
        achievements={achievementsState}
        onClose={() => setIsShareOpen(false)}
      />

      <AchievementToast achievement={achievementToast} />
      {DEBUG_INPUT && (
        <pre data-game-ui="true" style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 99, background: 'rgba(0,0,0,.72)', color: '#fff', padding: 8, fontSize: 11 }}>
          {JSON.stringify({
            world: runtime.worldId,
            level: runtime.levelId,
            visibleCats,
            captured: runtime.capturedCatIds.length,
            nearestCatId: runtime.nearestCatId,
            nearestDist: runtime.nearestCatDistance
          }, null, 2)}
        </pre>
      )}
    </div>
  );
}
