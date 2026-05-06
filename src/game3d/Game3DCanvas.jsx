import { Canvas, useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import CatEntity3D from './CatEntity3D';
import useRobloxLikeControls from './useRobloxLikeControls';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

function SceneRuntime({ touchState, onPlayerPositionChange, onNearestCatChange, captureRadius = 2, nearestCatIdRef, nearestInRangeRef, catCount = 8, captureStateRef, isPaused, isLevelComplete, onDebugUpdate, controlsApiRef }) {
  const characterRef = useRef();
  const [animState, setAnimState] = useState('idle');
  const cats = useMemo(() => Array.from({ length: catCount }, (_, i) => {
    const angle = (i / catCount) * Math.PI * 2 + Math.random() * 0.25;
    const radius = 10 + Math.random() * 12;
    return { id: i, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, phase: Math.random() * 10, color: ['#ffe7b8', '#dcc8ff', '#c5f1e6', '#ffd6ba'][i % 4] };
  }), [catCount]);

  controlsApiRef.current = useRobloxLikeControls({ characterRef, touchState, isPaused, isLevelComplete, onDebugUpdate });

  useFrame(() => {
    if (!characterRef.current) return;
    const joy = touchState.current.joy || touchState.current.joystick;
    setAnimState((joy?.magnitude ?? 0) > 0.1 ? 'run' : 'idle');
    const p = characterRef.current.position;
    onPlayerPositionChange?.({ x: p.x, y: p.y, z: p.z });
    let nearest = null;
    let nearestDist = Infinity;
    for (const cat of cats) {
      const d = Math.hypot(cat.x - p.x, 0.68 - p.y, cat.z - p.z);
      if (d < nearestDist) { nearestDist = d; nearest = cat; }
    }
    const inRange = nearestDist <= captureRadius;
    captureStateRef.current.player = { x: p.x, y: p.y, z: p.z };
    captureStateRef.current.nearestCatId = nearest?.id ?? null;
    captureStateRef.current.nearestDistance = nearestDist;
    captureStateRef.current.inRange = inRange;
    nearestCatIdRef.current = nearest?.id ?? null;
    nearestInRangeRef.current = inRange;
    onNearestCatChange?.(nearest?.id ?? null, nearestDist, inRange);
  });

  return <>
    <WorldScene />
    {cats.map((cat)=><CatEntity3D key={cat.id} cat={cat} visible={!captureStateRef.current.capturedIds.has(cat.id)} highlight={nearestCatIdRef.current === cat.id && nearestInRangeRef.current} />)}
    <CharacterSarita3D characterRef={characterRef} animState={animState} />
  </>;
}

const Game3DCanvas = forwardRef(function Game3DCanvas({ touchState, onPlayerPositionChange, onNearestCatChange, captureRadius, catCount = 8, isPaused = false, isLevelComplete = false }, ref) {
  const nearestCatIdRef = useRef(null);
  const nearestInRangeRef = useRef(false);
  const controlsApiRef = useRef(null);
  const captureStateRef = useRef({ player: { x: 0, y: 0, z: 0 }, nearestCatId: null, nearestDistance: Infinity, inRange: false, capturedIds: new Set() });
  const [debugState, setDebugState] = useState(null);
  const handleNearestCatChange = (id, distance, isInRange) => {
    nearestCatIdRef.current = id;
    nearestInRangeRef.current = isInRange;
    onNearestCatChange?.(id, distance, isInRange);
  };
  useImperativeHandle(ref, () => ({
    getNearestCat: () => ({ id: captureStateRef.current.nearestCatId, distance: captureStateRef.current.nearestDistance, isInRange: captureStateRef.current.inRange }),
    triggerCatchAnimation: () => true,
    attemptCatch: () => {
      const nearestId = captureStateRef.current.nearestCatId;
      if (nearestId == null) return { success: false, reason: 'no_cat' };
      if (captureStateRef.current.capturedIds.has(nearestId)) return { success: false, reason: 'already_captured', catId: nearestId };
      if (!captureStateRef.current.inRange) return { success: false, reason: 'too_far', nearestCatId: nearestId, distance: captureStateRef.current.nearestDistance };
      captureStateRef.current.capturedIds.add(nearestId);
      return { success: true, catId: nearestId, distance: captureStateRef.current.nearestDistance };
    }
  }), []);

  return <div className="gameplay-screen" style={{ position:'fixed', inset:0, zIndex:2 }}>
    <Canvas shadows dpr={[1,1.5]}>
      <SceneRuntime touchState={touchState} onPlayerPositionChange={onPlayerPositionChange} onNearestCatChange={handleNearestCatChange} captureRadius={captureRadius} nearestCatIdRef={nearestCatIdRef} nearestInRangeRef={nearestInRangeRef} catCount={catCount} captureStateRef={captureStateRef} isPaused={isPaused} isLevelComplete={isLevelComplete} onDebugUpdate={DEBUG_INPUT ? setDebugState : undefined} controlsApiRef={controlsApiRef} />
    </Canvas>
    {DEBUG_INPUT && debugState && <div data-game-ui="true" style={{ position:'fixed', right:8, top:96, zIndex:95, background:'rgba(0,0,0,.75)', color:'#fff', padding:8, borderRadius:8, fontSize:11, fontFamily:'monospace' }}>
      <div>joy.x: {(debugState.joy?.x ?? 0).toFixed(2)}</div><div>joy.y: {(debugState.joy?.y ?? 0).toFixed(2)}</div><div>joy.magnitude: {(debugState.joy?.magnitude ?? 0).toFixed(2)}</div>
      <div>cameraYaw: {debugState.cameraYaw.toFixed(3)}</div><div>cameraPitch: {debugState.cameraPitch.toFixed(3)}</div>
      <div>lookTouchId: {String(debugState.lookTouchId)}</div><div>lastLookX: {debugState.lastLookX.toFixed(1)}</div><div>lastLookY: {debugState.lastLookY.toFixed(1)}</div>
      <div>lookMoveCount: {debugState.lookMoveCount}</div><div>cameraApplyCount: {debugState.cameraApplyCount}</div>
      <div>playerPosition: {debugState.playerPosition.x.toFixed(2)}, {debugState.playerPosition.y.toFixed(2)}, {debugState.playerPosition.z.toFixed(2)}</div>
      <div>playerRotation: {debugState.playerRotation.toFixed(3)}</div>
      <div style={{ display:'flex', gap:6, marginTop:6 }}>
        <button data-game-ui="true" onClick={() => controlsApiRef.current?.adjustYaw?.(-0.25)}>Yaw -</button>
        <button data-game-ui="true" onClick={() => controlsApiRef.current?.adjustYaw?.(0.25)}>Yaw +</button>
      </div>
    </div>}
  </div>;
});

export default Game3DCanvas;
