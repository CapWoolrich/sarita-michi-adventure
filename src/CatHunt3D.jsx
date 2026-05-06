import { useEffect, useMemo, useRef, useState } from 'react';
import Game3DCanvas from './game3d/Game3DCanvas';
import MobileGameInputLayer from './game3d/MobileGameInputLayer';
import useGameRuntime from './game/useGameRuntime';
import PremiumGameHUD from './game/components/PremiumGameHUD';
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

  // Detecta nivel completado → abre transición auto
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
      // sin texto: la animación 3D se encarga
    } else {
      runtime.setLastCatchResult(result ?? { success: false, reason: 'no_cat' });
      setFeedback('Acércate un poquito más');
      setTimeout(() => setFeedback(''), 1200);
    }
  };

  const onLocateCat = () => {
    // Toggle entre apuntar al gato más cercano y abrir mapa de mundos
    if (runtime.nearestCatId) {
      setFeedback('🎯 Gato más cercano detectado');
      setTimeout(() => setFeedback(''), 1100);
    } else {
      setIsWorldPanelOpen(true);
    }
  };

  const onTransitionAdvance = () => {
    setIsTransitionOpen(false);
    runtime.goToNextLevel?.();
  };

  // SPLASH SCREEN
  if (screen === 'splash') {
    return (
      <SplashScreen
        hasProgress={(runtime.progress?.unlockedWorldIds?.length ?? 0) > 1}
        onStart={() => setScreen('game')}
        onContinue={() => setScreen('game')}
        onCollection={() => setFeedback('Próximamente: Colección de michis')}
        onHowToPlay={() => setFeedback('Mueve el joystick · Toca Atrapar al acercarte a un michi')}
        onCredits={() => setFeedback('Creado por Bernard y Sarita 💜')}
        onAchievements={() => setFeedback('Próximamente: Logros')}
      />
    );
  }

  return (
    <div>
      <PremiumGameHUD
        capturedCount={runtime.capturedCatIds.length}
        totalCats={runtime.totalCats}
        score={runtime.score}
        timeLeft={runtime.timeLeft}
        worldIndex={runtime.worldConfig.order}
        worldName={runtime.worldConfig.name}
        levelName={runtime.levelConfig.id.replace('-', ' ')}
        isPaused={runtime.isPaused}
        isMuted={mute}
        onPause={() => runtime.setIsPaused((v) => !v)}
        onHome={() => setScreen('splash')}
        onAudio={() => setMute((m) => !m)}
        onOpenWorlds={() => setIsWorldPanelOpen(true)}
        onLocateCat={onLocateCat}
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
        onSelectWorld={runtime.goToWorld}
        onClose={() => setIsWorldPanelOpen(false)}
        onLockedWorld={() => {
          setFeedback('Completa el mundo anterior para desbloquearlo');
          setTimeout(() => setFeedback(''), 1500);
        }}
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
            runtimeCatsLength: runtime.cats.length,
            runtimeTotalCats: runtime.totalCats,
            visibleCats,
            capturedCatIds: runtime.capturedCatIds,
            nearestCatId: runtime.nearestCatId,
            nearestCatDistance: runtime.nearestCatDistance,
            lastCatchResult: runtime.lastCatchResult
          }, null, 2)}
        </pre>
      )}
    </div>
  );
}
