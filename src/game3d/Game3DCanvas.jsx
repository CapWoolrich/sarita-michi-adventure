import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import ThirdPersonCamera from './ThirdPersonCamera';
import CatEntity3D from './CatEntity3D';

function SceneRuntime({ touchState }) {
  const characterRef = useRef();
  const cameraStateRef = useRef({ yaw: 0, pitch: 0.2, distance: 7 });
  const [animState, setAnimState] = useState('idle');
  const cats = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ id: i, x: (Math.random()-0.5)*32, z: (Math.random()-0.5)*32, phase: Math.random()*10, color: ['#ffe7b8','#dcc8ff','#c5f1e6','#ffd6ba'][i%4] })), []);

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
      characterRef.current.rotation.y = THREE.MathUtils.lerp(characterRef.current.rotation.y, Math.atan2(dir.x, dir.z), 0.16);
      setAnimState('run');
    } else setAnimState('idle');
  });

  return <>
    <WorldScene />
    {cats.map((cat)=><CatEntity3D key={cat.id} cat={cat} visible />)}
    <CharacterSarita3D characterRef={characterRef} animState={animState} />
    <ThirdPersonCamera targetRef={characterRef} cameraStateRef={cameraStateRef} />
  </>;
}

export default function Game3DCanvas({ touchState }) {
  return <div style={{ position:'fixed', inset:0, zIndex:2 }}>
    <Canvas shadows dpr={[1,1.5]}>
      <SceneRuntime touchState={touchState} />
    </Canvas>
  </div>;
}
