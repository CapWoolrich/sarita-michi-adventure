import { Canvas, useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import ThirdPersonCamera from './ThirdPersonCamera';
import CatEntity3D from './CatEntity3D';

const DEBUG_CAMERA = false;

function SceneRuntime({ touchState, onPlayerPositionChange, onNearestCatChange, onCameraStateChange, captureRadius = 2, nearestCatIdRef, nearestInRangeRef, catCount = 8, captureStateRef }) {
  const characterRef = useRef();
  const cameraStateRef = useRef({ yaw: 0, pitch: 0.18, distance: 6.8, height: 3.2, smoothing: 0.14 });
  const [animState, setAnimState] = useState('idle');
  const cats = useMemo(() => Array.from({ length: catCount }, (_, i) => {
    const angle = (i / catCount) * Math.PI * 2 + Math.random() * 0.25;
    const radius = 10 + Math.random() * 12;
    return { id: i, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, phase: Math.random() * 10, color: ['#ffe7b8', '#dcc8ff', '#c5f1e6', '#ffd6ba'][i % 4] };
  }), [catCount]);

  useFrame((state, delta) => {
    const joy = touchState.current.joy;
    const look = touchState.current.look;
    if (look.dx !== 0 || look.dy !== 0) {
      cameraStateRef.current.yaw -= look.dx * 0.0075;
      cameraStateRef.current.pitch = THREE.MathUtils.clamp(cameraStateRef.current.pitch - look.dy * 0.0055, -0.35, 0.65);
      if (DEBUG_CAMERA) console.log('[camera] consume look', { dx: look.dx, dy: look.dy, yaw: cameraStateRef.current.yaw, pitch: cameraStateRef.current.pitch, active: look.active });
      look.dx = 0;
      look.dy = 0;
    }
    onCameraStateChange?.({ yaw: cameraStateRef.current.yaw, pitch: cameraStateRef.current.pitch });
    if (!characterRef.current) return;
    const strafeInput = THREE.MathUtils.clamp(joy.x, -1, 1);
    const forwardInput = THREE.MathUtils.clamp(-joy.y, -1, 1);
    const magnitude = Math.hypot(strafeInput, forwardInput);
    const deadzone = 0.1;
    const speed = magnitude < deadzone ? 0 : magnitude;
    const yaw = cameraStateRef.current.yaw;
    const cameraForward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
    const cameraRight = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
    const inputDir = new THREE.Vector3()
      .addScaledVector(cameraForward, speed ? forwardInput / Math.max(1, magnitude) : 0)
      .addScaledVector(cameraRight, speed ? strafeInput / Math.max(1, magnitude) : 0);
    if (inputDir.lengthSq() > 0.0001) {
      const dir = inputDir.normalize();
      characterRef.current.position.addScaledVector(dir, Math.min(5.1 * delta, 0.14));
      characterRef.current.position.x = THREE.MathUtils.clamp(characterRef.current.position.x, -36, 36);
      characterRef.current.position.z = THREE.MathUtils.clamp(characterRef.current.position.z, -36, 36);
      characterRef.current.rotation.y = THREE.MathUtils.lerp(characterRef.current.rotation.y, Math.atan2(dir.x, dir.z), 0.16);
      setAnimState('run');
    } else {
      setAnimState('idle');
    }

    const p = characterRef.current.position;
    onPlayerPositionChange?.({ x: p.x, y: p.y, z: p.z });
    let nearest = null;
    let nearestDist = Infinity;
    for (const cat of cats) {
      const d = Math.hypot(cat.x - p.x, 0.68 - p.y, cat.z - p.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = cat;
      }
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
    <ThirdPersonCamera targetRef={characterRef} cameraStateRef={cameraStateRef} />
  </>;
}

const Game3DCanvas = forwardRef(function Game3DCanvas({ touchState, onPlayerPositionChange, onNearestCatChange, onCameraStateChange, captureRadius, catCount = 8 }, ref) {
  const nearestCatIdRef = useRef(null);
  const nearestInRangeRef = useRef(false);
  const captureStateRef = useRef({ player: { x: 0, y: 0, z: 0 }, nearestCatId: null, nearestDistance: Infinity, inRange: false, capturedIds: new Set() });
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
  return <div style={{ position:'fixed', inset:0, zIndex:2, touchAction:'none', userSelect:'none', overscrollBehavior:'none' }}>
    <Canvas shadows dpr={[1,1.5]}>
      <SceneRuntime touchState={touchState} onPlayerPositionChange={onPlayerPositionChange} onNearestCatChange={handleNearestCatChange} onCameraStateChange={onCameraStateChange} captureRadius={captureRadius} nearestCatIdRef={nearestCatIdRef} nearestInRangeRef={nearestInRangeRef} catCount={catCount} captureStateRef={captureStateRef} />
    </Canvas>
  </div>;
});

export default Game3DCanvas;
