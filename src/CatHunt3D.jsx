import { useMemo, useRef, useState } from 'react';
import Game3DCanvas from './game3d/Game3DCanvas';
import MobileGameInputLayer from './game3d/MobileGameInputLayer';
import useGameRuntime from './game/useGameRuntime';
import GameHUD from './components/GameHUD';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

export default function CatHunt3D() {
  const runtime = useGameRuntime();
  const [screen, setScreen] = useState('game');
  const [mute, setMute] = useState(false);
  const [feedback, setFeedback] = useState('');
  const game3dRef = useRef(null);
  const touchState = useRef({ joystick: { x: 0, y: 0, magnitude: 0, active: false }, joy: { x: 0, y: 0, magnitude: 0, active: false }, look: { dx: 0, dy: 0 } });
  const visibleCats = useMemo(() => runtime.cats.filter((c) => !runtime.capturedCatIds.includes(c.id)).length, [runtime.cats, runtime.capturedCatIds]);

  const onCatch = () => {
    if (runtime.isLevelComplete) return;
    const result = game3dRef.current?.attemptCatch?.();
    if (result?.success) {
      runtime.captureCat(result.catId);
      setFeedback(`¡Atrapaste a un michi! +100`);
    } else {
      runtime.setLastCatchResult(result ?? { success: false, reason: 'no_cat' });
      setFeedback('Acércate un poquito más');
    }
  };

  if (screen !== 'game') return <button onClick={() => setScreen('game')}>Jugar</button>;
  return <div>
    <GameHUD levelName={runtime.levelConfig.name} worldName={runtime.levelConfig.worldName} capturedCount={runtime.capturedCatIds.length} totalCats={runtime.totalCats} score={runtime.score} timeLeft={runtime.timeLeft} isPaused={runtime.isPaused} onPause={() => runtime.setIsPaused((v) => !v)} onHome={() => setScreen('menu')} onAudio={() => setMute((m) => !m)} />
    <Game3DCanvas ref={game3dRef} touchState={touchState} cats={runtime.cats} capturedCatIds={runtime.capturedCatIds} isPaused={runtime.isPaused} isLevelComplete={runtime.isLevelComplete} speedMode={runtime.speedMode} levelIndex={runtime.currentLevelIndex} onNearestCatChange={(catId, distance) => runtime.setNearestCat({ catId, distance })} runtimeKey={`${runtime.currentLevelIndex}-${runtime.totalCats}`} />
    <MobileGameInputLayer touchState={touchState} speedMode={runtime.speedMode} onCatch={onCatch} onJump={() => game3dRef.current?.requestJump?.()} onToggleSpeed={runtime.toggleSpeedMode} />
    {feedback && <div style={{ position:'fixed', bottom:88, left:'50%', transform:'translateX(-50%)', zIndex:80, background:'#fff', padding:'8px 12px', borderRadius:10 }}>{feedback}</div>}
    {runtime.isLevelComplete && <div data-game-ui="true" style={{ position:'fixed', inset:0, zIndex:90, display:'grid', placeItems:'center', background:'rgba(13,15,26,.55)' }}><div style={{ background:'#fff', padding:18, borderRadius:14 }}><h2>Nivel completado</h2><button onClick={runtime.goToNextLevel}>Siguiente nivel</button></div></div>}
    {DEBUG_INPUT && <pre data-game-ui="true" style={{ position:'fixed', left:8, bottom:8, zIndex:99, background:'rgba(0,0,0,.72)', color:'#fff', padding:8, fontSize:11 }}>{JSON.stringify({ currentLevelIndex: runtime.currentLevelIndex, catsLength: runtime.cats.length, totalCats: runtime.totalCats, visibleCats, capturedCatIds: runtime.capturedCatIds, capturedCount: runtime.capturedCatIds.length, nearestCatId: runtime.nearestCatId, nearestCatDistance: runtime.nearestCatDistance, lastCatchResult: runtime.lastCatchResult, score: runtime.score, timeLeft: runtime.timeLeft, isLevelComplete: runtime.isLevelComplete, speedMode: runtime.speedMode }, null, 2)}</pre>}
  </div>;
}
