import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Renderizado de un jugador remoto en la escena 3D.
 * Usa una versión simplificada del personaje (chibi simple) con tinte por color del jugador.
 * Posición se actualiza desde el peerSession via prop posRef.
 */
export default function RemotePlayer({ peerId, name, color = '#ffd6c5', outfitColor = '#c084fc', position, rotation = 0 }) {
  const groupRef = useRef();
  const lastPosRef = useRef({ x: position?.x ?? 0, z: position?.z ?? 0, ry: rotation });

  useFrame(() => {
    if (!groupRef.current) return;
    // Lerp suave hacia la posición remota (smoothing)
    const target = position ?? lastPosRef.current;
    lastPosRef.current.x = THREE.MathUtils.lerp(lastPosRef.current.x, target.x ?? 0, 0.15);
    lastPosRef.current.z = THREE.MathUtils.lerp(lastPosRef.current.z, target.z ?? 0, 0.15);
    lastPosRef.current.ry = THREE.MathUtils.lerp(lastPosRef.current.ry, rotation ?? 0, 0.15);
    groupRef.current.position.set(lastPosRef.current.x, 0.5, lastPosRef.current.z);
    groupRef.current.rotation.y = lastPosRef.current.ry;
  });

  return (
    <group ref={groupRef}>
      {/* Cuerpo simple */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.6, 6, 12]} />
        <meshStandardMaterial color={outfitColor} roughness={0.6} />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.36, 16, 14]} />
        <meshStandardMaterial color="#ffd9c0" roughness={0.7} />
      </mesh>
      {/* Pelo */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <sphereGeometry args={[0.4, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.9} />
      </mesh>
      {/* Ojos */}
      <mesh position={[0.13, 0.7, 0.32]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[-0.13, 0.7, 0.32]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      {/* Sombrero/lazo color del jugador */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Anillo de jugador remoto en suelo */}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      {/* Nombre flotante */}
      {/* drei Html sería ideal pero evitamos dependencia, usamos sprite de plano */}
    </group>
  );
}
