import { Canvas, useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import CatEntity3D from './CatEntity3D';
import useRobloxLikeControls from './useRobloxLikeControls';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

function SceneRuntime({ touchState, onPlayerPositionChange, onNearestCatChange, captureRadius = 2, nearestCatIdRef, nearestInRangeRef, catCount = 8, captureStateRef, isPaused, isLevelComplete, onDebugUpdate, controlsApiRef, capturedCatIds = [], speedMode = 'normal', jumpRequestedRef, levelIndex = 0, onStarCollected }) {
  const characterRef = useRef();
  const [animState, setAnimState] = useState('idle');
  const cats = useMemo(() => Array.from({ length: catCount }, (_, i) => {
    const angle = (i / catCount) * Math.PI * 2 + Math.sin(i * 2.3) * 0.24;
    const radius = 12 + (i % 3) * 3 + Math.cos(i * 1.9) * 1.2;
    const x = Math.max(-30, Math.min(30, Math.cos(angle) * radius));
    const z = Math.max(-30, Math.min(30, Math.sin(angle) * radius));
    return { id: i, x, z, phase: i * 1.7, color: ['#ffe7b8', '#dcc8ff', '#c5f1e6', '#ffd6ba'][i % 4] };
  }), [catCount]);
  const stars = useMemo(() => Array.from({ length: 10 + levelIndex * 2 }, (_, i) => {
    const angle = (i / (10 + levelIndex * 2)) * Math.PI * 2;
    return { id: i, x: Math.cos(angle) * (7 + (i % 5) * 4), z: Math.sin(angle) * (8 + (i % 4) * 3), y: 0.5 + (i % 3) * 0.15 };
  }), [levelIndex]);
  const collectedStarIdsRef = useRef(new Set());

  controlsApiRef.current = useRobloxLikeControls({ characterRef, touchState, isPaused, isLevelComplete, onDebugUpdate, speedMode, jumpRequestedRef });

  useFrame(() => {
    if (!characterRef.current) return;
    const joy = touchState.current.joy || touchState.current.joystick;
    setAnimState((joy?.magnitude ?? 0) > 0.1 ? 'run' : 'idle');
    const p = characterRef.current.position;
    onPlayerPositionChange?.({ x: p.x, y: p.y, z: p.z });
    let nearest = null;
    let nearestDist = Infinity;
    const capturedSet = new Set(capturedCatIds);
    for (const cat of cats) {
      if (capturedSet.has(cat.id)) continue;
      const d = Math.hypot(cat.x - p.x, 0.7 - p.y, cat.z - p.z);
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
    captureStateRef.current.player = { x: p.x, y: p.y, z: p.z };
    captureStateRef.current.cats = cats;
    captureStateRef.current.capturedIds = new Set(capturedCatIds);
    captureStateRef.current.nearestCatId = nearest?.id ?? null;
    captureStateRef.current.nearestDistance = nearestDist;
    captureStateRef.current.inRange = inRange;
    nearestCatIdRef.current = nearest?.id ?? null;
    nearestInRangeRef.current = inRange;
    onNearestCatChange?.(nearest?.id ?? null, nearestDist, inRange);
  });

  return <>
    <WorldScene levelIndex={levelIndex} />
    {cats.map((cat)=><CatEntity3D key={cat.id} cat={cat} visible={!captureStateRef.current.capturedIds.has(cat.id)} highlight={nearestCatIdRef.current === cat.id} />)}
    {stars.map((star) => collectedStarIdsRef.current.has(star.id) ? null : <group key={`star-${star.id}`} position={[star.x, star.y, star.z]}>
      <mesh><octahedronGeometry args={[0.18, 0]} /><meshStandardMaterial color="#ffe278" emissive="#ffd45c" emissiveIntensity={0.75} /></mesh>
      <mesh rotation={[0, 0.8, 0]}><octahedronGeometry args={[0.11, 0]} /><meshBasicMaterial color="#fff0a9" transparent opacity={0.85} /></mesh>
    </group>)}
    <CharacterSarita3D characterRef={characterRef} animState={animState} />
  </>;
}

const Game3DCanvas = forwardRef(function Game3DCanvas({ touchState, onPlayerPositionChange, onNearestCatChange, captureRadius, catCount = 8, isPaused = false, isLevelComplete = false, capturedCatIds = [], speedMode = 'normal', jumpNonce = 0, levelIndex = 0, onStarCollected }, ref) {
  const nearestCatIdRef = useRef(null);
  const nearestInRangeRef = useRef(false);
  const controlsApiRef = useRef(null);
  const captureStateRef = useRef({ player: { x: 0, y: 0, z: 0 }, nearestCatId: null, nearestDistance: Infinity, inRange: false, capturedIds: new Set() });
  const [debugState, setDebugState] = useState(null);
  const [lastCatchResult, setLastCatchResult] = useState(null);
  const jumpRequestedRef = useRef(false);

  if (jumpNonce > 0) jumpRequestedRef.current = true;
  const handleNearestCatChange = (id, distance, isInRange) => {
    nearestCatIdRef.current = id;
    nearestInRangeRef.current = isInRange;
    onNearestCatChange?.(id, distance, isInRange);
  };
  useImperativeHandle(ref, () => ({
    getNearestCat: () => ({ id: captureStateRef.current.nearestCatId, distance: captureStateRef.current.nearestDistance, isInRange: captureStateRef.current.inRange }),
    triggerCatchAnimation: () => true,
    requestJump: () => { jumpRequestedRef.current = true; },
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
        const distance = Math.hypot(cat.x - player.x, 0.7 - player.y, cat.z - player.z);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = cat;
        }
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
  }), [captureRadius]);;

  return <div className="gameplay-screen" style={{ position:'fixed', inset:0, zIndex:2 }}>
    <Canvas shadows dpr={[1,1.5]}>
      <SceneRuntime touchState={touchState} onPlayerPositionChange={onPlayerPositionChange} onNearestCatChange={handleNearestCatChange} captureRadius={captureRadius} nearestCatIdRef={nearestCatIdRef} nearestInRangeRef={nearestInRangeRef} catCount={catCount} captureStateRef={captureStateRef} isPaused={isPaused} isLevelComplete={isLevelComplete} onDebugUpdate={DEBUG_INPUT ? setDebugState : undefined} controlsApiRef={controlsApiRef} capturedCatIds={capturedCatIds} speedMode={speedMode} jumpRequestedRef={jumpRequestedRef} levelIndex={levelIndex} onStarCollected={onStarCollected} />
    </Canvas>
    {DEBUG_INPUT && debugState && <div data-game-ui="true" style={{ position:'fixed', right:8, top:96, zIndex:95, background:'rgba(0,0,0,.75)', color:'#fff', padding:8, borderRadius:8, fontSize:11, fontFamily:'monospace' }}>
      <div>joy.x: {(debugState.joy?.x ?? 0).toFixed(2)}</div><div>joy.y: {(debugState.joy?.y ?? 0).toFixed(2)}</div><div>joy.magnitude: {(debugState.joy?.magnitude ?? 0).toFixed(2)}</div>
      <div>cameraYaw: {debugState.cameraYaw.toFixed(3)}</div><div>cameraPitch: {debugState.cameraPitch.toFixed(3)}</div>
      <div>lookTouchId: {String(debugState.lookTouchId)}</div><div>lastLookX: {debugState.lastLookX.toFixed(1)}</div><div>lastLookY: {debugState.lastLookY.toFixed(1)}</div>
      <div>lookMoveCount: {debugState.lookMoveCount}</div><div>cameraApplyCount: {debugState.cameraApplyCount}</div>
      <div>playerPosition: {debugState.playerPosition.x.toFixed(2)}, {debugState.playerPosition.y.toFixed(2)}, {debugState.playerPosition.z.toFixed(2)}</div>
      <div>playerRotation: {debugState.playerRotation.toFixed(3)}</div>
      <div>totalCats: {catCount}</div><div>visibleCats: {catCount - capturedCatIds.length}</div><div>captured: {capturedCatIds.length}/{catCount}</div>
      <div>nearestCatId: {String(captureStateRef.current.nearestCatId)}</div>
      <div>nearestCatDistance: {Number.isFinite(captureStateRef.current.nearestDistance) ? captureStateRef.current.nearestDistance.toFixed(2) : '∞'}</div>
      <div>isCatInCaptureRange: {String(captureStateRef.current.inRange)}</div>
      <div>lastCatchResult: {lastCatchResult ? JSON.stringify(lastCatchResult) : 'null'}</div>
      <div>speedMode: {speedMode}</div>
      <div>grounded: {String(debugState.grounded)}</div><div>isJumping: {String(debugState.isJumping)}</div><div>verticalVelocity: {(debugState.verticalVelocity ?? 0).toFixed(3)}</div>
      <div style={{ display:'flex', gap:6, marginTop:6 }}>
        <button data-game-ui="true" onClick={() => controlsApiRef.current?.adjustYaw?.(-0.25)}>Yaw -</button>
        <button data-game-ui="true" onClick={() => controlsApiRef.current?.adjustYaw?.(0.25)}>Yaw +</button>
      </div>
    </div>}
  </div>;
});

export default Game3DCanvas;
