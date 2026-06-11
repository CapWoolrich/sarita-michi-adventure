import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import InteractiveProp from './InteractiveProp';

/**
 * Portal decorativo premium (NO es el portal de escape de misión).
 * Sin pointLight: brillo con materiales basic toneMapped=false.
 */
export default function PortalLite({
  position = [0, 0, 0],
  color = '#b57cff',
  innerColor = '#ffd066',
  scale = 1,
  playerPositionRef,
  onInteract
}) {
  const spinRef = useRef();
  useFrame(({ clock }) => {
    if (!spinRef.current) return;
    const t = clock.getElapsedTime();
    spinRef.current.rotation.y = t * 0.7;
    spinRef.current.position.y = 2.2 * scale + Math.sin(t * 1.6) * 0.14;
  });

  const visual = (
    <group scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[2.6, 3.0, 0.5, 8]} />
        <meshStandardMaterial color="#4a3f7a" roughness={0.6} />
      </mesh>
      <group ref={spinRef} position={[0, 2.2, 0]}>
        <mesh>
          <torusGeometry args={[1.8, 0.14, 12, 48]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.3, 0.08, 10, 36]} />
          <meshBasicMaterial color={innerColor} toneMapped={false} />
        </mesh>
        <mesh>
          <circleGeometry args={[1.2, 28]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} toneMapped={false} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.52, 0]}>
        <ringGeometry args={[2.0, 2.5, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );

  if (!onInteract) return <group position={position}>{visual}</group>;
  return (
    <InteractiveProp
      position={position}
      radius={3.4 * scale}
      cooldownMs={10000}
      hintColor={innerColor}
      hintY={4.4 * scale}
      playerPositionRef={playerPositionRef}
      onInteract={onInteract}
    >
      {visual}
    </InteractiveProp>
  );
}
