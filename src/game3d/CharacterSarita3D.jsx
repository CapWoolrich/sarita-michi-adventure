import { Suspense } from 'react';
import ChibiDoll from './ChibiDoll';

const CHARACTER_MODEL_FORWARD_OFFSET = 0;
const CHARACTER_MODEL_SCALE = 1;
const CHARACTER_MODEL_Y_OFFSET = 0;

export default function CharacterSarita3D({
  characterRef,
  animState,
  isMoving,
  outfitColor = null,
  hatColor = null,
  ...props
}) {
  const animation = animState === 'run' || animState === 'walk' || isMoving ? 'walk' : 'idle';

  return (
    <group ref={characterRef} {...props}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>

      <Suspense fallback={null}>
        <ChibiDoll
          animation={animation}
          position={[0, CHARACTER_MODEL_Y_OFFSET, 0]}
          rotation={[0, CHARACTER_MODEL_FORWARD_OFFSET, 0]}
          scale={CHARACTER_MODEL_SCALE}
          outfitColor={outfitColor}
          hatColor={hatColor}
        />
      </Suspense>
    </group>
  );
}
