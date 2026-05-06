import {
  PineTree, SakuraTree, PalmTree, CrystalSpire, BareTree, CottonTree,
  GrassPatches, FlowerScatter, MushroomCluster, RockCluster, FloatingCloud,
  ToriiGate, Lighthouse, MoonOrb, Mountain, AuroraBand, StarField,
  Lantern, LilyPad, CloudPlatform, BeachUmbrella
} from './primitives.jsx';

/* Anillos: rmin..rmax = banda, count = elementos */
function ring(count, rmin, rmax, jitter = 0.4, seedOffset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i + seedOffset) / count) * Math.PI * 2 + Math.sin(i * 7.3) * jitter;
    const r = rmin + ((i * 1.7) % (rmax - rmin));
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  });
}

/* Banda exterior densa para crear "fondo" del bioma — radio 22..36 */
function backRing(count, rmin = 22, rmax = 36, jitter = 0.6) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.sin(i * 4.1) * jitter;
    const r = rmin + ((i * 2.3) % (rmax - rmin));
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  });
}

/* ===== 1. BOSQUE MÍSTICO ===== */
export function MysticForestBiome() {
  return (
    <>
      {ring(34, 12, 22, 0.5).map((p, i) => (
        <PineTree key={i} position={p} scale={0.85 + (i % 5) * 0.12} color={i % 3 === 0 ? '#5fa667' : '#7ac985'} />
      ))}
      {backRing(22).map((p, i) => (
        <PineTree key={`b-${i}`} position={p} scale={1.1 + (i % 4) * 0.15} color={i % 2 === 0 ? '#4a8857' : '#5fa667'} />
      ))}
      <GrassPatches count={150} area={28} color="#7ac56b" />
      <FlowerScatter count={48} area={20} palette={['#ffd0e7', '#ffe39b', '#dab2ff', '#ffb6d0']} />
      <MushroomCluster positions={ring(22, 5, 14).map(([x, , z]) => [x, 0, z])} color="#e98890" />
      <RockCluster positions={ring(16, 8, 22).map(([x, , z]) => [x, 0.2, z])} color="#7c8580" />
    </>
  );
}

/* ===== 2. CIUDAD SAKURA ===== */
export function SakuraCityBiome() {
  return (
    <>
      <ToriiGate position={[0, 0, -10]} scale={1.1} />
      {ring(28, 11, 22, 0.4).map((p, i) => (
        <SakuraTree key={i} position={p} scale={0.85 + (i % 4) * 0.15} />
      ))}
      {backRing(18).map((p, i) => (
        <SakuraTree key={`b-${i}`} position={p} scale={1.1 + (i % 3) * 0.18} />
      ))}
      <FlowerScatter count={60} area={22} palette={['#ff9bc8', '#ffc8e3', '#ffe1ee', '#ffb6d9']} />
      {Array.from({ length: 10 }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const z = -2 - (i >> 1) * 2.4;
        return <Lantern key={i} position={[side * 1.8, 0, z]} color="#ffb45e" />;
      })}
      {ring(8, 17, 22, 0.5).map((p, i) => (
        <group key={`h-${i}`} position={p}>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.2, 1.5]} />
            <meshStandardMaterial color={['#fff8ec', '#ffe5d4', '#fff0e0'][i % 3]} roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.4, 0.7, 4]} />
            <meshStandardMaterial color="#3a2a2a" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <GrassPatches count={90} area={24} color="#cfb09e" />
    </>
  );
}

/* ===== 3. LAGO CRISTAL ===== */
export function CrystalLakeBiome() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -8]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#9be0ff" transparent opacity={0.85} roughness={0.15} metalness={0.25} />
      </mesh>
      {ring(14, 4, 14, 0.7).map((p, i) => (
        <LilyPad key={i} position={[p[0], 0.07, p[2] - 8]} scale={0.7 + (i % 4) * 0.2} />
      ))}
      {ring(20, 13, 22, 0.4).map((p, i) => (
        <CrystalSpire key={i} position={p} scale={0.9 + (i % 4) * 0.25} color={i % 3 === 0 ? '#a4f0ff' : i % 3 === 1 ? '#cfe7ff' : '#e0d5ff'} />
      ))}
      {backRing(16).map((p, i) => (
        <CrystalSpire key={`b-${i}`} position={p} scale={1.3 + (i % 3) * 0.3} color={i % 2 === 0 ? '#cfe7ff' : '#e0d5ff'} />
      ))}
      <GrassPatches count={100} area={24} color="#b1d4b8" />
      <FlowerScatter count={32} area={20} palette={['#9bdaff', '#cfe7ff', '#e0d5ff', '#b8e8ff']} />
      <RockCluster positions={ring(14, 6, 22).map(([x, , z]) => [x, 0.15, z])} color="#a8c4d0" />
    </>
  );
}

/* ===== 4. ARBOLEDA DE NIEBLA ===== */
export function MistGroveBiome() {
  return (
    <>
      {ring(32, 10, 22, 0.6).map((p, i) => (
        <BareTree key={i} position={p} scale={0.9 + (i % 5) * 0.15} />
      ))}
      {backRing(20).map((p, i) => (
        <BareTree key={`b-${i}`} position={p} scale={1.2 + (i % 3) * 0.2} />
      ))}
      <MushroomCluster positions={ring(34, 4, 18, 0.7).map(([x, , z]) => [x, 0, z])} color="#a5e8c8" />
      <RockCluster positions={ring(20, 6, 22).map(([x, , z]) => [x, 0.2, z])} color="#4a4d52" />
      <GrassPatches count={80} area={22} color="#6a8070" />
    </>
  );
}

/* ===== 5. PUERTO PASTEL ===== */
export function PastelPortBiome() {
  return (
    <>
      <Lighthouse position={[14, 0, -6]} scale={1.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, 0.04, 0]} receiveShadow>
        <planeGeometry args={[28, 60]} />
        <meshStandardMaterial color="#9be0ff" transparent opacity={0.78} roughness={0.2} metalness={0.1} />
      </mesh>
      {ring(20, 11, 22, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={0.9 + (i % 4) * 0.18} />
      ))}
      {backRing(14, 22, 32).map((p, i) => (
        <PalmTree key={`b-${i}`} position={p} scale={1.1 + (i % 3) * 0.2} />
      ))}
      {ring(9, 14, 20, 0.5, 1).map((p, i) => (
        <group key={`h-${i}`} position={p}>
          <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.7, 1.4, 1.6]} />
            <meshStandardMaterial color={['#ffd6ea', '#ffe5be', '#d8dbff', '#ffe6f5'][i % 4]} roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.3, 0.9, 4]} />
            <meshStandardMaterial color="#c98390" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <BeachUmbrella position={[6, 0, 8]} color="#ff9bc8" />
      <BeachUmbrella position={[8, 0, 11]} color="#ffd87a" />
      <BeachUmbrella position={[-7, 0, 9]} color="#a8e0ff" />
      <BeachUmbrella position={[10, 0, 6]} color="#ffb6e0" />
      <GrassPatches count={70} area={22} color="#dac8b6" />
      <FlowerScatter count={28} area={20} palette={['#ffb6d0', '#ffd87a', '#a8e0ff']} />
    </>
  );
}

/* ===== 6. VALLE DE LAS NUBES ===== */
export function CloudValleyBiome() {
  return (
    <>
      {ring(18, 8, 20, 0.5).map((p, i) => (
        <CloudPlatform key={i} position={[p[0], 1.2 + (i % 4) * 0.6, p[2]]} scale={0.9 + (i % 5) * 0.2} />
      ))}
      {ring(14, 12, 26).map((p, i) => (
        <FloatingCloud key={`fc-${i}`} position={[p[0], 6 + (i % 5), p[2]]} scale={0.8 + (i % 4) * 0.3} />
      ))}
      {backRing(16, 22, 34).map((p, i) => (
        <FloatingCloud key={`bf-${i}`} position={[p[0], 8 + (i % 4), p[2]]} scale={1.4 + (i % 3) * 0.4} />
      ))}
      {[
        [5, 0, 5], [-6, 0, 4], [3, 0, -7], [7, 0, 9], [-8, 0, -3], [2, 0, 8]
      ].map((pos, i) => (
        <CottonTree key={`ct-${i}`} position={pos} scale={1.0 + (i % 3) * 0.2} color={['#ffe5e5', '#e5f0ff', '#fff0e5', '#f0e5ff'][i % 4]} />
      ))}
      <FlowerScatter count={42} area={18} palette={['#cfe7ff', '#e8d5ff', '#fff0fa', '#ffe5f0']} />
      <GrassPatches count={90} area={20} color="#cad8d2" />
    </>
  );
}

/* ===== 7. JARDÍN LUNAR ===== */
export function MoonGardenBiome() {
  return (
    <>
      <MoonOrb position={[-8, 14, -25]} scale={1} />
      <StarField count={160} />
      {ring(28, 11, 22, 0.5).map((p, i) => (
        <BareTree key={i} position={p} scale={0.9 + (i % 5) * 0.15} />
      ))}
      {backRing(20).map((p, i) => (
        <BareTree key={`b-${i}`} position={p} scale={1.2 + (i % 3) * 0.2} />
      ))}
      <FlowerScatter count={80} area={22} palette={['#a8c8ff', '#d4b6ff', '#7fcfff', '#ffd6f5', '#c8a8ff']} />
      <MushroomCluster positions={ring(22, 5, 18).map(([x, , z]) => [x, 0, z])} color="#a8c8ff" />
      <GrassPatches count={100} area={22} color="#5b5f86" />
      {ring(10, 7, 18, 0.7).map((p, i) => (
        <Lantern key={`lg-${i}`} position={p} color="#a8c8ff" />
      ))}
    </>
  );
}

/* ===== 8. PLAYA ALGODÓN ===== */
export function CottonBeachBiome() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 18]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#a8e8ff" transparent opacity={0.78} roughness={0.2} metalness={0.1} />
      </mesh>
      {ring(18, 11, 22, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={0.9 + (i % 4) * 0.18} />
      ))}
      {backRing(14, 22, 32).map((p, i) => (
        <PalmTree key={`b-${i}`} position={p} scale={1.1 + (i % 3) * 0.2} />
      ))}
      <BeachUmbrella position={[3, 0, 8]} color="#ff9bc8" />
      <BeachUmbrella position={[-5, 0, 10]} color="#ffd87a" />
      <BeachUmbrella position={[6, 0, 12]} color="#a8e0ff" />
      <BeachUmbrella position={[-3, 0, 6]} color="#ffb6e0" />
      <BeachUmbrella position={[8, 0, 5]} color="#c8a8ff" />
      <BeachUmbrella position={[-7, 0, 4]} color="#ffe19b" />
      <RockCluster positions={ring(28, 4, 18).map(([x, , z]) => [x, 0.05, z])} color="#ffd6c8" />
      <GrassPatches count={60} area={20} color="#f1d7af" />
      {ring(10, 12, 22).map((p, i) => (
        <FloatingCloud key={`c-${i}`} position={[p[0], 8, p[2]]} scale={1.1 + (i % 3) * 0.3} />
      ))}
    </>
  );
}

/* ===== 9. MONTAÑA AURORA ===== */
export function AuroraMountainBiome() {
  return (
    <>
      <Mountain position={[0, 0, -22]} scale={1.1} color="#5c6f82" />
      <Mountain position={[18, 0, -10]} scale={0.7} color="#4a5d70" />
      <Mountain position={[-18, 0, -12]} scale={0.8} color="#536579" />
      <Mountain position={[26, 0, -28]} scale={0.9} color="#3d4f60" />
      <Mountain position={[-28, 0, -26]} scale={1.0} color="#3d4f60" />
      <AuroraBand position={[0, 9, -22]} />
      <AuroraBand position={[2, 11, -24]} />
      <AuroraBand position={[-3, 10, -20]} />
      <StarField count={90} />
      {ring(28, 10, 22, 0.5).map((p, i) => (
        <PineTree key={i} position={p} scale={0.9 + (i % 5) * 0.12} color={i % 2 === 0 ? '#3d6e58' : '#4f8567'} />
      ))}
      {backRing(20).map((p, i) => (
        <PineTree key={`b-${i}`} position={p} scale={1.3 + (i % 3) * 0.2} color={i % 2 === 0 ? '#2f5945' : '#3d6e58'} />
      ))}
      <RockCluster positions={ring(22, 6, 22).map(([x, , z]) => [x, 0.15, z])} color="#c5d8e0" />
      <GrassPatches count={70} area={22} color="#7a8b95" />
    </>
  );
}

/* ===== 10. VILLA ESTELAR ===== */
export function StellarVillageBiome() {
  return (
    <>
      <StarField count={220} />
      <mesh position={[20, 16, -34]}>
        <sphereGeometry args={[3, 24, 18]} />
        <meshStandardMaterial color="#c89eff" emissive="#7d4ad6" emissiveIntensity={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[20, 16, -34]} rotation={[Math.PI * 0.1, 0, Math.PI * 0.1]}>
        <torusGeometry args={[4.5, 0.1, 8, 64]} />
        <meshBasicMaterial color="#e8d4ff" toneMapped={false} />
      </mesh>
      <mesh position={[-22, 18, -32]}>
        <sphereGeometry args={[1.6, 18, 14]} />
        <meshStandardMaterial color="#ffd6a5" emissive="#ffaa66" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      {ring(12, 11, 22, 0.5).map((p, i) => (
        <group key={`sh-${i}`} position={[p[0], 0.5 + (i % 3) * 0.3, p[2]]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.5, 1.2, 1.4]} />
            <meshStandardMaterial color={['#d4a8ff', '#ffd6a5', '#a8c8ff'][i % 3]} roughness={0.7} emissive={['#a87fee', '#ffaa66', '#7fa8ee'][i % 3]} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.2, 0.7, 4]} />
            <meshStandardMaterial color="#3a2e5a" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {ring(22, 6, 22, 0.6).map((p, i) => (
        <Lantern key={`sv-l-${i}`} position={[p[0], 1.0 + (i % 4) * 0.6, p[2]]} color={['#ffd066', '#a8c8ff', '#ffd6a5', '#d4b6ff'][i % 4]} />
      ))}
      <GrassPatches count={60} area={20} color="#655782" />
    </>
  );
}

export const BIOMES = {
  'mystic-forest': MysticForestBiome,
  'sakura-city': SakuraCityBiome,
  'crystal-lake': CrystalLakeBiome,
  'mist-grove': MistGroveBiome,
  'pastel-port': PastelPortBiome,
  'cloud-valley': CloudValleyBiome,
  'moon-garden': MoonGardenBiome,
  'cotton-beach': CottonBeachBiome,
  'aurora-mountain': AuroraMountainBiome,
  'stellar-village': StellarVillageBiome
};
