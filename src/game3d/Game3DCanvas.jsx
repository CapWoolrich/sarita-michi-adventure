import { Canvas, useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import CatEntity3D from './CatEntity3D';
import useRobloxLikeControls from './useRobloxLikeControls';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

function SceneRuntime({ touchState, cats, capturedCatIds, captureStateRef, isPaused, isLevelComplete, onNearestCatChange, onDebugUpdate, speedMode, jumpRequestedRef, levelIndex }) {
  const characterRef = useRef();
  useRobloxLikeControls({ characterRef, touchState, isPaused, isLevelComplete, onDebugUpdate, speedMode, jumpRequestedRef });
  useFrame(() => {
    if (!characterRef.current) return;
    const p = characterRef.current.position;
    let nearestCat = null; let nearestDistance = Infinity;
    for (const cat of cats) {
      if (capturedCatIds.includes(cat.id)) continue;
      const distance = Math.hypot(cat.position[0] - p.x, cat.position[1] - p.y, cat.position[2] - p.z);
      if (distance < nearestDistance) { nearestDistance = distance; nearestCat = cat; }
    }
    captureStateRef.current = { player: { x: p.x, y: p.y, z: p.z }, nearestCat, nearestDistance };
    onNearestCatChange?.(nearestCat?.id ?? null, nearestDistance, nearestDistance <= 2.6);
  });
  return <>
    <WorldScene levelIndex={levelIndex} />
    {cats.map((cat) => capturedCatIds.includes(cat.id) ? null : <CatEntity3D key={cat.id} cat={{ id: cat.id, x: cat.position[0], z: cat.position[2], color: cat.color }} visible />)}
    <CharacterSarita3D characterRef={characterRef} animState="run" />
  </>;
}

export default forwardRef(function Game3DCanvas({ touchState, cats, capturedCatIds, isPaused, isLevelComplete, speedMode, levelIndex, onNearestCatChange }, ref) {
  const localTouchState = useRef({ joystick:{x:0,y:0,magnitude:0,active:false}, joy: { x: 0, y: 0, magnitude: 0 }, look: { dx: 0, dy: 0 } });
  const stateRef = touchState || localTouchState;
  const captureStateRef = useRef({}); const jumpRequestedRef = useRef(false); const [debugState, setDebugState] = useState({});
  useImperativeHandle(ref, () => ({
    requestJump: () => { jumpRequestedRef.current = true; },
    attemptCatch: () => {
      const { nearestCat, nearestDistance } = captureStateRef.current;
      if (!nearestCat) return { success: false, reason: 'no_cat' };
      if (nearestDistance > 2.6) return { success: false, reason: 'too_far', nearestCatId: nearestCat.id, distance: nearestDistance };
      return { success: true, catId: nearestCat.id, distance: nearestDistance };
    }
  }), []);
  return <div style={{ position:'fixed', inset:0 }}><Canvas><SceneRuntime touchState={stateRef} cats={cats} capturedCatIds={capturedCatIds} captureStateRef={captureStateRef} isPaused={isPaused} isLevelComplete={isLevelComplete} onNearestCatChange={onNearestCatChange} onDebugUpdate={DEBUG_INPUT ? setDebugState : undefined} speedMode={speedMode} jumpRequestedRef={jumpRequestedRef} levelIndex={levelIndex} /></Canvas>
  {DEBUG_INPUT && <pre style={{ position:'fixed', top:88, right:6, zIndex:99, background:'#0009', color:'#fff', fontSize:10 }}>{JSON.stringify(debugState, null, 2)}</pre>}</div>;
});
