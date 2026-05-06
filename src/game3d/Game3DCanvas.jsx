import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import ThirdPersonCamera from './ThirdPersonCamera';
import CatEntity3D from './CatEntity3D';

function SceneRuntime({ touchState, onPlayerPositionChange, onNearestCatChange, captureRadius = 2, nearestCatIdRef, nearestInRangeRef }) {
  const characterRef = useRef();
  const cameraStateRef = useRef({ yaw: 0, pitch: 0.2, distance: 7 });
  const [animState, setAnimState] = useState('idle');
  const cats = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.25;
    const radius = 10 + Math.random() * 12;
    return { id: i, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, phase: Math.random() * 10, color: ['#ffe7b8', '#dcc8ff', '#c5f1e6', '#ffd6ba'][i % 4] };
  }), []);

  useFrame((_, delta) => {
    const joy = touchState.current.joy;
    const look = touchState.current.look;
    cameraStateRef.current.yaw -= look.dx * 0.004;
    cameraStateRef.current.pitch = THREE.MathUtils.clamp(cameraStateRef.current.pitch - look.dy * 0.003, -0.45, 0.55);
    look.dx = 0; look.dy = 0;
    if (!characterRef.current) return;
    const forward = new THREE.Vector3(Math.sin(cameraStateRef.current.yaw),0,Math.cos(cameraStateRef.current.yaw));
    const right = new THREE.Vector3(forward.z,0,-forward.x);
    const dir = forward.multiplyScalar(joy.y).add(right.multiplyScalar(joy.x));
    const speed = dir.length();
    if (speed > 0.01) {
      dir.normalize();
      characterRef.current.position.addScaledVector(dir, Math.min(4.6 * delta, 0.12));
      characterRef.current.position.x = THREE.MathUtils.clamp(characterRef.current.position.x, -36, 36);
      characterRef.current.position.z = THREE.MathUtils.clamp(characterRef.current.position.z, -36, 36);
      characterRef.current.rotation.y = THREE.MathUtils.lerp(characterRef.current.rotation.y, Math.atan2(dir.x, dir.z), 0.16);
      setAnimState('run');
    } else setAnimState('idle');

    const p = characterRef.current.position;
    onPlayerPositionChange?.({ x: p.x, y: p.y, z: p.z });
    let nearest = null;
    let nearestDist = Infinity;
    for (const cat of cats) {
      const d = Math.hypot(cat.x - p.x, cat.z - p.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = cat;
      }
    }
    const inRange = nearestDist <= captureRadius;
    nearestCatIdRef.current = nearest?.id ?? null;
    nearestInRangeRef.current = inRange;
    onNearestCatChange?.(nearest?.id ?? null, nearestDist, inRange);
  });

  return <>
    <WorldScene />
    {cats.map((cat)=><CatEntity3D key={cat.id} cat={cat} visible highlight={nearestCatIdRef.current === cat.id && nearestInRangeRef.current} />)}
    <CharacterSarita3D characterRef={characterRef} animState={animState} />
    <ThirdPersonCamera targetRef={characterRef} cameraStateRef={cameraStateRef} />
  </>;
}

export default function Game3DCanvas({ touchState, onPlayerPositionChange, onNearestCatChange, captureRadius }) {
  const nearestCatIdRef = useRef(null);
  const nearestInRangeRef = useRef(false);
  const handleNearestCatChange = (id, distance, isInRange) => {
    nearestCatIdRef.current = id;
    nearestInRangeRef.current = isInRange;
    onNearestCatChange?.(id, distance, isInRange);
  };
  return <div style={{ position:'fixed', inset:0, zIndex:2 }}>
    <Canvas shadows dpr={[1,1.5]}>
      <SceneRuntime touchState={touchState} onPlayerPositionChange={onPlayerPositionChange} onNearestCatChange={handleNearestCatChange} captureRadius={captureRadius} nearestCatIdRef={nearestCatIdRef} nearestInRangeRef={nearestInRangeRef} />
    </Canvas>
  </div>;
}
