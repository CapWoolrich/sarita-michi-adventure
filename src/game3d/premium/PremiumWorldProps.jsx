import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import InteractiveProp from './InteractiveProp';
import CityHouseLite from './CityHouseLite';
import PortalLite from './PortalLite';
import VehicleLite from './VehicleLite';
import { Lantern, CrystalSpire } from '../biomes/primitives.jsx';

/* ============ helpers ============ */

const seededRing = (key, count, rmin, rmax) => {
  const seed = Array.from(String(key)).reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 7), 0);
  return Array.from({ length: count }, (_, i) => {
    const a = (i / Math.max(1, count)) * Math.PI * 2 + (seed % 13) * 0.21;
    const r = rmin + ((seed + i * 31) % Math.max(1, Math.floor(rmax - rmin)));
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  });
};

/* ============ props ambientales (sin interacción) ============ */

function Fireflies({ count = 12, color = '#ffe39b', radius = 42, height = 1.6 }) {
  const ref = useRef();
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      a: (i / count) * Math.PI * 2,
      r: 9 + ((i * 37) % radius),
      sp: 0.5 + (i % 5) * 0.14,
      ph: i * 1.7
    })),
    [count, radius]
  );
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((m, i) => {
      const s = seeds[i];
      m.position.x = Math.cos(s.a + t * s.sp * 0.16) * s.r;
      m.position.z = Math.sin(s.a + t * s.sp * 0.16) * s.r;
      m.position.y = height + Math.sin(t * s.sp * 2 + s.ph) * 0.55;
      if (m.material) m.material.opacity = 0.55 + Math.sin(t * 2 + s.ph) * 0.35;
    });
  });
  return (
    <group ref={ref}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.07, 6, 5]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function GroundMist({ count = 4, color = '#d8e4dc', radius = 50 }) {
  const ref = useRef();
  const seeds = useMemo(() => seededRing('ground-mist', count, 10, radius), [count, radius]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((m, i) => {
      m.rotation.z = t * 0.04 * (i % 2 ? 1 : -1);
      m.position.y = 0.5 + Math.sin(t * 0.4 + i * 1.9) * 0.12;
    });
  });
  return (
    <group ref={ref}>
      {seeds.map(([x, , z], i) => (
        <mesh key={i} position={[x, 0.5, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[9 + (i % 3) * 3, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function SpookyPumpkin({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.5, 14, 10]} />
        <meshStandardMaterial color="#ff9a4d" roughness={0.7} emissive="#cc5a14" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.25, 6]} />
        <meshStandardMaterial color="#5a7a3a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.16, 0.5, 0.44]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color="#fff1a8" toneMapped={false} />
      </mesh>
      <mesh position={[0.16, 0.5, 0.44]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color="#fff1a8" toneMapped={false} />
      </mesh>
    </group>
  );
}

function KawaiiSign({ position = [0, 0, 0], rotationY = 0, color = '#ff9bc8' }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.8, 8]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[1.3, 0.7, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.7, 0.05]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function PlazaBench({ position = [0, 0, 0], rotationY = 0, color = '#c98390' }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.12, 0.55]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.72, -0.24]} rotation={[-0.22, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-0.7, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.5]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.85} />
      </mesh>
      <mesh position={[0.7, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.5]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Dock({ position = [0, 0, 0], rotationY = 0, length = 10 }) {
  const planks = Math.round(length / 1.6);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {Array.from({ length: planks }).map((_, i) => (
        <mesh key={`p-${i}`} position={[0, 0.32, -i * 1.6]} receiveShadow>
          <boxGeometry args={[2.6, 0.14, 1.45]} />
          <meshStandardMaterial color={i % 2 ? '#c8a070' : '#b8905f'} roughness={0.85} />
        </mesh>
      ))}
      {Array.from({ length: Math.ceil(planks / 2) }).map((_, i) => (
        <group key={`s-${i}`}>
          <mesh position={[-1.2, 0.1, -i * 3.2]}>
            <cylinderGeometry args={[0.13, 0.15, 0.9, 8]} />
            <meshStandardMaterial color="#8a6a4a" roughness={0.9} />
          </mesh>
          <mesh position={[1.2, 0.1, -i * 3.2]}>
            <cylinderGeometry args={[0.13, 0.15, 0.9, 8]} />
            <meshStandardMaterial color="#8a6a4a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WaterFlower({ position = [0, 0, 0], color = '#ff9bc8' }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 10]} />
        <meshStandardMaterial color="#5fae72" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function ChestProp({ position, playerPositionRef, onPropInteract, coins = 12 }) {
  return (
    <InteractiveProp
      position={position}
      radius={2.3}
      once
      hintColor="#ffd066"
      hintY={1.7}
      playerPositionRef={playerPositionRef}
      onInteract={() => onPropInteract?.({ type: 'chest', coins, message: `🎁 ¡Cofre encontrado! +${coins} monedas` })}
    >
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.95, 0.62, 0.68]} />
        <meshStandardMaterial color="#9a6a3f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.95, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#b07a48" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0.36]}>
        <boxGeometry args={[0.16, 0.2, 0.06]} />
        <meshStandardMaterial color="#ffd066" metalness={0.4} roughness={0.3} />
      </mesh>
    </InteractiveProp>
  );
}

/* ============ capas por mundo ============ */

const DOOR_MSG = { type: 'door', message: '🏠 Casita kawaii: pronto podrás entrar' };
const CAR_MSG = { type: 'vehicle', message: '🚗 ¡Vehículo encontrado! Conducción próximamente' };
const PORTAL_MSG = { type: 'portal', message: '🌀 Portal estelar: eventos especiales próximamente' };

function MysticForestProps({ detail, playerPositionRef, onPropInteract }) {
  const crystals = useMemo(() => seededRing('forest-crystal', 3, 18, 46), []);
  return (
    <>
      {detail && <Fireflies count={14} color="#ffe39b" radius={46} />}
      {crystals.map((p, i) => (
        <CrystalSpire key={i} position={p} scale={0.7 + i * 0.2} color={i % 2 ? '#d4b6ff' : '#aef0c8'} />
      ))}
      <ChestProp position={[24, 0, -18]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} />
    </>
  );
}

function SakuraCityProps({ detail, playerPositionRef, onPropInteract }) {
  // Radio 22–34: dentro del anillo de casas del bioma (35–65) para no solaparse
  const houses = useMemo(() => seededRing('sakura-houses', 4, 22, 34), []);
  return (
    <>
      {/* Plaza central kawaii */}
      <group position={[0, 0, 16]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <circleGeometry args={[9, 36]} />
          <meshStandardMaterial color="#f6e2d8" roughness={0.85} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[8.2, 9, 36]} />
          <meshStandardMaterial color="#ff9bc8" roughness={0.6} />
        </mesh>
        <Lantern position={[0, 0, 0]} color="#ffb45e" />
        <PlazaBench position={[-4.5, 0, 2]} rotationY={0.8} />
        <PlazaBench position={[4.5, 0, 2]} rotationY={-0.8} color="#9d6fd3" />
        <PlazaBench position={[0, 0, -5]} rotationY={Math.PI} color="#e2a0b8" />
        <KawaiiSign position={[6.5, 0, -4]} rotationY={-0.6} />
      </group>
      <KawaiiSign position={[3, 0, -10]} rotationY={0.4} color="#dab2ff" />
      {houses.map((p, i) => (
        <CityHouseLite
          key={i}
          position={p}
          rotationY={Math.atan2(-p[0], -p[2])}
          bodyColor={['#fff0e0', '#ffd6e5', '#fff8ec', '#f0ddff'][i % 4]}
          roofColor={['#c98390', '#9d6fd3', '#3a2a2a'][i % 3]}
          interiorId={`sakura-house-${i}`}
          playerPositionRef={playerPositionRef}
          onDoorInteract={() => onPropInteract?.(DOOR_MSG)}
        />
      ))}
      {detail && <Fireflies count={10} color="#ffc2dd" radius={40} height={2.2} />}
      <ChestProp position={[-22, 0, 24]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} />
    </>
  );
}

function LakeBeachProps({ detail, playerPositionRef, onPropInteract, dockAt = [0, 0, -8], dockRot = Math.PI, flowersAt = [[6, 0.08, -18], [-8, 0.08, -22], [12, 0.08, -26]] }) {
  return (
    <>
      <Dock position={dockAt} rotationY={dockRot} length={11} />
      {detail && flowersAt.map((p, i) => (
        <WaterFlower key={i} position={p} color={['#ff9bc8', '#ffe39b', '#dab2ff'][i % 3]} />
      ))}
      {detail && <Fireflies count={8} color="#bdf0ff" radius={36} height={1.2} />}
      <ChestProp position={[26, 0, 14]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} />
    </>
  );
}

function MistGroveProps({ detail, playerPositionRef, onPropInteract }) {
  const pumpkins = useMemo(() => seededRing('grove-pumpkins', 4, 12, 40), []);
  return (
    <>
      <GroundMist count={detail ? 5 : 3} color="#cfdcd4" radius={52} />
      {pumpkins.map((p, i) => (
        <SpookyPumpkin key={i} position={p} scale={0.85 + (i % 3) * 0.25} />
      ))}
      {detail && <Fireflies count={12} color="#a0ffc0" radius={44} height={1.3} />}
      <ChestProp position={[-20, 0, -24]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} coins={15} />
    </>
  );
}

function MoonGardenProps({ detail, playerPositionRef, onPropInteract }) {
  return (
    <>
      <GroundMist count={3} color="#7a82c8" radius={46} />
      {detail && <Fireflies count={12} color="#c8b6ff" radius={42} height={1.8} />}
      <ChestProp position={[18, 0, 26]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} coins={15} />
    </>
  );
}

function MountainProps({ detail, playerPositionRef, onPropInteract }) {
  const crystals = useMemo(() => seededRing('mountain-crystal', 4, 16, 50), []);
  const steps = [[-14, 0.35, 10], [-17, 0.75, 6], [-20, 1.15, 2], [-23, 1.55, -2]];
  return (
    <>
      {crystals.map((p, i) => (
        <CrystalSpire key={i} position={p} scale={1.0 + (i % 3) * 0.4} color={i % 2 ? '#7affd1' : '#cfe7ff'} />
      ))}
      {/* Camino elevado visual (sin física: solo sensación de verticalidad) */}
      {steps.map(([x, y, z], i) => (
        <mesh key={`step-${i}`} position={[x, y, z]} rotation={[0, i * 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 0.7, 3.4]} />
          <meshStandardMaterial color={i % 2 ? '#6d7f8e' : '#7e93a3'} roughness={0.85} />
        </mesh>
      ))}
      {detail && <Fireflies count={8} color="#9fffe0" radius={40} height={2.4} />}
      <ChestProp position={[28, 0, -8]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} coins={15} />
    </>
  );
}

function CloudValleyProps({ detail, playerPositionRef, onPropInteract }) {
  return (
    <>
      {detail && <Fireflies count={10} color="#fff6da" radius={40} height={2.6} />}
      <ChestProp position={[-24, 0, 12]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} />
    </>
  );
}

function StellarVillageProps({ detail, playerPositionRef, onPropInteract }) {
  return (
    <>
      <PortalLite
        position={[0, 0, -28]}
        color="#c89eff"
        innerColor="#ffd6a5"
        scale={1.4}
        playerPositionRef={playerPositionRef}
        onInteract={() => onPropInteract?.(PORTAL_MSG)}
      />
      <VehicleLite position={[14, 0, 10]} rotationY={0.7} color="#a8c8ff" playerPositionRef={playerPositionRef} onInteract={() => onPropInteract?.(CAR_MSG)} />
      <VehicleLite position={[-16, 0, 14]} rotationY={-1.2} color="#ffd6a5" playerPositionRef={playerPositionRef} onInteract={() => onPropInteract?.(CAR_MSG)} />
      {detail && <Fireflies count={12} color="#ffe9b5" radius={44} height={2.2} />}
      <ChestProp position={[22, 0, -16]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} coins={18} />
    </>
  );
}

function NeonCityProps({ detail, playerPositionRef, onPropInteract }) {
  return (
    <>
      <PortalLite
        position={[0, 0, -26]}
        color="#ff66cc"
        innerColor="#00d4ff"
        scale={1.5}
        playerPositionRef={playerPositionRef}
        onInteract={() => onPropInteract?.(PORTAL_MSG)}
      />
      <VehicleLite position={[10, 0, 14]} rotationY={1.1} color="#00d4ff" playerPositionRef={playerPositionRef} onInteract={() => onPropInteract?.(CAR_MSG)} />
      <VehicleLite position={[-12, 0, 18]} rotationY={-0.4} color="#ff66cc" playerPositionRef={playerPositionRef} onInteract={() => onPropInteract?.(CAR_MSG)} />
      <VehicleLite position={[-20, 0, -10]} rotationY={2.1} color="#ffd066" playerPositionRef={playerPositionRef} onInteract={() => onPropInteract?.(CAR_MSG)} />
      {detail && <Fireflies count={14} color="#66ffff" radius={42} height={2.8} />}
      <ChestProp position={[24, 0, 18]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} coins={20} />
    </>
  );
}

const THEME_PROPS = {
  'mystic-forest': MysticForestProps,
  'sakura-city': SakuraCityProps,
  'crystal-lake': (p) => <LakeBeachProps {...p} dockAt={[2, 0, -6]} dockRot={0} />,
  'mist-grove': MistGroveProps,
  'pastel-port': (p) => <LakeBeachProps {...p} dockAt={[30, 0, 8]} dockRot={-Math.PI / 2} flowersAt={[[38, 0.08, 4], [40, 0.08, 12]]} />,
  'cloud-valley': CloudValleyProps,
  'moon-garden': MoonGardenProps,
  'cotton-beach': (p) => <LakeBeachProps {...p} dockAt={[-4, 0, 22]} dockRot={Math.PI} flowersAt={[[8, 0.08, 32], [-12, 0.08, 36], [2, 0.08, 42]]} />,
  'aurora-mountain': MountainProps,
  'stellar-village': StellarVillageProps,
  'neon-city': NeonCityProps
};

/**
 * Capa premium de props por mundo: decoración + interacciones ligeras.
 * - `detail` se apaga en perfiles gráficos bajos (menos partículas/props).
 * - Todo es geometría simple, sin pointLights nuevos ni física.
 */
export default function PremiumWorldProps({ worldTheme, graphicsProfile, playerPositionRef, onPropInteract }) {
  const ThemeProps = THEME_PROPS[worldTheme];
  if (!ThemeProps) return null;
  const detail = (graphicsProfile?.vegetationMultiplier ?? 1) >= 0.7;
  return (
    <ThemeProps detail={detail} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} />
  );
}
