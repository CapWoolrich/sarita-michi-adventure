import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const BASE_SCALE = 1.9;

export default function CatEntity3D({ cat, visible, highlight = false, debugLabel = '', showDebugMarker = false, distance = null }) {
  const ref = useRef();
  const tailRef = useRef();
  const earL = useRef();
  const earR = useRef();
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + (cat.phase ?? 0);
    ref.current.position.y = (cat.y ?? 0.72) + Math.sin(t * 2.2) * 0.14;
    ref.current.rotation.y = Math.sin(t * 0.8) * 0.26;
    if (tailRef.current) tailRef.current.rotation.y = 0.6 + Math.sin(t * 3.4) * 0.45;
    if (earL.current) earL.current.rotation.z = 0.25 + Math.sin(t * 2.5) * 0.06;
    if (earR.current) earR.current.rotation.z = -0.25 - Math.sin(t * 2.5) * 0.06;
    const pulse = highlight ? 1 + Math.sin(t * 4.5) * 0.08 : 1 + Math.sin(t * 2.6) * 0.02;
    ref.current.scale.setScalar(BASE_SCALE * pulse);
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.material.opacity = highlight ? 0.44 : 0.24;
    }
  });

  if (!visible) return null;
  const accent = String(cat.id).length % 2 ? '#ffdff1' : '#e9f4ff';

  return <group ref={ref} position={[cat.x, cat.y ?? 0.72, cat.z]} scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]}>
    <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={ringRef}>
      <ringGeometry args={[0.48, 0.86, 40]} />
      <meshBasicMaterial color={highlight ? '#ffe289' : '#d2e6ff'} transparent opacity={0.24} />
    </mesh>
    <mesh><sphereGeometry args={[0.36, 18, 18]} /><meshStandardMaterial color={cat.color} roughness={0.5} emissive={highlight ? '#fff1b8' : '#000000'} emissiveIntensity={highlight ? 0.6 : 0} /></mesh>
    <mesh position={[0.33, 0.2, 0]}><sphereGeometry args={[0.29, 16, 16]} /><meshStandardMaterial color={cat.color} roughness={0.5} emissive={highlight ? '#fff1b8' : '#000000'} emissiveIntensity={highlight ? 0.6 : 0} /></mesh>
    <mesh ref={earL} position={[0.43, 0.43, 0.14]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.11, 0.22, 10]} /><meshStandardMaterial color={cat.color} /></mesh>
    <mesh ref={earR} position={[0.43, 0.43, -0.14]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.11, 0.22, 10]} /><meshStandardMaterial color={cat.color} /></mesh>
    <mesh position={[0.44, 0.43, 0.14]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.06, 0.12, 8]} /><meshStandardMaterial color={accent} /></mesh>
    <mesh position={[0.44, 0.43, -0.14]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.06, 0.12, 8]} /><meshStandardMaterial color={accent} /></mesh>
    <mesh position={[0.5, 0.23, 0]}><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color="#fff7ee" /></mesh>
    <mesh position={[0.51, 0.31, 0.08]}><sphereGeometry args={[0.043, 10, 10]} /><meshBasicMaterial color="#20203a" /></mesh>
    <mesh position={[0.51, 0.31, -0.08]}><sphereGeometry args={[0.043, 10, 10]} /><meshBasicMaterial color="#20203a" /></mesh>
    <mesh position={[0.52, 0.34, 0.09]}><sphereGeometry args={[0.015, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
    <mesh position={[0.52, 0.34, -0.06]}><sphereGeometry args={[0.015, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
    <mesh position={[0.6, 0.24, 0]}><sphereGeometry args={[0.023, 8, 8]} /><meshBasicMaterial color="#ff8eb8" /></mesh>
    <mesh position={[0.64, 0.2, 0]} rotation={[Math.PI, Math.PI / 2, 0]}><torusGeometry args={[0.03, 0.004, 6, 10, Math.PI]} /><meshBasicMaterial color="#965672" /></mesh>
    <mesh ref={tailRef} position={[-0.52, 0.32, 0]} rotation={[0, 0.6, -0.55]}><capsuleGeometry args={[0.048, 0.36, 4, 8]} /><meshStandardMaterial color={cat.color} roughness={0.5} /></mesh>
    {showDebugMarker && <group position={[0, 0.94, 0]}>
      <mesh><sphereGeometry args={[0.08, 8, 8]} /><meshBasicMaterial color={highlight ? '#7dffac' : '#ffd68f'} /></mesh>
      {distance != null && <mesh position={[0, 0.13, 0]}><boxGeometry args={[0.14, 0.04, 0.14]} /><meshBasicMaterial color={distance <= 2.6 ? '#6eff9e' : '#ff9ca9'} /></mesh>}
    </group>}
  </group>;
}
