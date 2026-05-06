import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function CharacterSarita3D({ characterRef, animState }) {
  const armL = useRef(); const armR = useRef(); const legL = useRef(); const legR = useRef(); const body = useRef(); const hairBack = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const run = animState === 'run';
    const swing = run ? Math.sin(t * 10) * 0.55 : Math.sin(t * 2) * 0.07;
    if (armL.current) armL.current.rotation.x = swing;
    if (armR.current) armR.current.rotation.x = -swing;
    if (legL.current) legL.current.rotation.x = -swing;
    if (legR.current) legR.current.rotation.x = swing;
    if (body.current) body.current.position.y = 1.45 + (run ? Math.abs(Math.sin(t * 10)) * 0.09 : Math.sin(t * 2) * 0.025);
    if (hairBack.current) hairBack.current.rotation.x = run ? -0.18 + Math.sin(t * 10) * 0.06 : -0.1;
  });
  return <group ref={characterRef} position={[0, 0, 0]}>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.72, 28]} /><meshBasicMaterial color="#000" transparent opacity={0.2} /></mesh>
    <group ref={body} position={[0, 1.45, 0]}>
      <mesh position={[0, 1.05, 0]}><sphereGeometry args={[0.5, 22, 22]} /><meshStandardMaterial color="#ffd8cb" /></mesh>
      <mesh ref={hairBack} position={[0, 1.2, -0.18]}><boxGeometry args={[0.76, 0.5, 0.42]} /><meshStandardMaterial color="#5b3552" /></mesh>
      <mesh position={[0, 1.44, 0.2]}><boxGeometry args={[0.55, 0.32, 0.14]} /><meshStandardMaterial color="#5b3552" /></mesh>
      <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.84, 1.04, 0.52]} /><meshStandardMaterial color="#a18bff" /></mesh>
      <mesh position={[0, 0.03, 0.12]}><boxGeometry args={[0.74, 0.26, 0.44]} /><meshStandardMaterial color="#ffd7ee" /></mesh>
      <mesh ref={armL} position={[-0.54, 0.5, 0]}><capsuleGeometry args={[0.11, 0.54, 4, 8]} /><meshStandardMaterial color="#ffd8cb" /></mesh>
      <mesh ref={armR} position={[0.54, 0.5, 0]}><capsuleGeometry args={[0.11, 0.54, 4, 8]} /><meshStandardMaterial color="#ffd8cb" /></mesh>
      <mesh ref={legL} position={[-0.2, -0.52, 0]}><capsuleGeometry args={[0.12, 0.5, 4, 8]} /><meshStandardMaterial color="#ffd8cb" /></mesh>
      <mesh ref={legR} position={[0.2, -0.52, 0]}><capsuleGeometry args={[0.12, 0.5, 4, 8]} /><meshStandardMaterial color="#ffd8cb" /></mesh>
      <mesh position={[-0.22, -0.94, 0.11]}><boxGeometry args={[0.34, 0.16, 0.44]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[0.22, -0.94, 0.11]}><boxGeometry args={[0.34, 0.16, 0.44]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[-0.16, 1.1, 0.45]}><sphereGeometry args={[0.085, 16, 16]} /><meshBasicMaterial color="#232242" /></mesh>
      <mesh position={[0.16, 1.1, 0.45]}><sphereGeometry args={[0.085, 16, 16]} /><meshBasicMaterial color="#232242" /></mesh>
      <mesh position={[-0.13, 1.14, 0.5]}><sphereGeometry args={[0.03, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[0.19, 1.14, 0.5]}><sphereGeometry args={[0.03, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[0, 0.99, 0.5]}><sphereGeometry args={[0.035, 10, 10]} /><meshBasicMaterial color="#ff8fb1" /></mesh>
      <mesh position={[0, 0.92, 0.5]} rotation={[Math.PI, 0, 0]}><torusGeometry args={[0.07, 0.011, 6, 14, Math.PI]} /><meshBasicMaterial color="#9a5678" /></mesh>
      <mesh position={[-0.22, 1.03, 0.46]}><sphereGeometry args={[0.05, 10, 10]} /><meshBasicMaterial color="#ffbfd4" transparent opacity={0.8} /></mesh>
      <mesh position={[0.22, 1.03, 0.46]}><sphereGeometry args={[0.05, 10, 10]} /><meshBasicMaterial color="#ffbfd4" transparent opacity={0.8} /></mesh>
    </group>
  </group>;
}
