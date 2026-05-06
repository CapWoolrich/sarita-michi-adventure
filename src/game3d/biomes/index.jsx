import {
  PineTree, SakuraTree, PalmTree, CrystalSpire, BareTree, CottonTree,
  GrassPatches, FlowerScatter, MushroomCluster, RockCluster, FloatingCloud,
  ToriiGate, Lighthouse, MoonOrb, Mountain, AuroraBand, StarField,
  Lantern, LilyPad, CloudPlatform, BeachUmbrella
} from './primitives.jsx';

/* Distribuir N items en una corona alrededor del spawn (rmin..rmax) */
function ring(count, rmin, rmax, jitter = 0.4, seedOffset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i + seedOffset) / count) * Math.PI * 2 + Math.sin(i * 7.3) * jitter;
    const r = rmin + ((i * 1.7) % (rmax - rmin));
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  });
}

/* ===== 1. BOSQUE MÍSTICO — densos pinos, hongos brillantes, niebla ===== */
export function MysticForestBiome() {
  return (
    <>
      {ring(28, 12, 26, 0.5).map((p, i) => (
        <PineTree key={i} position={p} scale={0.85 + (i % 5) * 0.12} color={i % 3 === 0 ? '#5fa667' : '#7ac985'} />
      ))}
      <GrassPatches count={120} area={28} color="#7ac56b" />
      <FlowerScatter count={32} area={20} palette={['#ffd0e7', '#ffe39b', '#dab2ff']} />
      <MushroomCluster
        positions={ring(14, 5, 14).map(([x, , z]) => [x, 0, z])}
        color="#e98890"
      />
      <RockCluster positions={ring(10, 8, 22).map(([x, , z]) => [x, 0.2, z])} color="#7c8580" />
    </>
  );
}

/* ===== 2. CIUDAD SAKURA — sakuras, torii, lanternas, calle ===== */
export function SakuraCityBiome() {
  return (
    <>
      <ToriiGate position={[0, 0, -10]} scale={1.1} />
      {ring(22, 11, 26, 0.4).map((p, i) => (
        <SakuraTree key={i} position={p} scale={0.85 + (i % 4) * 0.15} />
      ))}
      <FlowerScatter count={40} area={22} palette={['#ff9bc8', '#ffc8e3', '#ffe1ee']} />
      {/* Lanternas alineadas */}
      {Array.from({ length: 8 }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const z = -2 - (i >> 1) * 3;
        return <Lantern key={i} position={[side * 1.8, 0, z]} color="#ffb45e" />;
      })}
      {/* Casas tradicionales (pequeñas) */}
      {ring(6, 18, 22).map((p, i) => (
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
    </>
  );
}

/* ===== 3. LAGO CRISTAL — gran lago central, spires de cristal, lirios ===== */
export function CrystalLakeBiome() {
  return (
    <>
      {/* Lago grande al norte */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -8]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#9be0ff" transparent opacity={0.85} roughness={0.15} metalness={0.25} />
      </mesh>
      {/* Lirios */}
      {ring(10, 4, 14, 0.7).map((p, i) => (
        <LilyPad key={i} position={[p[0], 0.07, p[2] - 8]} scale={0.7 + (i % 4) * 0.2} />
      ))}
      {/* Spires de cristal alrededor del lago */}
      {ring(14, 13, 22, 0.4).map((p, i) => (
        <CrystalSpire
          key={i}
          position={p}
          scale={0.9 + (i % 4) * 0.25}
          color={i % 3 === 0 ? '#a4f0ff' : i % 3 === 1 ? '#cfe7ff' : '#e0d5ff'}
        />
      ))}
      <GrassPatches count={70} area={24} color="#b1d4b8" />
      <FlowerScatter count={20} area={20} palette={['#9bdaff', '#cfe7ff', '#e0d5ff']} />
    </>
  );
}

/* ===== 4. ARBOLEDA DE NIEBLA — árboles muertos, hongos brillantes, mood oscuro ===== */
export function MistGroveBiome() {
  return (
    <>
      {ring(24, 10, 25, 0.6).map((p, i) => (
        <BareTree key={i} position={p} scale={0.9 + (i % 5) * 0.15} />
      ))}
      <MushroomCluster
        positions={ring(22, 4, 16, 0.7).map(([x, , z]) => [x, 0, z])}
        color="#a5e8c8"
      />
      <RockCluster positions={ring(14, 6, 22).map(([x, , z]) => [x, 0.2, z])} color="#4a4d52" />
      <GrassPatches count={50} area={22} color="#6a8070" />
    </>
  );
}

/* ===== 5. PUERTO PASTEL — faro, palmeras, casas de costa ===== */
export function PastelPortBiome() {
  return (
    <>
      <Lighthouse position={[14, 0, -6]} scale={1.2} />
      {/* Mar al este */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, 0.04, 0]} receiveShadow>
        <planeGeometry args={[28, 60]} />
        <meshStandardMaterial color="#9be0ff" transparent opacity={0.78} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Palmeras */}
      {ring(14, 11, 23, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={0.9 + (i % 4) * 0.18} />
      ))}
      {/* Casas costeras */}
      {ring(7, 14, 20, 0.5, 1).map((p, i) => (
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
      <GrassPatches count={50} area={22} color="#dac8b6" />
    </>
  );
}

/* ===== 6. VALLE DE LAS NUBES — plataformas de nube flotantes, todo etéreo ===== */
export function CloudValleyBiome() {
  return (
    <>
      {/* Plataformas de nube alrededor */}
      {ring(12, 8, 22, 0.5).map((p, i) => (
        <CloudPlatform key={i} position={[p[0], 1.5 + (i % 4) * 0.6, p[2]]} scale={0.9 + (i % 5) * 0.2} />
      ))}
      {/* Nubes muy altas */}
      {ring(10, 12, 26).map((p, i) => (
        <FloatingCloud key={`fc-${i}`} position={[p[0], 7 + (i % 5), p[2]]} scale={0.8 + (i % 4) * 0.3} />
      ))}
      <CottonTree position={[5, 0, 5]} scale={1.2} color="#ffe5e5" />
      <CottonTree position={[-6, 0, 4]} scale={1.0} color="#e5f0ff" />
      <CottonTree position={[3, 0, -7]} scale={1.1} color="#fff0e5" />
      <FlowerScatter count={30} area={18} palette={['#cfe7ff', '#e8d5ff', '#fff0fa']} />
      <GrassPatches count={60} area={20} color="#cad8d2" />
    </>
  );
}

/* ===== 7. JARDÍN LUNAR — noche, luna gigante, flores brillantes, estrellas ===== */
export function MoonGardenBiome() {
  return (
    <>
      <MoonOrb position={[-8, 14, -25]} scale={1} />
      <StarField count={120} />
      {ring(20, 11, 24, 0.5).map((p, i) => (
        <BareTree key={i} position={p} scale={0.9 + (i % 5) * 0.15} />
      ))}
      <FlowerScatter count={60} area={22} palette={['#a8c8ff', '#d4b6ff', '#7fcfff', '#ffd6f5']} />
      <MushroomCluster
        positions={ring(14, 5, 16).map(([x, , z]) => [x, 0, z])}
        color="#a8c8ff"
      />
      <GrassPatches count={70} area={22} color="#5b5f86" />
      {/* Lanternas dispersas */}
      {ring(6, 7, 14, 0.7).map((p, i) => (
        <Lantern key={`lg-${i}`} position={p} color="#a8c8ff" />
      ))}
    </>
  );
}

/* ===== 8. PLAYA ALGODÓN — palmas + sombrillas + dunas + olas ===== */
export function CottonBeachBiome() {
  return (
    <>
      {/* Mar al sur */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 18]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#a8e8ff" transparent opacity={0.78} roughness={0.2} metalness={0.1} />
      </mesh>
      {ring(12, 11, 22, 0.5).map((p, i) => (
        <PalmTree key={i} position={p} scale={0.9 + (i % 4) * 0.18} />
      ))}
      <BeachUmbrella position={[3, 0, 8]} color="#ff9bc8" />
      <BeachUmbrella position={[-5, 0, 10]} color="#ffd87a" />
      <BeachUmbrella position={[6, 0, 12]} color="#a8e0ff" />
      <BeachUmbrella position={[-3, 0, 6]} color="#ffb6e0" />
      {/* Conchas (uso piedras coloreadas) */}
      <RockCluster
        positions={ring(20, 4, 16).map(([x, , z]) => [x, 0.05, z])}
        color="#ffd6c8"
      />
      <GrassPatches count={40} area={20} color="#f1d7af" />
      {ring(6, 12, 20).map((p, i) => (
        <FloatingCloud key={`c-${i}`} position={[p[0], 8, p[2]]} scale={1.1 + (i % 3) * 0.3} />
      ))}
    </>
  );
}

/* ===== 9. MONTAÑA AURORA — pinos nevados, montañas, aurora boreal ===== */
export function AuroraMountainBiome() {
  return (
    <>
      <Mountain position={[0, 0, -22]} scale={1.1} color="#5c6f82" />
      <Mountain position={[18, 0, -10]} scale={0.7} color="#4a5d70" />
      <Mountain position={[-18, 0, -12]} scale={0.8} color="#536579" />
      <AuroraBand position={[0, 9, -22]} />
      <AuroraBand position={[2, 11, -24]} />
      <StarField count={60} />
      {ring(20, 10, 24, 0.5).map((p, i) => (
        <PineTree key={i} position={p} scale={0.9 + (i % 5) * 0.12} color={i % 2 === 0 ? '#3d6e58' : '#4f8567'} />
      ))}
      <RockCluster
        positions={ring(16, 6, 22).map(([x, , z]) => [x, 0.15, z])}
        color="#c5d8e0"
      />
      <GrassPatches count={50} area={22} color="#7a8b95" />
    </>
  );
}

/* ===== 10. VILLA ESTELAR — espacio profundo, lanternas flotantes, planetas ===== */
export function StellarVillageBiome() {
  return (
    <>
      <StarField count={180} />
      {/* "Planeta" pequeño en el horizonte */}
      <mesh position={[20, 16, -34]}>
        <sphereGeometry args={[3, 24, 18]} />
        <meshStandardMaterial color="#c89eff" emissive="#7d4ad6" emissiveIntensity={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[20, 16, -34]} rotation={[Math.PI * 0.1, 0, Math.PI * 0.1]}>
        <torusGeometry args={[4.5, 0.1, 8, 64]} />
        <meshBasicMaterial color="#e8d4ff" toneMapped={false} />
      </mesh>
      {/* Casas-flotantes */}
      {ring(8, 11, 22, 0.5).map((p, i) => (
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
      {/* Lanternas flotantes */}
      {ring(14, 6, 20, 0.6).map((p, i) => (
        <Lantern key={`sv-l-${i}`} position={[p[0], 1.5 + (i % 4) * 0.5, p[2]]} color={['#ffd066', '#a8c8ff', '#ffd6a5'][i % 3]} />
      ))}
      <GrassPatches count={40} area={20} color="#655782" />
    </>
  );
}

/* ===== DISPATCHER ===== */
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
