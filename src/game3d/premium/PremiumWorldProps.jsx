import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import InteractiveProp from './InteractiveProp';
import CityHouseLite from './CityHouseLite';
import HouseInteriorLite from './HouseInteriorLite';
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

/**
 * Cofre real: se abre visualmente (tapa animada) cuando su id entra en
 * openedChestsRef (lo abre el jugador local o llega evento multiplayer).
 */
export function ChestProp({ id, position, playerPositionRef, onPropInteract, openedChestsRef, coins = 12, quest = false }) {
  const lidRef = useRef();
  useFrame(() => {
    if (!lidRef.current) return;
    const opened = !!openedChestsRef?.current?.has?.(id);
    const target = opened ? -1.3 : 0;
    lidRef.current.rotation.x += (target - lidRef.current.rotation.x) * 0.14;
  });
  return (
    <InteractiveProp
      position={position}
      radius={2.3}
      once
      hintColor="#ffd066"
      hintY={1.7}
      playerPositionRef={playerPositionRef}
      onInteract={() => onPropInteract?.({ type: 'chest', id, coins, quest, message: `🎁 ¡Cofre encontrado! +${coins} monedas` })}
    >
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.95, 0.62, 0.68]} />
        <meshStandardMaterial color="#9a6a3f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0.36]}>
        <boxGeometry args={[0.16, 0.2, 0.06]} />
        <meshStandardMaterial color="#ffd066" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Tapa con pivote en el borde trasero */}
      <group ref={lidRef} position={[0, 0.65, -0.34]}>
        <mesh position={[0, 0.07, 0.34]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.95, 10, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#b07a48" roughness={0.7} />
        </mesh>
        {/* Brillo interior visible al abrir */}
        <mesh position={[0, 0.02, 0.34]}>
          <sphereGeometry args={[0.16, 8, 6]} />
          <meshBasicMaterial color="#ffe9a8" toneMapped={false} />
        </mesh>
      </group>
    </InteractiveProp>
  );
}

/* ============ capas por mundo ============ */

const CLOSED_MSG = { type: 'door', message: '🔒 Esta casita está cerrada' };
const PORTAL_HINT = '#ffd066';

function MysticForestProps({ detail, playerPositionRef, onPropInteract, openedChestsRef }) {
  const crystals = useMemo(() => seededRing('forest-crystal', 3, 18, 46), []);
  return (
    <>
      {detail && <Fireflies count={14} color="#ffe39b" radius={46} />}
      {crystals.map((p, i) => (
        <CrystalSpire key={i} position={p} scale={0.7 + i * 0.2} color={i % 2 ? '#d4b6ff' : '#aef0c8'} />
      ))}
      <ChestProp id="mystic-forest-chest" position={[24, 0, -18]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} />
    </>
  );
}

function SakuraCityProps({ detail, playerPositionRef, onPropInteract, openedChestsRef, requestTeleport }) {
  // Radio 22–34: dentro del anillo de casas del bioma (35–65) para no solaparse
  const houses = useMemo(() => seededRing('sakura-houses', 4, 22, 34), []);
  // Interiores en esquinas lejanas, dentro del clamp de movimiento (±110)
  const interiors = useMemo(() => ([
    { id: 'sakura-house-0', pos: [-88, 0, -88], accent: '#ff9bc8' },
    { id: 'sakura-house-1', pos: [88, 0, -88], accent: '#dab2ff' }
  ]), []);

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

      {houses.map((p, i) => {
        const interior = interiors[i] ?? null;
        return (
          <CityHouseLite
            key={i}
            position={p}
            rotationY={Math.atan2(-p[0], -p[2])}
            bodyColor={['#fff0e0', '#ffd6e5', '#fff8ec', '#f0ddff'][i % 4]}
            roofColor={['#c98390', '#9d6fd3', '#3a2a2a'][i % 3]}
            interiorId={interior?.id ?? null}
            playerPositionRef={playerPositionRef}
            onDoorInteract={interior
              ? () => {
                  requestTeleport?.(interior.pos[0], interior.pos[2]);
                  onPropInteract?.({ type: 'house_enter', id: interior.id, message: '🏠 ¡Entraste a la casita!' });
                }
              : () => onPropInteract?.(CLOSED_MSG)}
          />
        );
      })}

      {/* Interiores funcionales (dollhouse) con tesoro + michi */}
      {interiors.map((it, i) => {
        const housePos = houses[i] ?? [0, 0, 30];
        const len = Math.hypot(housePos[0], housePos[2]) || 1;
        const exitTarget = [housePos[0] * (1 - 5.8 / len), housePos[2] * (1 - 5.8 / len)];
        return (
          <HouseInteriorLite
            key={it.id}
            id={it.id}
            position={it.pos}
            accent={it.accent}
            exitTarget={exitTarget}
            questChest
            playerPositionRef={playerPositionRef}
            requestTeleport={requestTeleport}
            onPropInteract={onPropInteract}
            openedChestsRef={openedChestsRef}
          />
        );
      })}

      {detail && <Fireflies count={10} color="#ffc2dd" radius={40} height={2.2} />}
      <ChestProp id="sakura-city-chest" position={[-22, 0, 24]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} />
    </>
  );
}

function LakeBeachProps({ detail, playerPositionRef, onPropInteract, openedChestsRef, themeKey = 'lake', dockAt = [0, 0, -8], dockRot = Math.PI, flowersAt = [[6, 0.08, -18], [-8, 0.08, -22], [12, 0.08, -26]] }) {
  return (
    <>
      <Dock position={dockAt} rotationY={dockRot} length={11} />
      {detail && flowersAt.map((p, i) => (
        <WaterFlower key={i} position={p} color={['#ff9bc8', '#ffe39b', '#dab2ff'][i % 3]} />
      ))}
      {detail && <Fireflies count={8} color="#bdf0ff" radius={36} height={1.2} />}
      <ChestProp id={`${themeKey}-chest`} position={[26, 0, 14]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} />
    </>
  );
}

function MistGroveProps({ detail, playerPositionRef, onPropInteract, openedChestsRef }) {
  const pumpkins = useMemo(() => seededRing('grove-pumpkins', 4, 12, 40), []);
  return (
    <>
      <GroundMist count={detail ? 5 : 3} color="#cfdcd4" radius={52} />
      {pumpkins.map((p, i) => (
        <SpookyPumpkin key={i} position={p} scale={0.85 + (i % 3) * 0.25} />
      ))}
      {detail && <Fireflies count={12} color="#a0ffc0" radius={44} height={1.3} />}
      <ChestProp id="mist-grove-chest" position={[-20, 0, -24]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} coins={15} />
    </>
  );
}

function MoonGardenProps({ detail, playerPositionRef, onPropInteract, openedChestsRef }) {
  return (
    <>
      <GroundMist count={3} color="#7a82c8" radius={46} />
      {detail && <Fireflies count={12} color="#c8b6ff" radius={42} height={1.8} />}
      <ChestProp id="moon-garden-chest" position={[18, 0, 26]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} coins={15} />
    </>
  );
}

function MountainProps({ detail, playerPositionRef, onPropInteract, openedChestsRef }) {
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
      <ChestProp id="aurora-mountain-chest" position={[28, 0, -8]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} coins={15} />
    </>
  );
}

function CloudValleyProps({ detail, playerPositionRef, onPropInteract, openedChestsRef }) {
  return (
    <>
      {detail && <Fireflies count={10} color="#fff6da" radius={40} height={2.6} />}
      <ChestProp id="cloud-valley-chest" position={[-24, 0, 12]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} />
    </>
  );
}

/** Par de portales conectados: entrar en uno teletransporta junto al otro. */
function PortalPair({ a, b, colorA = '#c89eff', colorB = '#ffd6a5', scale = 1.3, playerPositionRef, requestTeleport, onPropInteract }) {
  const useA = () => {
    requestTeleport?.(b[0] + 6, b[2] + 6);
    onPropInteract?.({ type: 'portal', id: 'portal-a', message: '🌀 ¡Viaje por portal!' });
  };
  const useB = () => {
    requestTeleport?.(a[0] + 6, a[2] + 6);
    onPropInteract?.({ type: 'portal', id: 'portal-b', message: '🌀 ¡Viaje por portal!' });
  };
  return (
    <>
      <PortalLite position={a} color={colorA} innerColor={PORTAL_HINT} scale={scale} playerPositionRef={playerPositionRef} onInteract={useA} />
      <PortalLite position={b} color={colorB} innerColor={PORTAL_HINT} scale={scale * 0.85} playerPositionRef={playerPositionRef} onInteract={useB} />
    </>
  );
}

function StellarVillageProps({ detail, playerPositionRef, onPropInteract, openedChestsRef, requestTeleport, vehicleStateRef, onVehicleToggle, vehicleDurationMs }) {
  return (
    <>
      <PortalPair
        a={[0, 0, -28]}
        b={[-42, 0, 34]}
        colorA="#c89eff"
        colorB="#ffd6a5"
        scale={1.4}
        playerPositionRef={playerPositionRef}
        requestTeleport={requestTeleport}
        onPropInteract={onPropInteract}
      />
      <VehicleLite position={[14, 0, 10]} rotationY={0.7} color="#a8c8ff" durationMs={vehicleDurationMs} vehicleStateRef={vehicleStateRef} playerPositionRef={playerPositionRef} onVehicleToggle={onVehicleToggle} />
      <VehicleLite position={[-16, 0, 14]} rotationY={-1.2} color="#ffd6a5" durationMs={vehicleDurationMs} vehicleStateRef={vehicleStateRef} playerPositionRef={playerPositionRef} onVehicleToggle={onVehicleToggle} />
      {detail && <Fireflies count={12} color="#ffe9b5" radius={44} height={2.2} />}
      <ChestProp id="stellar-village-chest" position={[22, 0, -16]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} coins={18} />
    </>
  );
}

function NeonCityProps({ detail, playerPositionRef, onPropInteract, openedChestsRef, requestTeleport, vehicleStateRef, onVehicleToggle, vehicleDurationMs }) {
  return (
    <>
      <PortalPair
        a={[0, 0, -26]}
        b={[36, 0, 42]}
        colorA="#ff66cc"
        colorB="#00d4ff"
        scale={1.5}
        playerPositionRef={playerPositionRef}
        requestTeleport={requestTeleport}
        onPropInteract={onPropInteract}
      />
      <VehicleLite position={[10, 0, 14]} rotationY={1.1} color="#00d4ff" durationMs={vehicleDurationMs} vehicleStateRef={vehicleStateRef} playerPositionRef={playerPositionRef} onVehicleToggle={onVehicleToggle} />
      <VehicleLite position={[-12, 0, 18]} rotationY={-0.4} color="#ff66cc" durationMs={vehicleDurationMs} vehicleStateRef={vehicleStateRef} playerPositionRef={playerPositionRef} onVehicleToggle={onVehicleToggle} />
      <VehicleLite position={[-20, 0, -10]} rotationY={2.1} color="#ffd066" durationMs={vehicleDurationMs} vehicleStateRef={vehicleStateRef} playerPositionRef={playerPositionRef} onVehicleToggle={onVehicleToggle} />
      {detail && <Fireflies count={14} color="#66ffff" radius={42} height={2.8} />}
      <ChestProp id="neon-city-chest" position={[24, 0, 18]} playerPositionRef={playerPositionRef} onPropInteract={onPropInteract} openedChestsRef={openedChestsRef} coins={20} />
    </>
  );
}

const THEME_PROPS = {
  'mystic-forest': MysticForestProps,
  'sakura-city': SakuraCityProps,
  'crystal-lake': (p) => <LakeBeachProps {...p} themeKey="crystal-lake" dockAt={[2, 0, -6]} dockRot={0} />,
  'mist-grove': MistGroveProps,
  'pastel-port': (p) => <LakeBeachProps {...p} themeKey="pastel-port" dockAt={[30, 0, 8]} dockRot={-Math.PI / 2} flowersAt={[[38, 0.08, 4], [40, 0.08, 12]]} />,
  'cloud-valley': CloudValleyProps,
  'moon-garden': MoonGardenProps,
  'cotton-beach': (p) => <LakeBeachProps {...p} themeKey="cotton-beach" dockAt={[-4, 0, 22]} dockRot={Math.PI} flowersAt={[[8, 0.08, 32], [-12, 0.08, 36], [2, 0.08, 42]]} />,
  'aurora-mountain': MountainProps,
  'stellar-village': StellarVillageProps,
  'neon-city': NeonCityProps
};

/**
 * Capa premium de props por mundo: decoración + interacciones reales
 * (cofres con tapa, casas con interior, vehículos montables, portales que
 * teletransportan).
 * - `detail` se apaga en perfiles gráficos bajos (menos partículas/props).
 * - Todo es geometría simple, sin pointLights nuevos ni física.
 */
export default function PremiumWorldProps({
  worldTheme,
  missionType = 'rescue',
  graphicsProfile,
  playerPositionRef,
  onPropInteract,
  requestTeleport,
  vehicleStateRef,
  openedChestsRef
}) {
  const ThemeProps = THEME_PROPS[worldTheme];
  if (!ThemeProps) return null;
  const detail = (graphicsProfile?.vegetationMultiplier ?? 1) >= 0.7;
  // En la misión de carrera el vehículo dura más para alcanzar los anillos
  const vehicleDurationMs = missionType === 'vehicle_dash' ? 30000 : 14000;
  const onVehicleToggle = (info) => onPropInteract?.({
    type: 'vehicle',
    active: !!info?.active,
    message: info?.active ? '🚗 ¡Vehículo activado!' : '🚗 Bajaste del vehículo'
  });
  return (
    <ThemeProps
      detail={detail}
      playerPositionRef={playerPositionRef}
      onPropInteract={onPropInteract}
      requestTeleport={requestTeleport}
      vehicleStateRef={vehicleStateRef}
      onVehicleToggle={onVehicleToggle}
      vehicleDurationMs={vehicleDurationMs}
      openedChestsRef={openedChestsRef}
    />
  );
}
