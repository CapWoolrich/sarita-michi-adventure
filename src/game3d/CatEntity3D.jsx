import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function CatEntity3D({ cat, visible, highlight = false }) {
  const ref = useRef();
  const tailRef = useRef();
  useFrame(({ clock }) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + cat.phase;
    ref.current.position.y = 0.68 + Math.sin(t * 2.2) * 0.1;
    ref.current.rotation.y = Math.sin(t * 0.9) * 0.2;
    if (tailRef.current) tailRef.current.rotation.y = 0.6 + Math.sin(t * 3.5) * 0.35;
  });
  if (!visible) return null;
  return <group ref={ref} position={[cat.x, 0.68, cat.z]} scale={[1.45, 1.45, 1.45]}>
    <mesh><sphereGeometry args={[0.34, 18, 18]} /><meshStandardMaterial color={cat.color} emissive={highlight ? '#fff3b0' : '#000000'} emissiveIntensity={highlight ? 0.55 : 0} /></mesh>
    <mesh position={[0.3, 0.18, 0]}><sphereGeometry args={[0.27, 16, 16]} /><meshStandardMaterial color={cat.color} emissive={highlight ? '#fff3b0' : '#000000'} emissiveIntensity={highlight ? 0.45 : 0} /></mesh>
    <mesh position={[0.42, 0.42, 0.13]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.1, 0.2, 10]} /><meshStandardMaterial color={cat.color} /></mesh>
    <mesh position={[0.42, 0.42, -0.13]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.1, 0.2, 10]} /><meshStandardMaterial color={cat.color} /></mesh>
    <mesh position={[0.48, 0.22, 0]}><sphereGeometry args={[0.11, 12, 12]} /><meshStandardMaterial color="#fff5ea" /></mesh>
    <mesh position={[0.49, 0.3, 0.07]}><sphereGeometry args={[0.04, 10, 10]} /><meshBasicMaterial color="#20203a" /></mesh>
    <mesh position={[0.49, 0.3, -0.07]}><sphereGeometry args={[0.04, 10, 10]} /><meshBasicMaterial color="#20203a" /></mesh>
    <mesh position={[0.5, 0.32, 0.085]}><sphereGeometry args={[0.014, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
    <mesh position={[0.5, 0.32, -0.06]}><sphereGeometry args={[0.014, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
    <mesh position={[0.58, 0.23, 0]}><sphereGeometry args={[0.022, 8, 8]} /><meshBasicMaterial color="#ff8eb8" /></mesh>
    <mesh position={[0.61, 0.2, 0]} rotation={[Math.PI, Math.PI / 2, 0]}><torusGeometry args={[0.028, 0.004, 6, 10, Math.PI]} /><meshBasicMaterial color="#965672" /></mesh>
    <mesh ref={tailRef} position={[-0.48, 0.28, 0]} rotation={[0, 0.6, -0.55]}><capsuleGeometry args={[0.045, 0.33, 4, 8]} /><meshStandardMaterial color={cat.color} /></mesh>
  </group>;
}
