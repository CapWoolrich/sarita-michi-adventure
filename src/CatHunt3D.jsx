import { useEffect, useMemo, useRef, useState } from 'react';
import Game3DCanvas from './game3d/Game3DCanvas';
import MobileGameInputLayer from './game3d/MobileGameInputLayer';
import useGameRuntime from './game/useGameRuntime';
import MinimalHUD from './game/components/MinimalHUD';
import LevelIntroCard from './game/components/LevelIntroCard';
import WorldMapPanel from './game/components/WorldMapPanel';
import SplashScreen from './game/components/SplashScreen';
import LevelTransition from './game/components/LevelTransition';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

export default function CatHunt3D() {
  const runtime = useGameRuntime();
  const [screen, setScreen] = useState('splash'); // splash | game
  const [mute, setMute] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isWorldPanelOpen, setIsWorldPanelOpen] = useState(false);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const game3dRef = useRef(null);
  const touchState = useRef({
    joystick: { x: 0, y: 0, magnitude: 0, active: false },
    joy: { x: 0, y: 0, magnitude: 0, active: false },
    look: { dx: 0, dy: 0 }
  });

  const visibleCats = useMemo(() => runtime.cats.filter((c) => !runtime.capturedCatIds.includes(c.id)).length, [runtime.cats, runtime.capturedCatIds]);

  // Detecta nivel completado → abre transición
  useEffect(() => {
    if (runtime.isLevelComplete && !isTransitionOpen) {
      setIsTransitionOpen(true);
    }
  }, [runtime.isLevelComplete, isTransitionOpen]);

  const onCatch = () => {
    if (runtime.isLevelComplete) return;
    const result = game3dRef.current?.attemptCatch?.();
    if (result?.success) {
      runtime.captureCat(result.catId);
    } else {
      runtime.setLastCatchResult(result ?? { success: false, reason: 'no_cat' });
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
          onCollection={() => showFeedback('Próximamente: Colección de michis')}
          onHowToPlay={() => showFeedback('Mueve el joystick · Toca Atrapar al acercarte a un michi')}
          onCredits={() => showFeedback('Creado por Bernard y Sarita 💜')}
          onAchievements={() => showFeedback('Próximamente: Logros')}
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
