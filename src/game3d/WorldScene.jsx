const TREE_RINGS = [
  { count: 16, radius: 18, jitter: 4 },
  { count: 20, radius: 30, jitter: 6 },
  { count: 26, radius: 42, jitter: 8 }
];

export default function WorldScene() {
  return <>
    <color attach="background" args={["#cdeeff"]} />
    <ambientLight intensity={0.78} />
    <hemisphereLight args={['#eaf6ff', '#8ecf8b', 0.72]} />
    <directionalLight position={[12, 16, 8]} intensity={1.08} castShadow />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[74, 64]} />
      <meshStandardMaterial color="#ade6a5" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <ringGeometry args={[8, 20, 48]} />
      <meshStandardMaterial color="#b8ebb0" transparent opacity={0.45} />
    </mesh>

    {TREE_RINGS.flatMap((ring, ringIndex) => Array.from({ length: ring.count }).map((_, i) => {
      const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.17;
      const offset = Math.sin(i * 2.1 + ringIndex) * ring.jitter;
      const x = Math.cos(angle) * (ring.radius + offset);
      const z = Math.sin(angle) * (ring.radius + offset);
      const scale = 1 + ((i + ringIndex) % 5) * 0.18;
      return <group key={`${ringIndex}-${i}`} position={[x, 0, z]}>
        <mesh position={[0, 1.5 * scale, 0]}><cylinderGeometry args={[0.28 * scale, 0.36 * scale, 2.9 * scale, 8]} /><meshStandardMaterial color="#88573a" /></mesh>
        <mesh position={[0, 3.4 * scale, 0]}><sphereGeometry args={[1.3 * scale, 12, 12]} /><meshStandardMaterial color={ringIndex % 2 ? '#82cf93' : '#79c786'} /></mesh>
      </group>;
    }))}
  </>;
}
