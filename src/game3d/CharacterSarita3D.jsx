import { Suspense } from 'react';
import KawaiiDoll from './KawaiiDoll';

const CHARACTER_MODEL_FORWARD_OFFSET = 0; // GLB already faces forward; 0 keeps walking aligned with movement

export default function CharacterSarita3D({ characterRef, animState }) {
  const animation = animState === 'run' ? 'walk' : 'idle';

  return <group ref={characterRef} position={[0, 0, 0]}>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.78, 30]} />
      <meshBasicMaterial color="#000" transparent opacity={0.2} />
    </mesh>
    <Suspense fallback={null}>
      <KawaiiDoll animation={animation} position={[0, 0, 0]} rotation={[0, CHARACTER_MODEL_FORWARD_OFFSET, 0]} scale={1.1} />
    </Suspense>
  </group>;
}
