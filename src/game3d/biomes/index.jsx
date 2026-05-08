import NatureModel from './NatureAssets.jsx';
import {
  PineTree, SakuraTree, PalmTree, CrystalSpire, BareTree, CottonTree,
  GrassPatches, FlowerScatter, MushroomCluster, RockCluster, FloatingCloud,
  ToriiGate, Lighthouse, MoonOrb, Mountain, AuroraBand, StarField,
  Lantern, LilyPad, CloudPlatform, BeachUmbrella,
  NeonSkyscraper, NeonSign, StreetLamp, ParkedCar
} from './primitives.jsx';

/* Anillos: rmin..rmax = banda, count = elementos */
function ring(count, rmin, rmax, jitter = 0.4, seedOffset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i + seedOffset) / count) * Math.PI * 2 + Math.sin(i * 7.3) * jitter;
    const r = rmin + ((i * 1.7) % (rmax - rmin));
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  });
}

function backRing(count, rmin = 80, rmax = 130, jitter = 0.6) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.sin(i * 4.1) * jitter;
    const r = rmin + ((i * 2.3) % (rmax - rmin));
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  });
}

/* Distribuir N items con MEZCLA de tipos */
function natureScatter(count, rmin, rmax, kinds, jitter = 0.6, scaleBase = 1.0, scaleVar = 0.3, yOffset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i / count) * Math.PI * 2 + Math.sin(i * 5.3) * jitter);
    const r = rmin + ((i * 2.7) % (rmax - rmin));
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const kind = kinds[i % kinds.length];
    const rotation = (i * 0.97) % 6.28;
    const scale = scaleBase + (i % 5) * scaleVar / 5;
    return { kind, position: [x, yOffset, z], rotation: [0, rotation, 0], scale };
  });
}

function NatureCloud({ count, rmin, rmax, kinds, jitter, scaleBase, scaleVar, yOffset, prefix }) {
  return natureScatter(count, rmin, rmax, kinds, jitter, scaleBase, scaleVar, yOffset).map((it, i) => (
    <NatureModel key={`${prefix}-${i}`} kind={it.kind} position={it.position} rotation={it.rotation} scale={it.scale} />
  ));
}

/* ===== 1. BOSQUE MÍSTICO ===== */
export function MysticForestBiome() {
  return (
    <>
      <NatureCloud prefix="t" count={72} rmin={28} rmax={80} kinds={['CommonTree1', 'CommonTree3']} jitter={0.5} scaleBase={1.2} scaleVar={0.18} />
      <NatureCloud prefix="bt" count={60} rmin={80} rmax={130} kinds={['CommonTree1', 'CommonTree3']} jitter={0.6} scaleBase={1.6} scaleVar={0.22} />
      <NatureCloud prefix="m" count={60} rmin={10} rmax={70} kinds={['MushroomCommon', 'MushroomLaeti']} jitter={0.7} scaleBase={0.7} scaleVar={0.15} />
      <NatureCloud prefix="r" count={40} rmin={14} rmax={90} kinds={['RockMedium1', 'RockMedium2', 'PebbleRound']} jitter={0.5} scaleBase={0.9} scaleVar={0.2} />
      <NatureCloud prefix="f" count={72} rmin={12} rmax={80} kinds={['Fern', 'Plant1', 'BushFlowers']} jitter={0.7} scaleBase={0.8} scaleVar={0.15} />
      <NatureCloud prefix="fl" count={56} rmin={12} rmax={80} kinds={['Flower3Group', 'Flower4Group']} jitter={0.6} scaleBase={0.8} scaleVar={0.15} />
      <NatureCloud prefix="g" count={100} rmin={8} rmax={75} kinds={['GrassTall']} jitter={0.8} scaleBase={0.6} scaleVar={0.1} />
    </>
  );
}

/* ===== 2. CIUDAD SAKURA ===== */
export function SakuraCityBiome() {
  return (
    <>
      <ToriiGate position={[0, 0, -20]} scale={1.6} />
      {/* Sakuras procedurales (color rosa específico) */}
      {ring(36, 22, 80, 0.4).map((p, i) => (
        <SakuraTree key={i} position={p} scale={0.9 + (i % 4) * 0.18} />
      ))}
      {backRing(20).map((p, i) => (
        <SakuraTree key={`b-${i}`} position={p} scale={1.3 + (i % 3) * 0.2} />
      ))}
      <NatureCloud prefix="bush" count={48} rmin={14} rmax={80} kinds={['BushFlowers']} jitter={0.6} scaleBase={0.9} scaleVar={0.2} />
      <NatureCloud prefix="fl" count={100} rmin={10} rmax={75} kinds={['Flower3Group', 'Flower4Group']} jitter={0.6} scaleBase={1.0} scaleVar={0.2} />
      <NatureCloud prefix="rock" count={28} rmin={20} rmax={85} kinds={['PebbleRound', 'RockMedium1']} jitter={0.5} scaleBase={0.7} scaleVar={0.15} />
      {/* Lanternas alineadas en camino central */}
      {Array.from({ length: 16 }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const z = -2 - (i >> 1) * 4.5;
        return <Lantern key={i} position={[side * 3.2, 0, z]} color="#ffb45e" />;
      })}
      {/* Casas tradicionales */}
      {ring(12, 35, 65, 0.5).map((p, i) => (
        <group key={`h-${i}`} position={p}>
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.0, 2.0, 2.5]} />
            <meshStandardMaterial color={['#fff8ec', '#ffe5d4', '#fff0e0', '#ffd6e5'][i % 4]} roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.4, 1.2, 4]} />
            <meshStandardMaterial color="#3a2a2a" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ===== 3. LAGO CRISTAL ===== */
export function CrystalLakeBiome() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -16]} receiveShadow>
        <circleGeometry args={[28, 64]} />
        <meshStandardMaterial color="#9be0ff" transparent opacity={0.85} roughness={0.15} metalness={0.25} />
      </mesh>
      {ring(22, 8, 26, 0.7).map((p, i) => (
        <LilyPad key={i} position={[p[0], 0.07, p[2] - 16]} scale={0.9 + (i % 4) * 0.25} />
      ))}
      {/* Crystal spires alrededor del lago */}
      {ring(28, 30, 80, 0.4).map((p, i) => (
        <CrystalSpire key={i} position={p} scale={1.1 + (i % 4) * 0.3} color={i % 3 === 0 ? '#a4f0ff' : i % 3 === 1 ? '#cfe7ff' : '#e0d5ff'} />
      ))}
      {backRing(20).map((p, i) => (
        <CrystalSpire key={`b-${i}`} position={p} scale={1.6 + (i % 3) * 0.4} color={i % 2 === 0 ? '#cfe7ff' : '#e0d5ff'} />
      ))}
      <NatureCloud prefix="bush" count={40} rmin={14} rmax={80} kinds={['BushFlowers']} jitter={0.7} scaleBase={0.8} scaleVar={0.18} />
      <NatureCloud prefix="rock" count={52} rmin={12} rmax={85} kinds={['RockMedium1', 'RockMedium2', 'PebbleRound']} jitter={0.6} scaleBase={0.9} scaleVar={0.2} />
      <NatureCloud prefix="fl" count={60} rmin={14} rmax={80} kinds={['Flower3Group', 'Flower4Group']} jitter={0.6} scaleBase={0.9} scaleVar={0.2} />
      <NatureCloud prefix="g" count={100} rmin={8} rmax={70} kinds={['GrassTall']} jitter={0.8} scaleBase={0.7} scaleVar={0.1} />
    </>
  );
}

/* ===== 4. ARBOLEDA NIEBLA ===== */
export function MistGroveBiome() {
  return (
    <>
      <NatureCloud prefix="dt" count={72} rmin={20} rmax={80} kinds={['DeadTree1', 'TwistedTree1']} jitter={0.6} scaleBase={1.3} scaleVar={0.2} />
      <NatureCloud prefix="bdt" count={44} rmin={80} rmax={130} kinds={['DeadTree1', 'TwistedTree1']} jitter={0.7} scaleBase={1.7} scaleVar={0.25} />
      <NatureCloud prefix="m" count={84} rmin={8} rmax={70} kinds={['MushroomCommon', 'MushroomLaeti']} jitter={0.7} scaleBase={0.9} scaleVar={0.2} />
      <NatureCloud prefix="rock" count={56} rmin={12} rmax={85} kinds={['RockMedium1', 'RockMedium2', 'PebbleRound']} jitter={0.5} scaleBase={1.0} scaleVar={0.2} />
      <NatureCloud prefix="fern" count={60} rmin={14} rmax={75} kinds={['Fern', 'Plant1']} jitter={0.7} scaleBase={0.9} scaleVar={0.15} />
      <NatureCloud prefix="g" count={80} rmin={8} rmax={70} kinds={['GrassTall']} jitter={0.8} scaleBase={0.7} scaleVar={0.1} />
    </>
  );
}

/* ===== 5. PUERTO PASTEL ===== */
export function PastelPortBiome() {
  return (
    <>
      <Lighthouse position={[28, 0, -12]} scale={1.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[44, 0.04, 0]} receiveShadow>
        <planeGeometry args={[50, 100]} />
        <meshStandardMaterial color="#9be0ff" transparent opacity={0.78} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Palmeras procedurales */}
      {ring(24, 22, 80, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={1.1 + (i % 4) * 0.22} />
      ))}
      {backRing(16, 80, 120).map((p, i) => (
        <PalmTree key={`b-${i}`} position={p} scale={1.4 + (i % 3) * 0.25} />
      ))}
      {/* Casas costeras (más densas — sensación villa) */}
      {ring(14, 26, 65, 0.5, 1).map((p, i) => (
        <group key={`h-${i}`} position={p}>
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.8, 2.0, 2.5]} />
            <meshStandardMaterial color={['#ffd6ea', '#ffe5be', '#d8dbff', '#ffe6f5', '#fff5d0'][i % 5]} roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.0, 1.4, 4]} />
            <meshStandardMaterial color={['#c98390', '#d8b890', '#a8d8c0'][i % 3]} roughness={0.7} />
          </mesh>
        </group>
      ))}
      <BeachUmbrella position={[12, 0, 16]} color="#ff9bc8" />
      <BeachUmbrella position={[16, 0, 22]} color="#ffd87a" />
      <BeachUmbrella position={[-14, 0, 18]} color="#a8e0ff" />
      <NatureCloud prefix="bush" count={36} rmin={14} rmax={75} kinds={['BushFlowers']} jitter={0.6} scaleBase={0.8} scaleVar={0.15} />
      <NatureCloud prefix="rock" count={40} rmin={20} rmax={75} kinds={['RockMedium1', 'PebbleRound']} jitter={0.5} scaleBase={0.8} scaleVar={0.18} />
      <NatureCloud prefix="g" count={76} rmin={10} rmax={70} kinds={['GrassTall']} jitter={0.7} scaleBase={0.6} scaleVar={0.1} />
    </>
  );
}

/* ===== 6. VALLE NUBES ===== */
export function CloudValleyBiome() {
  return (
    <>
      {ring(22, 16, 80, 0.5).map((p, i) => (
        <CloudPlatform key={i} position={[p[0], 1.5 + (i % 4) * 0.8, p[2]]} scale={1.1 + (i % 5) * 0.25} />
      ))}
      {ring(20, 24, 100).map((p, i) => (
        <FloatingCloud key={`fc-${i}`} position={[p[0], 8 + (i % 5), p[2]]} scale={1.0 + (i % 4) * 0.4} />
      ))}
      {backRing(20, 80, 130).map((p, i) => (
        <FloatingCloud key={`bf-${i}`} position={[p[0], 12 + (i % 4), p[2]]} scale={1.8 + (i % 3) * 0.5} />
      ))}
      {[
        [10, 0, 10], [-12, 0, 8], [6, 0, -14], [14, 0, 18], [-16, 0, -6], [4, 0, 16]
      ].map((pos, i) => (
        <CottonTree key={`ct-${i}`} position={pos} scale={1.4 + (i % 3) * 0.25} color={['#ffe5e5', '#e5f0ff', '#fff0e5', '#f0e5ff'][i % 4]} />
      ))}
      <NatureCloud prefix="fl" count={72} rmin={12} rmax={75} kinds={['Flower3Group', 'Flower4Group']} jitter={0.6} scaleBase={1.0} scaleVar={0.2} />
      <NatureCloud prefix="g" count={100} rmin={8} rmax={70} kinds={['GrassTall']} jitter={0.8} scaleBase={0.7} scaleVar={0.1} />
    </>
  );
}

/* ===== 7. JARDÍN LUNAR ===== */
export function MoonGardenBiome() {
  return (
    <>
      <MoonOrb position={[-16, 22, -55]} scale={1} />
      <StarField count={400} />
      <NatureCloud prefix="dt" count={72} rmin={22} rmax={80} kinds={['TwistedTree1', 'DeadTree1']} jitter={0.5} scaleBase={1.3} scaleVar={0.2} />
      <NatureCloud prefix="bdt" count={40} rmin={80} rmax={130} kinds={['TwistedTree1']} jitter={0.6} scaleBase={1.7} scaleVar={0.25} />
      <NatureCloud prefix="fl" count={140} rmin={8} rmax={75} kinds={['Flower3Group', 'Flower4Group']} jitter={0.6} scaleBase={1.0} scaleVar={0.2} />
      <NatureCloud prefix="m" count={60} rmin={10} rmax={70} kinds={['MushroomCommon', 'MushroomLaeti']} jitter={0.7} scaleBase={0.9} scaleVar={0.2} />
      <NatureCloud prefix="g" count={120} rmin={8} rmax={70} kinds={['GrassTall']} jitter={0.8} scaleBase={0.7} scaleVar={0.1} />
      {ring(14, 14, 60, 0.7).map((p, i) => (
        <Lantern key={`lg-${i}`} position={p} color="#a8c8ff" />
      ))}
    </>
  );
}

/* ===== 8. PLAYA ALGODÓN ===== */
export function CottonBeachBiome() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 36]} receiveShadow>
        <planeGeometry args={[100, 60]} />
        <meshStandardMaterial color="#a8e8ff" transparent opacity={0.78} roughness={0.2} metalness={0.1} />
      </mesh>
      {ring(22, 22, 80, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={1.1 + (i % 4) * 0.22} />
      ))}
      {backRing(16, 80, 120).map((p, i) => (
        <PalmTree key={`b-${i}`} position={p} scale={1.4 + (i % 3) * 0.25} />
      ))}
      <BeachUmbrella position={[6, 0, 16]} color="#ff9bc8" />
      <BeachUmbrella position={[-10, 0, 20]} color="#ffd87a" />
      <BeachUmbrella position={[12, 0, 24]} color="#a8e0ff" />
      <BeachUmbrella position={[-6, 0, 12]} color="#ffb6e0" />
      <BeachUmbrella position={[16, 0, 10]} color="#c8a8ff" />
      <BeachUmbrella position={[-14, 0, 8]} color="#ffe19b" />
      <NatureCloud prefix="rock" count={72} rmin={8} rmax={75} kinds={['PebbleRound', 'RockMedium1']} jitter={0.5} scaleBase={0.8} scaleVar={0.15} />
      <NatureCloud prefix="g" count={80} rmin={8} rmax={70} kinds={['GrassTall']} jitter={0.8} scaleBase={0.7} scaleVar={0.1} />
      {ring(12, 24, 80).map((p, i) => (
        <FloatingCloud key={`c-${i}`} position={[p[0], 10, p[2]]} scale={1.4 + (i % 3) * 0.4} />
      ))}
    </>
  );
}

/* ===== 9. MONTAÑA AURORA ===== */
export function AuroraMountainBiome() {
  return (
    <>
      <Mountain position={[0, 0, -42]} scale={2.0} color="#5c6f82" />
      <Mountain position={[35, 0, -22]} scale={1.4} color="#4a5d70" />
      <Mountain position={[-35, 0, -22]} scale={1.5} color="#536579" />
      <Mountain position={[50, 0, -55]} scale={1.7} color="#3d4f60" />
      <Mountain position={[-50, 0, -50]} scale={1.8} color="#3d4f60" />
      <AuroraBand position={[0, 14, -42]} />
      <AuroraBand position={[4, 16, -48]} />
      <AuroraBand position={[-6, 15, -40]} />
      <StarField count={240} />
      {/* Pinos GLB con nieve simulada via Pine_3 */}
      <NatureCloud prefix="pine" count={72} rmin={20} rmax={80} kinds={['Pine1', 'Pine3']} jitter={0.5} scaleBase={1.3} scaleVar={0.2} />
      <NatureCloud prefix="bpine" count={52} rmin={80} rmax={130} kinds={['Pine1', 'Pine3']} jitter={0.6} scaleBase={1.8} scaleVar={0.3} />
      <NatureCloud prefix="rock" count={72} rmin={12} rmax={90} kinds={['RockMedium1', 'RockMedium2']} jitter={0.5} scaleBase={1.0} scaleVar={0.2} />
      <NatureCloud prefix="g" count={80} rmin={8} rmax={70} kinds={['GrassTall']} jitter={0.8} scaleBase={0.6} scaleVar={0.1} />
    </>
  );
}

/* ===== 10. VILLA ESTELAR ===== */
export function StellarVillageBiome() {
  return (
    <>
      <StarField count={560} />
      <mesh position={[42, 26, -68]}>
        <sphereGeometry args={[5, 24, 18]} />
        <meshStandardMaterial color="#c89eff" emissive="#7d4ad6" emissiveIntensity={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[42, 26, -68]} rotation={[Math.PI * 0.1, 0, Math.PI * 0.1]}>
        <torusGeometry args={[7.5, 0.18, 8, 64]} />
        <meshBasicMaterial color="#e8d4ff" toneMapped={false} />
      </mesh>
      <mesh position={[-46, 28, -65]}>
        <sphereGeometry args={[2.6, 18, 14]} />
        <meshStandardMaterial color="#ffd6a5" emissive="#ffaa66" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      {/* Casas-flotantes (más densas) */}
      {ring(18, 22, 80, 0.5).map((p, i) => (
        <group key={`sh-${i}`} position={[p[0], 0.8 + (i % 3) * 0.5, p[2]]}>
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[2.4, 1.8, 2.2]} />
            <meshStandardMaterial color={['#d4a8ff', '#ffd6a5', '#a8c8ff', '#fff0a8'][i % 4]} roughness={0.7} emissive={['#a87fee', '#ffaa66', '#7fa8ee', '#e8d044'][i % 4]} emissiveIntensity={0.18} />
          </mesh>
          <mesh position={[0, 2.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.9, 1.0, 4]} />
            <meshStandardMaterial color="#3a2e5a" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {ring(28, 12, 75, 0.6).map((p, i) => (
        <Lantern key={`sv-l-${i}`} position={[p[0], 1.5 + (i % 4) * 0.8, p[2]]} color={['#ffd066', '#a8c8ff', '#ffd6a5', '#d4b6ff'][i % 4]} />
      ))}
      <NatureCloud prefix="rock" count={40} rmin={14} rmax={75} kinds={['PebbleRound']} jitter={0.6} scaleBase={0.8} scaleVar={0.15} />
      <NatureCloud prefix="g" count={60} rmin={8} rmax={70} kinds={['GrassTall']} jitter={0.8} scaleBase={0.6} scaleVar={0.1} />
    </>
  );
}

/* ===== 11. CIUDAD NEÓN ===== */
export function NeonCityBiome() {
  return (
    <>
      {ring(20, 24, 80, 0.3).map((p, i) => (
        <NeonSkyscraper
          key={`tower-${i}`}
          position={p}
          height={8 + (i % 5) * 3}
          color={['#ff66cc', '#7c4dff', '#00d4ff', '#ff8844', '#ffd066'][i % 5]}
          windowColor={['#ffe66b', '#66ffff', '#ff66ff'][i % 3]}
        />
      ))}
      {backRing(20, 80, 130).map((p, i) => (
        <NeonSkyscraper
          key={`btower-${i}`}
          position={p}
          height={14 + (i % 4) * 4}
          color={['#7c4dff', '#ff3a8a', '#00d4ff', '#ff8844'][i % 4]}
          windowColor={['#ffe66b', '#66ffff'][i % 2]}
        />
      ))}
      <NeonSign position={[12, 5, -16]} color="#ff3a8a" />
      <NeonSign position={[-14, 6, -20]} color="#00d4ff" />
      <NeonSign position={[20, 4.5, 8]} color="#ffd066" />
      <NeonSign position={[-24, 7, 6]} color="#7c4dff" />
      <NeonSign position={[28, 6, -8]} color="#ff66cc" />
      {ring(20, 10, 60, 0.5).map((p, i) => (
        <StreetLamp key={`lamp-${i}`} position={p} color={i % 2 === 0 ? '#ffd066' : '#ff66cc'} />
      ))}
      {ring(16, 12, 65, 0.6).map((p, i) => (
        <ParkedCar
          key={`car-${i}`}
          position={p}
          color={['#ff66cc', '#00d4ff', '#ffd066', '#7c4dff', '#ff8844'][i % 5]}
        />
      ))}
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
  'stellar-village': StellarVillageBiome,
  'neon-city': NeonCityBiome
};
