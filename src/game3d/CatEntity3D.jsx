import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function CatEntity3D({ cat, visible }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + cat.phase;
    ref.current.position.y = 0.45 + Math.sin(t * 2.4) * 0.08;
    ref.current.rotation.y = Math.sin(t) * 0.2;
  });
  if (!visible) return null;
  return <group ref={ref} position={[cat.x,0.45,cat.z]}>
    <mesh><sphereGeometry args={[0.32,16,16]}/><meshStandardMaterial color={cat.color}/></mesh>
    <mesh position={[0.24,0.16,0]}><sphereGeometry args={[0.24,16,16]}/><meshStandardMaterial color={cat.color}/></mesh>
    <mesh position={[0.36,0.34,0.12]} rotation={[0,0,0.3]}><coneGeometry args={[0.08,0.16,8]}/><meshStandardMaterial color={cat.color}/></mesh>
    <mesh position={[0.36,0.34,-0.12]} rotation={[0,0,-0.3]}><coneGeometry args={[0.08,0.16,8]}/><meshStandardMaterial color={cat.color}/></mesh>
  </group>;
}
