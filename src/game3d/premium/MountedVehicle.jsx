import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/** Kart kawaii abierto, compartido entre jugador local y remoto. */
export function KartMesh({ color = '#ff66cc', colorRef = null }) {
  const matRef = useRef();
  const lastColorRef = useRef(color);
  useFrame(() => {
    if (!colorRef || !matRef.current) return;
    const next = colorRef.current?.color || color;
    if (next !== lastColorRef.current) {
      lastColorRef.current = next;
      matRef.current.color.set(next);
    }
  });
  return (
    <group>
      <mesh position={[0, 0.26, 0]} castShadow>
        <boxGeometry args={[1.1, 0.3, 1.8]} />
        <meshStandardMaterial ref={matRef} color={color} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.46, 0.72]} castShadow>
        <boxGeometry args={[0.9, 0.34, 0.4]} />
        <meshStandardMaterial color="#eaf6ff" roughness={0.25} metalness={0.1} />
      </mesh>
      {[[-0.62, 0.62], [0.62, 0.62], [-0.62, -0.62], [0.62, -0.62]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.16, 12]} />
          <meshStandardMaterial color="#2a2438" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0.3, 0.36, 0.92]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color="#fff7c8" toneMapped={false} />
      </mesh>
      <mesh position={[-0.3, 0.36, 0.92]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color="#fff7c8" toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Kart visual que sigue al jugador mientras el modo vehículo está activo.
 * Sin física: el movimiento sigue siendo el del personaje (con boost de
 * velocidad aplicado vía movementMultiplierRef en MissionChallengeLayer).
 */
export default function MountedVehicle({ characterRef, vehicleStateRef }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const v = vehicleStateRef?.current;
    const ch = characterRef?.current;
    const active = !!v?.active && Date.now() < (v?.until ?? 0) && !!ch;
    ref.current.visible = active;
    if (active) {
      ref.current.position.set(ch.position.x, 0.02, ch.position.z);
      ref.current.rotation.y = ch.rotation.y;
    }
  });
  return (
    <group ref={ref} visible={false}>
      <KartMesh colorRef={vehicleStateRef} />
    </group>
  );
}
