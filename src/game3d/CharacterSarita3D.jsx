import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function CharacterSarita3D({ characterRef, animState }) {
  const armL = useRef(); const armR = useRef(); const legL = useRef(); const legR = useRef(); const body = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const run = animState === 'run';
    const swing = run ? Math.sin(t * 12) * 0.6 : Math.sin(t * 2) * 0.08;
    if (armL.current) armL.current.rotation.x = swing;
    if (armR.current) armR.current.rotation.x = -swing;
    if (legL.current) legL.current.rotation.x = -swing;
    if (legR.current) legR.current.rotation.x = swing;
    if (body.current) body.current.position.y = 1.5 + (run ? Math.abs(Math.sin(t * 12)) * 0.08 : Math.sin(t * 2) * 0.03);
  });
  return <group ref={characterRef} position={[0,0,0]}>
    <mesh position={[0,0.02,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[0.62,24]}/><meshBasicMaterial color="#000" transparent opacity={0.16}/></mesh>
    <group ref={body} position={[0,1.5,0]}>
      <mesh position={[0,0.95,0]}><sphereGeometry args={[0.42,20,20]}/><meshStandardMaterial color="#ffd6c7"/></mesh>
      <mesh position={[0,1.15,-0.1]}><boxGeometry args={[0.68,0.28,0.5]}/><meshStandardMaterial color="#563246"/></mesh>
      <mesh position={[0,0.35,0]}><boxGeometry args={[0.7,0.9,0.45]}/><meshStandardMaterial color="#8e7bff"/></mesh>
      <mesh ref={armL} position={[-0.5,0.45,0]}><boxGeometry args={[0.22,0.72,0.22]}/><meshStandardMaterial color="#ffd6c7"/></mesh>
      <mesh ref={armR} position={[0.5,0.45,0]}><boxGeometry args={[0.22,0.72,0.22]}/><meshStandardMaterial color="#ffd6c7"/></mesh>
      <mesh ref={legL} position={[-0.18,-0.5,0]}><boxGeometry args={[0.25,0.8,0.25]}/><meshStandardMaterial color="#ffd6c7"/></mesh>
      <mesh ref={legR} position={[0.18,-0.5,0]}><boxGeometry args={[0.25,0.8,0.25]}/><meshStandardMaterial color="#ffd6c7"/></mesh>
      <mesh position={[-0.18,-0.93,0.08]}><boxGeometry args={[0.3,0.12,0.36]}/><meshStandardMaterial color="#ffffff"/></mesh>
      <mesh position={[0.18,-0.93,0.08]}><boxGeometry args={[0.3,0.12,0.36]}/><meshStandardMaterial color="#ffffff"/></mesh>
    </group>
  </group>;
}
