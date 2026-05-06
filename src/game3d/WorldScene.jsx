import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

const TREE_RINGS = [
  { count: 16, radius: 17, jitter: 3.2 },
  { count: 24, radius: 26, jitter: 4.8 },
  { count: 30, radius: 36, jitter: 6.2 },
  { count: 34, radius: 48, jitter: 8.1 }
];

function MagicParticles() {
  const points = useRef();
  const seeds = useMemo(() => Array.from({ length: 42 }, (_, i) => ({
    x: (Math.random() - 0.5) * 44,
    z: (Math.random() - 0.5) * 44,
    y: 1 + Math.random() * 2.8,
    p: Math.random() * 10 + i
  })), []);
  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < points.current.children.length; i += 1) {
      const child = points.current.children[i];
      const s = seeds[i];
      child.position.y = s.y + Math.sin(t * 0.8 + s.p) * 0.08;
      child.material.opacity = 0.24 + (Math.sin(t * 1.2 + s.p) + 1) * 0.18;
    }
  });
  return <group ref={points}>{seeds.map((s, i) => <mesh key={i} position={[s.x, s.y, s.z]}>
    <sphereGeometry args={[0.06 + (i % 3) * 0.02, 8, 8]} /><meshBasicMaterial color={i % 2 ? '#fff7d1' : '#dff6ff'} transparent opacity={0.28} />
  </mesh>)}</group>;
}

export default function WorldScene() {
  return <>
    <color attach="background" args={["#d8f2ff"]} />
    <fog attach="fog" args={['#dff4ff', 30, 92]} />
    <ambientLight intensity={0.72} color="#eef6ff" />
    <hemisphereLight args={['#f2f7ff', '#78bf84', 0.95]} />
    <directionalLight position={[14, 17, 10]} intensity={1.22} color="#ffeacd" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[76, 70]} />
      <meshStandardMaterial color="#b5e8ab" roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
      <ringGeometry args={[8, 22, 64]} />
      <meshStandardMaterial color="#bdeeb4" transparent opacity={0.38} />
    </mesh>

    {Array.from({ length: 8 }).map((_, i) => <mesh key={`hill-${i}`} position={[Math.sin(i * 1.8) * 20, 0.2, Math.cos(i * 2.1) * 18]}>
      <sphereGeometry args={[4 + (i % 3) * 1.3, 14, 14]} /><meshStandardMaterial color={i % 2 ? '#afe0a5' : '#bce8b4'} />
    </mesh>)}

    {TREE_RINGS.flatMap((ring, ringIndex) => Array.from({ length: ring.count }).map((_, i) => {
      const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.19;
      const offset = Math.sin(i * 2 + ringIndex * 0.4) * ring.jitter;
      const x = Math.cos(angle) * (ring.radius + offset);
      const z = Math.sin(angle) * (ring.radius + offset);
      const scale = 0.92 + ((i + ringIndex * 2) % 7) * 0.18;
      return <group key={`${ringIndex}-${i}`} position={[x, 0, z]}>
        <mesh position={[0, 1.58 * scale, 0]}><cylinderGeometry args={[0.26 * scale, 0.37 * scale, 3.0 * scale, 8]} /><meshStandardMaterial color="#8a5a3b" roughness={0.95} /></mesh>
        <mesh position={[0, 3.45 * scale, 0]}><sphereGeometry args={[1.34 * scale, 12, 12]} /><meshStandardMaterial color={ringIndex % 2 ? '#81cb8f' : '#74bf83'} roughness={0.82} /></mesh>
      </group>;
    }))}

    {Array.from({ length: 30 }).map((_, i) => <mesh key={`bush-${i}`} position={[Math.sin(i * 2.7) * (19 + (i % 6) * 4.5), 0.38, Math.cos(i * 2.2) * (17 + (i % 7) * 4)]}>
      <sphereGeometry args={[0.55 + (i % 4) * 0.12, 10, 10]} /><meshStandardMaterial color={i % 2 ? '#90d699' : '#a4dfa8'} roughness={0.85} />
    </mesh>)}

    {Array.from({ length: 52 }).map((_, i) => <group key={`flora-${i}`} position={[Math.sin(i * 2.4) * (14 + (i % 10) * 3.2), 0, Math.cos(i * 2.6) * (14 + (i % 9) * 3)]}>
      <mesh position={[0, 0.09, 0]}><cylinderGeometry args={[0.012, 0.016, 0.18, 5]} /><meshStandardMaterial color="#7cc784" /></mesh>
      <mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.055, 6, 6]} /><meshStandardMaterial color={['#ffd6ef', '#ffe598', '#d8c2ff', '#c8f5ff'][i % 4]} /></mesh>
    </group>)}



    {Array.from({ length: 22 }).map((_, i) => <group key={`log-${i}`} position={[Math.sin(i * 1.7) * (22 + (i % 5) * 4.2), 0.15, Math.cos(i * 1.9) * (23 + (i % 4) * 4.4)]} rotation={[0, i * 0.54, 0]}>
      <mesh><cylinderGeometry args={[0.22, 0.25, 1.3 + (i % 3) * 0.45, 8]} /><meshStandardMaterial color="#8e6141" roughness={0.9} /></mesh>
      <mesh position={[0.15, 0.12, 0.3]}><sphereGeometry args={[0.18, 8, 8]} /><meshStandardMaterial color="#7bc786" roughness={0.9} /></mesh>
    </group>)}

    {Array.from({ length: 36 }).map((_, i) => <group key={`rock-${i}`} position={[Math.sin(i * 1.33) * (11 + (i % 8) * 5.3), 0.12, Math.cos(i * 1.41) * (12 + (i % 9) * 4.7)]}>
      <mesh scale={[1 + (i % 3) * 0.35, 0.8 + (i % 2) * 0.2, 1 + (i % 4) * 0.24]}><dodecahedronGeometry args={[0.28 + (i % 4) * 0.07, 0]} /><meshStandardMaterial color={i % 2 ? '#b8c5cb' : '#9fb2ba'} roughness={0.92} /></mesh>
    </group>)}

    {Array.from({ length: 26 }).map((_, i) => <group key={`mush-${i}`} position={[Math.sin(i * 2.02) * (16 + (i % 6) * 4), 0, Math.cos(i * 2.16) * (16 + (i % 7) * 4.1)]}>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.04, 0.05, 0.2, 8]} /><meshStandardMaterial color="#f3dfc5" /></mesh>
      <mesh position={[0, 0.24, 0]}><sphereGeometry args={[0.13 + (i % 3) * 0.03, 10, 10]} /><meshStandardMaterial color={i % 2 ? '#ff8cb7' : '#b79cff'} /></mesh>
    </group>)}

    <MagicParticles />
  </>;
}
