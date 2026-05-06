import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function CharacterSarita3D({ characterRef, animState }) {
  const armL = useRef(); const armR = useRef(); const legL = useRef(); const legR = useRef(); const body = useRef(); const hairBack = useRef(); const ponyL = useRef(); const ponyR = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const run = animState === 'run';
    const swing = run ? Math.sin(t * 10.8) * 0.52 : Math.sin(t * 2) * 0.06;
    if (armL.current) armL.current.rotation.x = swing;
    if (armR.current) armR.current.rotation.x = -swing;
    if (legL.current) legL.current.rotation.x = -swing;
    if (legR.current) legR.current.rotation.x = swing;
    if (body.current) body.current.position.y = 1.46 + (run ? Math.abs(Math.sin(t * 10.8)) * 0.09 : Math.sin(t * 2) * 0.026);
    if (hairBack.current) hairBack.current.rotation.x = run ? -0.24 + Math.sin(t * 10.8) * 0.08 : -0.16;
    if (ponyL.current) ponyL.current.rotation.z = -0.2 + Math.sin(t * 8) * 0.08;
    if (ponyR.current) ponyR.current.rotation.z = 0.2 - Math.sin(t * 8) * 0.08;
  });
  return <group ref={characterRef} position={[0, 0, 0]}>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.78, 30]} /><meshBasicMaterial color="#000" transparent opacity={0.2} /></mesh>
    <group ref={body} position={[0, 1.46, 0]}>
      <mesh position={[0, 1.08, 0.01]}><sphereGeometry args={[0.54, 24, 24]} /><meshStandardMaterial color="#ffe0d4" roughness={0.55} /></mesh>
      <mesh ref={hairBack} position={[0, 1.2, -0.22]}><boxGeometry args={[0.82, 0.58, 0.48]} /><meshStandardMaterial color="#5a3550" roughness={0.65} /></mesh>
      <mesh ref={ponyL} position={[-0.38, 1.12, -0.06]}><capsuleGeometry args={[0.09, 0.26, 4, 8]} /><meshStandardMaterial color="#5a3550" roughness={0.65} /></mesh>
      <mesh ref={ponyR} position={[0.38, 1.12, -0.06]}><capsuleGeometry args={[0.09, 0.26, 4, 8]} /><meshStandardMaterial color="#5a3550" roughness={0.65} /></mesh>
      <mesh position={[0, 1.47, 0.22]}><boxGeometry args={[0.62, 0.35, 0.16]} /><meshStandardMaterial color="#71436a" roughness={0.6} /></mesh>
      <mesh position={[0, 0.48, 0]}><boxGeometry args={[0.9, 1.08, 0.56]} /><meshStandardMaterial color="#9f90ff" roughness={0.45} /></mesh>
      <mesh position={[0, 0.05, 0.14]}><boxGeometry args={[0.78, 0.28, 0.46]} /><meshStandardMaterial color="#ffd9ef" roughness={0.42} /></mesh>
      <mesh position={[0, 0.34, 0.29]}><boxGeometry args={[0.28, 0.18, 0.08]} /><meshStandardMaterial color="#ffe98a" roughness={0.35} emissive="#fff3b3" emissiveIntensity={0.18} /></mesh>
      <mesh ref={armL} position={[-0.58, 0.52, 0]}><capsuleGeometry args={[0.11, 0.58, 4, 8]} /><meshStandardMaterial color="#ffe0d4" /></mesh>
      <mesh ref={armR} position={[0.58, 0.52, 0]}><capsuleGeometry args={[0.11, 0.58, 4, 8]} /><meshStandardMaterial color="#ffe0d4" /></mesh>
      <mesh ref={legL} position={[-0.22, -0.52, 0]}><capsuleGeometry args={[0.12, 0.54, 4, 8]} /><meshStandardMaterial color="#ffe0d4" /></mesh>
      <mesh ref={legR} position={[0.22, -0.52, 0]}><capsuleGeometry args={[0.12, 0.54, 4, 8]} /><meshStandardMaterial color="#ffe0d4" /></mesh>
      <mesh position={[-0.22, -0.95, 0.12]}><boxGeometry args={[0.36, 0.16, 0.48]} /><meshStandardMaterial color="#ffffff" roughness={0.3} /></mesh>
      <mesh position={[0.22, -0.95, 0.12]}><boxGeometry args={[0.36, 0.16, 0.48]} /><meshStandardMaterial color="#ffffff" roughness={0.3} /></mesh>
      <mesh position={[-0.17, 1.13, 0.49]}><sphereGeometry args={[0.095, 16, 16]} /><meshBasicMaterial color="#242344" /></mesh>
      <mesh position={[0.17, 1.13, 0.49]}><sphereGeometry args={[0.095, 16, 16]} /><meshBasicMaterial color="#242344" /></mesh>
      <mesh position={[-0.13, 1.17, 0.54]}><sphereGeometry args={[0.03, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[0.2, 1.17, 0.54]}><sphereGeometry args={[0.03, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[0, 1.01, 0.53]}><sphereGeometry args={[0.036, 10, 10]} /><meshBasicMaterial color="#ff8fb3" /></mesh>
      <mesh position={[0, 0.95, 0.52]} rotation={[Math.PI, 0, 0]}><torusGeometry args={[0.082, 0.012, 6, 14, Math.PI]} /><meshBasicMaterial color="#965274" /></mesh>
      <mesh position={[-0.23, 1.04, 0.48]}><sphereGeometry args={[0.053, 10, 10]} /><meshBasicMaterial color="#ffbfd4" transparent opacity={0.75} /></mesh>
      <mesh position={[0.23, 1.04, 0.48]}><sphereGeometry args={[0.053, 10, 10]} /><meshBasicMaterial color="#ffbfd4" transparent opacity={0.75} /></mesh>
    </group>
  </group>;
}
