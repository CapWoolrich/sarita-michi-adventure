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

/* Banda exterior densa para crear "fondo" del bioma — radio 22..36 */
function backRing(count, rmin = 22, rmax = 36, jitter = 0.6) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.sin(i * 4.1) * jitter;
    const r = rmin + ((i * 2.3) % (rmax - rmin));
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  });
}

/* ===== 1. BOSQUE MÍSTICO — con Stylized Nature MegaKit ===== */
export function MysticForestBiome() {
  const treeKinds = ['CommonTree1', 'CommonTree3'];
  return (
    <>
      {/* Árboles GLB con variedad */}
      {ring(28, 28, 48, 0.6).map((p, i) => (
        <NatureModel
          key={`t-${i}`}
          kind={treeKinds[i % treeKinds.length]}
          position={p}
          rotation={[0, (i * 0.97) % 6.28, 0]}
          scale={1.2 + (i % 5) * 0.18}
        />
      ))}
      {backRing(20).map((p, i) => (
        <NatureModel
          key={`bt-${i}`}
          kind={i % 2 === 0 ? 'CommonTree1' : 'CommonTree3'}
          position={p}
          rotation={[0, (i * 0.7) % 6.28, 0]}
          scale={1.6 + (i % 4) * 0.22}
        />
      ))}
      {/* Hongos GLB */}
      {ring(18, 10, 32, 0.7).map((p, i) => (
        <NatureModel
          key={`m-${i}`}
          kind={i % 2 === 0 ? 'MushroomCommon' : 'MushroomLaeti'}
          position={p}
          rotation={[0, (i * 1.3) % 6.28, 0]}
          scale={0.6 + (i % 3) * 0.15}
        />
      ))}
      {/* Piedras GLB */}
      {ring(12, 14, 44, 0.5).map((p, i) => (
        <NatureModel
          key={`r-${i}`}
          kind={i % 2 === 0 ? 'RockMedium1' : 'RockMedium2'}
          position={p}
          rotation={[0, (i * 0.5) % 6.28, 0]}
          scale={0.8 + (i % 3) * 0.2}
        />
      ))}
      {/* Helechos y plantas decorativas */}
      {ring(20, 12, 36, 0.7).map((p, i) => (
        <NatureModel
          key={`f-${i}`}
          kind={i % 3 === 0 ? 'Fern' : i % 3 === 1 ? 'Plant1' : 'BushFlowers'}
          position={p}
          rotation={[0, (i * 1.1) % 6.28, 0]}
          scale={0.7 + (i % 4) * 0.15}
        />
      ))}
      {/* Flores GLB */}
      {ring(14, 12, 32, 0.6).map((p, i) => (
        <NatureModel
          key={`fl-${i}`}
          kind={i % 2 === 0 ? 'Flower3Group' : 'Flower4Group'}
          position={p}
          rotation={[0, (i * 0.83) % 6.28, 0]}
          scale={0.7 + (i % 3) * 0.15}
        />
      ))}
      {/* Hierba decorativa GLB */}
      {ring(30, 8, 36, 0.8).map((p, i) => (
        <NatureModel
          key={`g-${i}`}
          kind="GrassTall"
          position={p}
          rotation={[0, (i * 1.5) % 6.28, 0]}
          scale={0.5 + (i % 4) * 0.1}
        />
      ))}
    </>
  );
}

/* ===== 2. CIUDAD SAKURA ===== */
export function SakuraCityBiome() {
  return (
    <>
      <ToriiGate position={[0, 0, -20]} scale={1.6} />
      {ring(28, 22, 44, 0.4).map((p, i) => (
        <SakuraTree key={i} position={p} scale={0.85 + (i % 4) * 0.15} />
      ))}
      {backRing(18).map((p, i) => (
        <SakuraTree key={`b-${i}`} position={p} scale={1.1 + (i % 3) * 0.18} />
      ))}
      <FlowerScatter count={60} area={44} palette={['#ff9bc8', '#ffc8e3', '#ffe1ee', '#ffb6d9']} />
      {Array.from({ length: 10 }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const z = -2 - (i >> 1) * 2.4;
        return <Lantern key={i} position={[side * 1.8, 0, z]} color="#ffb45e" />;
      })}
      {ring(8, 34, 44, 0.5).map((p, i) => (
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
      <GrassPatches count={90} area={48} color="#cfb09e" />
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
      {ring(14, 8, 28, 0.7).map((p, i) => (
        <LilyPad key={i} position={[p[0], 0.07, p[2] - 8]} scale={0.7 + (i % 4) * 0.2} />
      ))}
      {ring(20, 26, 44, 0.4).map((p, i) => (
        <CrystalSpire key={i} position={p} scale={0.9 + (i % 4) * 0.25} color={i % 3 === 0 ? '#a4f0ff' : i % 3 === 1 ? '#cfe7ff' : '#e0d5ff'} />
      ))}
      {backRing(16).map((p, i) => (
        <CrystalSpire key={`b-${i}`} position={p} scale={1.3 + (i % 3) * 0.3} color={i % 2 === 0 ? '#cfe7ff' : '#e0d5ff'} />
      ))}
      <GrassPatches count={100} area={48} color="#b1d4b8" />
      <FlowerScatter count={32} area={40} palette={['#9bdaff', '#cfe7ff', '#e0d5ff', '#b8e8ff']} />
      <RockCluster positions={ring(14, 12, 44).map(([x, , z]) => [x, 0.15, z])} color="#a8c4d0" />
    </>
  );
}

/* ===== 4. ARBOLEDA DE NIEBLA ===== */
export function MistGroveBiome() {
  return (
    <>
      {ring(32, 20, 44, 0.6).map((p, i) => (
        <BareTree key={i} position={p} scale={0.9 + (i % 5) * 0.15} />
      ))}
      {backRing(20).map((p, i) => (
        <BareTree key={`b-${i}`} position={p} scale={1.2 + (i % 3) * 0.2} />
      ))}
      <MushroomCluster positions={ring(34, 8, 36, 0.7).map(([x, , z]) => [x, 0, z])} color="#a5e8c8" />
      <RockCluster positions={ring(20, 12, 44).map(([x, , z]) => [x, 0.2, z])} color="#4a4d52" />
      <GrassPatches count={80} area={44} color="#6a8070" />
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
      {ring(20, 22, 44, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={0.9 + (i % 4) * 0.18} />
      ))}
      {backRing(14, 44, 64).map((p, i) => (
        <PalmTree key={`b-${i}`} position={p} scale={1.1 + (i % 3) * 0.2} />
      ))}
      {ring(9, 28, 40, 0.5, 1).map((p, i) => (
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
      <GrassPatches count={70} area={44} color="#dac8b6" />
      <FlowerScatter count={28} area={40} palette={['#ffb6d0', '#ffd87a', '#a8e0ff']} />
    </>
  );
}

/* ===== 6. VALLE DE LAS NUBES ===== */
export function CloudValleyBiome() {
  return (
    <>
      {ring(18, 16, 40, 0.5).map((p, i) => (
        <CloudPlatform key={i} position={[p[0], 1.2 + (i % 4) * 0.6, p[2]]} scale={0.9 + (i % 5) * 0.2} />
      ))}
      {ring(14, 24, 52).map((p, i) => (
        <FloatingCloud key={`fc-${i}`} position={[p[0], 6 + (i % 5), p[2]]} scale={0.8 + (i % 4) * 0.3} />
      ))}
      {backRing(16, 44, 68).map((p, i) => (
        <FloatingCloud key={`bf-${i}`} position={[p[0], 8 + (i % 4), p[2]]} scale={1.4 + (i % 3) * 0.4} />
      ))}
      {[
        [5, 0, 5], [-6, 0, 4], [3, 0, -7], [7, 0, 9], [-8, 0, -3], [2, 0, 8]
      ].map((pos, i) => (
        <CottonTree key={`ct-${i}`} position={pos} scale={1.0 + (i % 3) * 0.2} color={['#ffe5e5', '#e5f0ff', '#fff0e5', '#f0e5ff'][i % 4]} />
      ))}
      <FlowerScatter count={42} area={36} palette={['#cfe7ff', '#e8d5ff', '#fff0fa', '#ffe5f0']} />
      <GrassPatches count={90} area={40} color="#cad8d2" />
    </>
  );
}

/* ===== 7. JARDÍN LUNAR ===== */
export function MoonGardenBiome() {
  return (
    <>
      <MoonOrb position={[-16, 22, -55]} scale={1} />
      <StarField count={160} />
      {ring(28, 22, 44, 0.5).map((p, i) => (
        <BareTree key={i} position={p} scale={0.9 + (i % 5) * 0.15} />
      ))}
      {backRing(20).map((p, i) => (
        <BareTree key={`b-${i}`} position={p} scale={1.2 + (i % 3) * 0.2} />
      ))}
      <FlowerScatter count={80} area={44} palette={['#a8c8ff', '#d4b6ff', '#7fcfff', '#ffd6f5', '#c8a8ff']} />
      <MushroomCluster positions={ring(22, 10, 36).map(([x, , z]) => [x, 0, z])} color="#a8c8ff" />
      <GrassPatches count={100} area={44} color="#5b5f86" />
      {ring(10, 14, 36, 0.7).map((p, i) => (
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
      {ring(18, 22, 44, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={0.9 + (i % 4) * 0.18} />
      ))}
      {backRing(14, 44, 64).map((p, i) => (
        <PalmTree key={`b-${i}`} position={p} scale={1.1 + (i % 3) * 0.2} />
      ))}
      <BeachUmbrella position={[3, 0, 8]} color="#ff9bc8" />
      <BeachUmbrella position={[-5, 0, 10]} color="#ffd87a" />
      <BeachUmbrella position={[6, 0, 12]} color="#a8e0ff" />
      <BeachUmbrella position={[-3, 0, 6]} color="#ffb6e0" />
      <BeachUmbrella position={[8, 0, 5]} color="#c8a8ff" />
      <BeachUmbrella position={[-7, 0, 4]} color="#ffe19b" />
      <RockCluster positions={ring(28, 8, 36).map(([x, , z]) => [x, 0.05, z])} color="#ffd6c8" />
      <GrassPatches count={60} area={40} color="#f1d7af" />
      {ring(10, 24, 44).map((p, i) => (
        <FloatingCloud key={`c-${i}`} position={[p[0], 8, p[2]]} scale={1.1 + (i % 3) * 0.3} />
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
      <StarField count={90} />
      {ring(28, 20, 44, 0.5).map((p, i) => (
        <PineTree key={i} position={p} scale={0.9 + (i % 5) * 0.12} color={i % 2 === 0 ? '#3d6e58' : '#4f8567'} />
      ))}
      {backRing(20).map((p, i) => (
        <PineTree key={`b-${i}`} position={p} scale={1.3 + (i % 3) * 0.2} color={i % 2 === 0 ? '#2f5945' : '#3d6e58'} />
      ))}
      <RockCluster positions={ring(22, 12, 44).map(([x, , z]) => [x, 0.15, z])} color="#c5d8e0" />
      <GrassPatches count={70} area={44} color="#7a8b95" />
    </>
  );
}

/* ===== 10. VILLA ESTELAR ===== */
export function StellarVillageBiome() {
  return (
    <>
      <StarField count={220} />
      <mesh position={[42, 26, -68]}>
        <sphereGeometry args={[3, 24, 18]} />
        <meshStandardMaterial color="#c89eff" emissive="#7d4ad6" emissiveIntensity={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[42, 26, -68]} rotation={[Math.PI * 0.1, 0, Math.PI * 0.1]}>
        <torusGeometry args={[4.5, 0.1, 8, 64]} />
        <meshBasicMaterial color="#e8d4ff" toneMapped={false} />
      </mesh>
      <mesh position={[-46, 28, -65]}>
        <sphereGeometry args={[1.6, 18, 14]} />
        <meshStandardMaterial color="#ffd6a5" emissive="#ffaa66" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      {ring(12, 22, 44, 0.5).map((p, i) => (
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
      {ring(22, 12, 44, 0.6).map((p, i) => (
        <Lantern key={`sv-l-${i}`} position={[p[0], 1.0 + (i % 4) * 0.6, p[2]]} color={['#ffd066', '#a8c8ff', '#ffd6a5', '#d4b6ff'][i % 4]} />
      ))}
      <GrassPatches count={60} area={40} color="#655782" />
    </>
  );
}


/* ===== 11. CIUDAD NEÓN — Tokyo nocturno kawaii (mundo secreto) ===== */
export function NeonCityBiome() {
  return (
    <>
      {/* Anillo interno: rascacielos pastel */}
      {ring(14, 24, 44, 0.3).map((p, i) => (
        <NeonSkyscraper
          key={`tower-${i}`}
          position={p}
          height={6 + (i % 5) * 2.5}
          color={['#ff66cc', '#7c4dff', '#00d4ff', '#ff8844', '#ffd066'][i % 5]}
          windowColor={['#ffe66b', '#66ffff', '#ff66ff'][i % 3]}
        />
      ))}
      {/* Anillo externo: torres más altas */}
      {backRing(12, 48, 72).map((p, i) => (
        <NeonSkyscraper
          key={`btower-${i}`}
          position={p}
          height={10 + (i % 4) * 3}
          color={['#7c4dff', '#ff3a8a', '#00d4ff', '#ff8844'][i % 4]}
          windowColor={['#ffe66b', '#66ffff'][i % 2]}
        />
      ))}
      {/* Letreros neón */}
      <NeonSign position={[6, 4, -8]} color="#ff3a8a" />
      <NeonSign position={[-7, 5, -10]} color="#00d4ff" />
      <NeonSign position={[10, 3.5, 4]} color="#ffd066" />
      <NeonSign position={[-12, 6, 3]} color="#7c4dff" />
      {/* Faroles de calle */}
      {ring(10, 10, 28, 0.5).map((p, i) => (
        <StreetLamp key={`lamp-${i}`} position={p} color={i % 2 === 0 ? '#ffd066' : '#ff66cc'} />
      ))}
      {/* Carros estacionados */}
      {ring(8, 12, 26, 0.6).map((p, i) => (
        <ParkedCar
          key={`car-${i}`}
          position={p}
          color={['#ff66cc', '#00d4ff', '#ffd066', '#7c4dff', '#ff8844'][i % 5]}
        />
      ))}
      <GrassPatches count={40} area={40} color="#2a2545" />
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
