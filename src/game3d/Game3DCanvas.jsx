import { Canvas, useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import CatEntity3D from './CatEntity3D';
import useRobloxLikeControls from './useRobloxLikeControls';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

function SceneRuntime({ runtime, touchState, onPlayerPositionChange, onNearestCatChange, captureRadius = 2.2, captureStateRef, isPaused, isLevelComplete, onDebugUpdate, controlsApiRef, jumpRequestedRef, onStarCollected }) {
  const characterRef = useRef();
  const [animState, setAnimState] = useState('idle');

  const stars = useMemo(() => Array.from({ length: 16 + runtime.currentLevelIndex * 4 }, (_, i) => {
    const angle = (i / (16 + runtime.currentLevelIndex * 4)) * Math.PI * 2;
    return { id: `star-${runtime.currentLevelIndex}-${i}`, x: Math.cos(angle) * (9 + (i % 5) * 4), z: Math.sin(angle) * (8 + (i % 4) * 3), y: 0.5 + (i % 3) * 0.15 };
  }), [runtime.currentLevelIndex]);
  const collectedStarIdsRef = useRef(new Set());

  controlsApiRef.current = useRobloxLikeControls({ characterRef, touchState, isPaused, isLevelComplete, onDebugUpdate, speedMode: runtime.speedMode, jumpRequestedRef });

  useFrame(() => {
    if (!characterRef.current) return;
    const joy = touchState.current.joy || touchState.current.joystick;
    setAnimState((joy?.magnitude ?? 0) > 0.1 ? 'run' : 'idle');
    const p = characterRef.current.position;
    onPlayerPositionChange?.({ x: p.x, y: p.y, z: p.z });

    let nearest = null;
    let nearestDist = Infinity;
    const capturedSet = new Set(runtime.capturedCatIds);
    for (const cat of runtime.cats) {
      if (capturedSet.has(cat.id)) continue;
      const d = Math.hypot(cat.position[0] - p.x, cat.position[1] - p.y, cat.position[2] - p.z);
      if (d < nearestDist) { nearestDist = d; nearest = cat; }
    }

    for (const star of stars) {
      if (collectedStarIdsRef.current.has(star.id)) continue;
      const dist = Math.hypot(star.x - p.x, star.y - p.y, star.z - p.z);
      if (dist < 1.4) {
        collectedStarIdsRef.current.add(star.id);
        onStarCollected?.(star.id);
      }
    }

    const inRange = nearestDist <= captureRadius;
    captureStateRef.current = {
      player: { x: p.x, y: p.y, z: p.z },
      nearestCatId: nearest?.id ?? null,
      nearestDistance: nearestDist,
      inRange,
      cats: runtime.cats,
      capturedIds: new Set(runtime.capturedCatIds)
    };
    onNearestCatChange?.(nearest?.id ?? null, nearestDist, inRange);
  });

  return <>
    <WorldScene levelIndex={runtime.currentLevelIndex} />
    {runtime.cats.map((cat) => <CatEntity3D key={cat.id} cat={{ id: cat.id, x: cat.position[0], z: cat.position[2], phase: cat.seed, color: cat.color }} visible={!runtime.capturedCatIds.includes(cat.id)} highlight={captureStateRef.current.nearestCatId === cat.id} />)}
    {stars.map((star) => collectedStarIdsRef.current.has(star.id) ? null : <group key={star.id} position={[star.x, star.y, star.z]}><mesh><octahedronGeometry args={[0.18, 0]} /><meshStandardMaterial color="#ffe278" emissive="#ffd45c" emissiveIntensity={0.75} /></mesh></group>)}
    <CharacterSarita3D characterRef={characterRef} animState={animState} />
  </>;
}

const Game3DCanvas = forwardRef(function Game3DCanvas({ runtime, touchState, onPlayerPositionChange, onNearestCatChange, captureRadius = 2.2, isPaused = false, isLevelComplete = false, onStarCollected }, ref) {
  const controlsApiRef = useRef(null);
  const captureStateRef = useRef({ player: { x: 0, y: 0, z: 0 }, nearestCatId: null, nearestDistance: Infinity, inRange: false, cats: [], capturedIds: new Set() });
  const [debugState, setDebugState] = useState(null);
  const [lastCatchResult, setLastCatchResult] = useState(null);
  const jumpRequestedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    requestJump: () => { jumpRequestedRef.current = true; },
    getJumpDebugState: () => debugState,
    attemptCatch: () => {
      const state = captureStateRef.current;
      const cats = state.cats || [];
      const capturedSet = state.capturedIds || new Set();
      if (!cats.length) {
        const result = { success: false, reason: 'no_cat' };
        setLastCatchResult(result);
        return result;
      }
      const player = state.player || { x: 0, y: 0, z: 0 };
      let nearest = null;
      let nearestDistance = Infinity;
      for (const cat of cats) {
        if (capturedSet.has(cat.id)) continue;
        const distance = Math.hypot(cat.position[0] - player.x, cat.position[1] - player.y, cat.position[2] - player.z);
        if (distance < nearestDistance) { nearestDistance = distance; nearest = cat; }
      }
      if (!nearest) {
        const result = { success: false, reason: 'no_cat' };
        setLastCatchResult(result);
        return result;
      }
      if (nearestDistance > captureRadius) {
        const result = { success: false, reason: 'too_far', nearestCatId: nearest.id, distance: nearestDistance };
        setLastCatchResult(result);
        return result;
      }
      const result = { success: true, catId: nearest.id, distance: nearestDistance };
      setLastCatchResult(result);
      return result;
    }
  }), [captureRadius, debugState]);

  return <div className="gameplay-screen" style={{ position: 'fixed', inset: 0, zIndex: 2 }}>
    <Canvas shadows dpr={[1, 1.5]}>
      <SceneRuntime runtime={runtime} touchState={touchState} onPlayerPositionChange={onPlayerPositionChange} onNearestCatChange={onNearestCatChange} captureRadius={captureRadius} captureStateRef={captureStateRef} isPaused={isPaused} isLevelComplete={isLevelComplete} onDebugUpdate={DEBUG_INPUT ? setDebugState : undefined} controlsApiRef={controlsApiRef} jumpRequestedRef={jumpRequestedRef} onStarCollected={onStarCollected} />
    </Canvas>
    {DEBUG_INPUT && debugState && <div data-game-ui="true" style={{ position: 'fixed', right: 8, top: 96, zIndex: 95, background: 'rgba(0,0,0,.75)', color: '#fff', padding: 8, borderRadius: 8, fontSize: 11, fontFamily: 'monospace' }}>
      <div>grounded: {String(debugState.grounded)}</div>
      <div>isJumping: {String(debugState.isJumping)}</div>
      <div>verticalVelocity: {(debugState.verticalVelocity ?? 0).toFixed(3)}</div>
      <div>jumpOffset: {(debugState.jumpOffset ?? 0).toFixed(3)}</div>
      <div>lastCatchResult: {lastCatchResult ? JSON.stringify(lastCatchResult) : 'null'}</div>
    </div>}
  </div>;
});

export default Game3DCanvas;
