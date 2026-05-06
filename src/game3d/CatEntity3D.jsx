import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function CatEntity3D({ cat, visible, highlight = false }) {
  const ref = useRef();
  const tailRef = useRef();
  const eyeL = useRef();
  const eyeR = useRef();
  useFrame(({ clock }) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + cat.phase;
    ref.current.position.y = 0.7 + Math.sin(t * 2.1) * 0.11;
    ref.current.rotation.y = Math.sin(t * 0.8) * 0.22;
    if (tailRef.current) tailRef.current.rotation.y = 0.55 + Math.sin(t * 3.2) * 0.38;
    const blink = Math.max(0.2, Math.abs(Math.sin(t * 1.3 + cat.phase * 0.7)));
    if (eyeL.current) eyeL.current.scale.y = blink;
    if (eyeR.current) eyeR.current.scale.y = blink;
    if (ref.current && highlight) {
      const pulse = 1 + Math.sin(t * 4) * 0.04;
      ref.current.scale.setScalar(1.52 * pulse);
    } else if (ref.current) {
      ref.current.scale.setScalar(1.52);
    }
  });
  if (!visible) return null;
  const accent = cat.id % 2 ? '#ffdff1' : '#e9f4ff';
  return <group ref={ref} position={[cat.x, 0.7, cat.z]} scale={[1.52, 1.52, 1.52]}>
    <mesh><sphereGeometry args={[0.36, 18, 18]} /><meshStandardMaterial color={cat.color} roughness={0.5} emissive={highlight ? '#fff3b0' : '#000000'} emissiveIntensity={highlight ? 0.45 : 0} /></mesh>
    <mesh position={[0.33, 0.19, 0]}><sphereGeometry args={[0.29, 16, 16]} /><meshStandardMaterial color={cat.color} roughness={0.5} emissive={highlight ? '#fff3b0' : '#000000'} emissiveIntensity={highlight ? 0.45 : 0} /></mesh>
    <mesh position={[0.43, 0.43, 0.14]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.11, 0.22, 10]} /><meshStandardMaterial color={cat.color} /></mesh>
    <mesh position={[0.43, 0.43, -0.14]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.11, 0.22, 10]} /><meshStandardMaterial color={cat.color} /></mesh>
    <mesh position={[0.44, 0.43, 0.14]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.06, 0.12, 8]} /><meshStandardMaterial color={accent} /></mesh>
    <mesh position={[0.44, 0.43, -0.14]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.06, 0.12, 8]} /><meshStandardMaterial color={accent} /></mesh>
    <mesh position={[0.5, 0.23, 0]}><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color="#fff7ee" /></mesh>
    <mesh ref={eyeL} position={[0.51, 0.31, 0.08]}><sphereGeometry args={[0.043, 10, 10]} /><meshBasicMaterial color="#20203a" /></mesh>
    <mesh ref={eyeR} position={[0.51, 0.31, -0.08]}><sphereGeometry args={[0.043, 10, 10]} /><meshBasicMaterial color="#20203a" /></mesh>
    <mesh position={[0.52, 0.34, 0.09]}><sphereGeometry args={[0.015, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
    <mesh position={[0.52, 0.34, -0.06]}><sphereGeometry args={[0.015, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
    <mesh position={[0.6, 0.24, 0]}><sphereGeometry args={[0.023, 8, 8]} /><meshBasicMaterial color="#ff8eb8" /></mesh>
    <mesh position={[0.64, 0.2, 0]} rotation={[Math.PI, Math.PI / 2, 0]}><torusGeometry args={[0.03, 0.004, 6, 10, Math.PI]} /><meshBasicMaterial color="#965672" /></mesh>
    <mesh ref={tailRef} position={[-0.52, 0.32, 0]} rotation={[0, 0.6, -0.55]}><capsuleGeometry args={[0.048, 0.36, 4, 8]} /><meshStandardMaterial color={cat.color} roughness={0.5} /></mesh>
    {highlight && <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.5, 0.75, 28]} /><meshBasicMaterial color="#fff2a8" transparent opacity={0.3} /></mesh>}
  </group>;
}
