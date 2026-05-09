import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function BellEntity3D({ bell, activated = false, playerPositionRef, onActivate }) {
  const groupRef = useRef();
  const firedRef = useRef(false);

  useFrame(({ clock }) => {
    if (!groupRef.current || activated) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 1.25;
    groupRef.current.position.y = bell.position[1] + Math.sin(t * 2.4 + bell.position[0]) * 0.16;

    const player = playerPositionRef.current;
    if (!player || firedRef.current) return;
    const dx = bell.position[0] - player.x;
    const dz = bell.position[2] - player.z;
    if (Math.hypot(dx, dz) <= 2.2) {
      firedRef.current = true;
      onActivate?.(bell.id);
    }
  });

  if (activated) return null;

  return (
    <group ref={groupRef} position={bell.position} scale={1.15}>
      <mesh position={[0, -0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.8, 32]} />
        <meshBasicMaterial color="#ffd066" transparent opacity={0.42} toneMapped={false} />
      </mesh>
      <mesh castShadow>
        <sphereGeometry args={[0.28, 18, 14]} />
        <meshStandardMaterial color="#ffd066" emissive="#ffc04d" emissiveIntensity={0.28} roughness={0.36} metalness={0.22} />
      </mesh>
      <mesh position={[0, -0.23, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.32, 0.36, 18]} />
        <meshStandardMaterial color="#ffb347" emissive="#ffcc66" emissiveIntensity={0.2} roughness={0.42} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <torusGeometry args={[0.17, 0.035, 8, 24]} />
        <meshStandardMaterial color="#fff4c9" roughness={0.32} metalness={0.45} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshBasicMaterial color="#fff7de" toneMapped={false} />
      </mesh>
      <pointLight color="#ffd066" intensity={0.9} distance={5} />
    </group>
  );
}
