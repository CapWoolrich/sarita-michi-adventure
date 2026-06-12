import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
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

/* ============ sistemas jugables compartidos por mundo ============ */

const CLOSED_MSG = { type: 'door', message: '🔒 Esta casita está cerrada' };
const PORTAL_HINT = '#ffd066';

/** Letrero flotante de zona (named location, estilo battle-royale kawaii). */
function ZoneLabel({ text, position = [0, 6, 0], color = '#ffffff', scale = 6 }) {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.font = '900 56px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(30, 22, 60, 0.85)';
    ctx.strokeText(text, 256, 66);
    ctx.fillStyle = color;
    ctx.fillText(text, 256, 66);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    return tex;
  }, [text, color]);
  useEffect(() => () => texture?.dispose?.(), [texture]);
  if (!texture) return null;
  return (
    <sprite position={position} scale={[scale, scale * 0.25, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

/**
 * Entrega aérea kawaii (supply drop): un cofre con globo cae del cielo a
 * mitad del nivel, marcado con un haz de luz. Loot "raro": más monedas.
 * Sin física: descenso interpolado en un solo useFrame.
 */
function SupplyDrop({ id, landAt = [0, 0], delayMs = 20000, descentMs = 11000, coins = 25, playerPositionRef, onPropInteract, openedChestsRef }) {
  const crateRef = useRef();
  const beamRef = useRef();
  const balloonRef = useRef();
  const stRef = useRef({ t0: null, opened: false, inside: false });
  const [x, z] = landAt;

  useFrame(() => {
    const st = stRef.current;
    if (st.t0 == null) st.t0 = Date.now();
    const elapsed = Date.now() - st.t0;
    const visible = elapsed >= delayMs;
    if (crateRef.current) crateRef.current.visible = visible;
    if (beamRef.current) beamRef.current.visible = visible && !st.opened;
    if (!visible) return;
    const t = Math.min(1, (elapsed - delayMs) / descentMs);
    if (crateRef.current) {
      crateRef.current.position.set(
        x + Math.sin(elapsed * 0.001) * (1 - t) * 2.2,
        (1 - t) * 52,
        z + Math.cos(elapsed * 0.0013) * (1 - t) * 2.2
      );
    }
    if (balloonRef.current) balloonRef.current.visible = !st.opened;
    const remoteOpened = !!openedChestsRef?.current?.has?.(id);
    if (remoteOpened && !st.opened) st.opened = true;
    const player = playerPositionRef?.current;
    if (!player || t < 1 || st.opened) return;
    const distance = Math.hypot(player.x - x, player.z - z);
    if (distance < 2.4 && !st.inside) {
      st.opened = true;
      openedChestsRef?.current?.add?.(id);
      onPropInteract?.({ type: 'chest', id, coins, message: `🎈 ¡Entrega aérea! +${coins} monedas` });
    }
    st.inside = distance < 2.4;
  });

  return (
    <group>
      <group ref={crateRef} position={[x, 52, z]} visible={false}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.0, 1.2]} />
          <meshStandardMaterial color="#ff8eb8" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.0, 0.61]}>
          <boxGeometry args={[0.3, 0.3, 0.04]} />
          <meshStandardMaterial color="#ffd066" metalness={0.4} roughness={0.3} />
        </mesh>
        <group ref={balloonRef}>
          <mesh position={[0, 2.6, 0]}>
            <sphereGeometry args={[1.1, 14, 12]} />
            <meshStandardMaterial color="#ffd066" roughness={0.4} emissive="#ffaa33" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[-0.5, 1.5, -0.5]} rotation={[0, 0, 0.35]}>
            <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
            <meshBasicMaterial color="#fff3d0" />
          </mesh>
          <mesh position={[0.5, 1.5, 0.5]} rotation={[0, 0, -0.35]}>
            <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
            <meshBasicMaterial color="#fff3d0" />
          </mesh>
        </group>
      </group>
      <mesh ref={beamRef} position={[x, 9, z]} visible={false}>
        <cylinderGeometry args={[0.5, 1.7, 18, 10, 1, true]} />
        <meshBasicMaterial color="#ffd066" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Plaza/punto de encuentro: ancla visual para la zona de regreso de city_quest. */
function MeetingPlaza({ position = [0, 0, 16], floor = '#f6e2d8', ring = '#ff9bc8', lantern = '#ffb45e', benches = true, label = null }) {
  return (
    <group position={position}>
      {label && <ZoneLabel text={label} position={[0, 5.5, 0]} color={ring} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[9, 36]} />
        <meshStandardMaterial color={floor} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[8.2, 9, 36]} />
        <meshStandardMaterial color={ring} roughness={0.6} />
      </mesh>
      <Lantern position={[0, 0, 0]} color={lantern} />
      {benches && (
        <>
          <PlazaBench position={[-4.5, 0, 2]} rotationY={0.8} />
          <PlazaBench position={[4.5, 0, 2]} rotationY={-0.8} color="#9d6fd3" />
          <PlazaBench position={[0, 0, -5]} rotationY={Math.PI} color="#e2a0b8" />
        </>
      )}
    </group>
  );
}

/** Par de portales conectados: entrar en uno teletransporta junto al otro. */
function PortalPair({ a, b, colorA = '#c89eff', colorB = '#ffd6a5', scale = 1.3, label = null, playerPositionRef, requestTeleport, onPropInteract }) {
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
      {label && <ZoneLabel text={label} position={[a[0], 6.2 * scale, a[2]]} color={colorA} scale={5} />}
      <PortalLite position={a} color={colorA} innerColor={PORTAL_HINT} scale={scale} playerPositionRef={playerPositionRef} onInteract={useA} />
      <PortalLite position={b} color={colorB} innerColor={PORTAL_HINT} scale={scale * 0.85} playerPositionRef={playerPositionRef} onInteract={useB} />
    </>
  );
}

/** Vehículos montables del mundo: spots = [x, z, rotY, color]. */
function WorldVehicles({ spots = [], vehicleStateRef, playerPositionRef, onVehicleToggle, vehicleDurationMs }) {
  return spots.map(([x, z, ry, color], i) => (
    <VehicleLite
      key={`veh-${i}`}
      position={[x, 0, z]}
      rotationY={ry}
      color={color}
      durationMs={vehicleDurationMs}
      vehicleStateRef={vehicleStateRef}
      playerPositionRef={playerPositionRef}
      onVehicleToggle={onVehicleToggle}
    />
  ));
}

/**
 * Par de casas con interior funcional (dollhouse) reutilizable por mundo.
 * Las casas miran al centro; el interior vive en esquinas lejanas (±88,
 * dentro del clamp de movimiento ±110).
 */
function EnterableHouses({ themeKey, spots, accents = ['#ff9bc8', '#dab2ff'], bodyColors = ['#fff0e0', '#ffd6e5'], roofColors = ['#c98390', '#9d6fd3'], playerPositionRef, requestTeleport, onPropInteract, openedChestsRef }) {
  const interiors = [
    { id: `${themeKey}-house-0`, pos: [-88, 0, -88], accent: accents[0] },
    { id: `${themeKey}-house-1`, pos: [88, 0, -88], accent: accents[1] }
  ];
  return (
    <>
      {spots.slice(0, 2).map((p, i) => {
        const interior = interiors[i];
        return (
          <CityHouseLite
            key={`eh-${i}`}
            position={p}
            rotationY={Math.atan2(-p[0], -p[2])}
            bodyColor={bodyColors[i % bodyColors.length]}
            roofColor={roofColors[i % roofColors.length]}
            interiorId={interior.id}
            playerPositionRef={playerPositionRef}
            onDoorInteract={() => {
              requestTeleport?.(interior.pos[0], interior.pos[2]);
              onPropInteract?.({ type: 'house_enter', id: interior.id, message: '🏠 ¡Entraste a la casita!' });
            }}
          />
        );
      })}
      {interiors.map((it, i) => {
        const housePos = spots[i] ?? [0, 0, 30];
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
    </>
  );
}

/* ============ capas por mundo ============ */

function MysticForestProps(p) {
  const crystals = useMemo(() => seededRing('forest-crystal', 3, 18, 46), []);
  return (
    <>
      {p.detail && <Fireflies count={14} color="#ffe39b" radius={46} />}
      {crystals.map((pos, i) => (
        <CrystalSpire key={i} position={pos} scale={0.7 + i * 0.2} color={i % 2 ? '#d4b6ff' : '#aef0c8'} />
      ))}
      <PortalPair label="Portal del Bosque" a={[26, 0, 30]} b={[-32, 0, -30]} colorA="#aef0c8" colorB="#d4b6ff" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[8, 12, 0.5, '#7ac985']]} {...p} />
      <ChestProp id="mystic-forest-chest" position={[24, 0, -18]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} />
    </>
  );
}

function SakuraCityProps(p) {
  // Radio 22–34: dentro del anillo de casas del bioma (35–65) para no solaparse
  const houses = useMemo(() => seededRing('sakura-houses', 4, 22, 34), []);
  return (
    <>
      <MeetingPlaza floor="#f6e2d8" ring="#ff9bc8" lantern="#ffb45e" label="Plaza Sakura" />
      <KawaiiSign position={[6.5, 0, 12]} rotationY={-0.6} />
      <KawaiiSign position={[3, 0, -10]} rotationY={0.4} color="#dab2ff" />
      <EnterableHouses
        themeKey="sakura-city"
        spots={houses.slice(0, 2)}
        accents={['#ff9bc8', '#dab2ff']}
        bodyColors={['#fff0e0', '#ffd6e5']}
        roofColors={['#c98390', '#9d6fd3']}
        playerPositionRef={p.playerPositionRef}
        requestTeleport={p.requestTeleport}
        onPropInteract={p.onPropInteract}
        openedChestsRef={p.openedChestsRef}
      />
      {houses.slice(2).map((pos, i) => (
        <CityHouseLite
          key={`closed-${i}`}
          position={pos}
          rotationY={Math.atan2(-pos[0], -pos[2])}
          bodyColor={['#fff8ec', '#f0ddff'][i % 2]}
          roofColor="#3a2a2a"
          playerPositionRef={p.playerPositionRef}
          onDoorInteract={() => p.onPropInteract?.(CLOSED_MSG)}
        />
      ))}
      <PortalPair label="Portal Sakura" a={[0, 0, -32]} b={[38, 0, 28]} colorA="#ff9bc8" colorB="#dab2ff" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[10, -6, 1.1, '#ff9bc8'], [-12, 2, -0.6, '#dab2ff']]} {...p} />
      {p.detail && <Fireflies count={10} color="#ffc2dd" radius={40} height={2.2} />}
      <ChestProp id="sakura-city-chest" position={[-22, 0, 24]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} />
    </>
  );
}

function CrystalLakeProps(p) {
  return (
    <>
      <Dock position={[2, 0, -6]} rotationY={0} length={11} />
      <ZoneLabel text="Muelle Cristal" position={[2, 4.6, -8]} color="#9be8ff" scale={5} />
      {p.detail && [[6, 0.08, -18], [-8, 0.08, -22], [12, 0.08, -26]].map((pos, i) => (
        <WaterFlower key={i} position={pos} color={['#ff9bc8', '#ffe39b', '#dab2ff'][i % 3]} />
      ))}
      {p.detail && <Fireflies count={8} color="#bdf0ff" radius={36} height={1.2} />}
      <PortalPair label="Portal Cristal" a={[-26, 0, 20]} b={[30, 0, -32]} colorA="#9be8ff" colorB="#cfe7ff" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[12, 10, 0.8, '#9be8ff'], [-14, 14, -1.0, '#cfe7ff']]} {...p} />
      <ChestProp id="crystal-lake-chest" position={[26, 0, 14]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} />
    </>
  );
}

function MistGroveProps(p) {
  const pumpkins = useMemo(() => seededRing('grove-pumpkins', 4, 12, 40), []);
  return (
    <>
      <GroundMist count={p.detail ? 5 : 3} color="#cfdcd4" radius={52} />
      {pumpkins.map((pos, i) => (
        <SpookyPumpkin key={i} position={pos} scale={0.85 + (i % 3) * 0.25} />
      ))}
      {p.detail && <Fireflies count={12} color="#a0ffc0" radius={44} height={1.3} />}
      <PortalPair label="Portal Embrujado" a={[20, 0, 20]} b={[-30, 0, -22]} colorA="#a0c0a0" colorB="#8a7fd0" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[10, -14, 1.6, '#a0c0a0']]} {...p} />
      <ChestProp id="mist-grove-chest" position={[-20, 0, -24]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} coins={15} />
    </>
  );
}

function PastelPortProps(p) {
  return (
    <>
      <Dock position={[30, 0, 8]} rotationY={-Math.PI / 2} length={11} />
      <ZoneLabel text="Muelle Pastel" position={[32, 4.6, 8]} color="#ffb38b" scale={5} />
      {p.detail && [[38, 0.08, 4], [40, 0.08, 12]].map((pos, i) => (
        <WaterFlower key={i} position={pos} color={['#ff9bc8', '#ffe39b'][i % 2]} />
      ))}
      <MeetingPlaza floor="#fff0e0" ring="#ffb38b" lantern="#ffb45e" label="Plaza del Puerto" />
      <EnterableHouses
        themeKey="pastel-port"
        spots={[[-20, 0, 10], [14, 0, -20]]}
        accents={['#ffb38b', '#a8e0ff']}
        bodyColors={['#ffd6ea', '#d8dbff']}
        roofColors={['#c98390', '#a8d8c0']}
        playerPositionRef={p.playerPositionRef}
        requestTeleport={p.requestTeleport}
        onPropInteract={p.onPropInteract}
        openedChestsRef={p.openedChestsRef}
      />
      <PortalPair label="Portal del Puerto" a={[0, 0, -26]} b={[-34, 0, 26]} colorA="#ffb38b" colorB="#a8e0ff" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[8, 20, 0.4, '#ffb38b'], [-14, -6, 2.2, '#a8e0ff']]} {...p} />
      {p.detail && <Fireflies count={8} color="#ffe3c8" radius={36} height={1.6} />}
      <ChestProp id="pastel-port-chest" position={[26, 0, 14]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} />
    </>
  );
}

function CloudValleyProps(p) {
  return (
    <>
      {p.detail && <Fireflies count={10} color="#fff6da" radius={40} height={2.6} />}
      <PortalPair label="Portal Nube" a={[24, 0, -20]} b={[-28, 0, 24]} colorA="#a8c8ff" colorB="#f4d4ff" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[12, 8, 0.7, '#a8c8ff']]} {...p} />
      <ChestProp id="cloud-valley-chest" position={[-24, 0, 12]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} />
    </>
  );
}

function MoonGardenProps(p) {
  return (
    <>
      <GroundMist count={3} color="#7a82c8" radius={46} />
      {p.detail && <Fireflies count={12} color="#c8b6ff" radius={42} height={1.8} />}
      <PortalPair label="Portal Lunar" a={[18, 0, -24]} b={[-26, 0, 26]} colorA="#a8c8ff" colorB="#ffd6f5" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[-12, 10, -0.8, '#b2a5ff']]} {...p} />
      <ChestProp id="moon-garden-chest" position={[18, 0, 26]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} coins={15} />
    </>
  );
}

function CottonBeachProps(p) {
  return (
    <>
      <Dock position={[-4, 0, 22]} rotationY={Math.PI} length={11} />
      <ZoneLabel text="Muelle Algodón" position={[-4, 4.6, 24]} color="#ffd29b" scale={5} />
      {p.detail && [[8, 0.08, 32], [-12, 0.08, 36], [2, 0.08, 42]].map((pos, i) => (
        <WaterFlower key={i} position={pos} color={['#ff9bc8', '#ffe39b', '#dab2ff'][i % 3]} />
      ))}
      {p.detail && <Fireflies count={8} color="#ffe9c0" radius={36} height={1.4} />}
      <PortalPair label="Portal Playa" a={[-22, 0, -18]} b={[28, 0, -28]} colorA="#ffd29b" colorB="#8de8ff" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[10, 2, 0.9, '#ffd29b']]} {...p} />
      <ChestProp id="cotton-beach-chest" position={[26, 0, 14]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} />
    </>
  );
}

function MountainProps(p) {
  const crystals = useMemo(() => seededRing('mountain-crystal', 4, 16, 50), []);
  const steps = [[-14, 0.35, 10], [-17, 0.75, 6], [-20, 1.15, 2], [-23, 1.55, -2]];
  return (
    <>
      {crystals.map((pos, i) => (
        <CrystalSpire key={i} position={pos} scale={1.0 + (i % 3) * 0.4} color={i % 2 ? '#7affd1' : '#cfe7ff'} />
      ))}
      {/* Camino elevado visual (sin física: solo sensación de verticalidad) */}
      {steps.map(([x, y, z], i) => (
        <mesh key={`step-${i}`} position={[x, y, z]} rotation={[0, i * 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 0.7, 3.4]} />
          <meshStandardMaterial color={i % 2 ? '#6d7f8e' : '#7e93a3'} roughness={0.85} />
        </mesh>
      ))}
      {p.detail && <Fireflies count={8} color="#9fffe0" radius={40} height={2.4} />}
      <PortalPair label="Portal Aurora" a={[-30, 0, 26]} b={[30, 0, 20]} colorA="#7affd1" colorB="#cfe7ff" scale={1.2} playerPositionRef={p.playerPositionRef} requestTeleport={p.requestTeleport} onPropInteract={p.onPropInteract} />
      <WorldVehicles spots={[[14, 16, 0.6, '#7affd1'], [-10, 18, -1.1, '#cfe7ff']]} {...p} />
      <ChestProp id="aurora-mountain-chest" position={[28, 0, -8]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} coins={15} />
    </>
  );
}

function StellarVillageProps(p) {
  return (
    <>
      <MeetingPlaza floor="#5d527a" ring="#ffd6a5" lantern="#ffd066" benches={false} label="Plaza Estelar" />
      <EnterableHouses
        themeKey="stellar-village"
        spots={[[-18, 0, 8], [16, 0, -14]]}
        accents={['#ffd6a5', '#c89eff']}
        bodyColors={['#d4a8ff', '#ffd6a5']}
        roofColors={['#3a2e5a', '#3a2e5a']}
        playerPositionRef={p.playerPositionRef}
        requestTeleport={p.requestTeleport}
        onPropInteract={p.onPropInteract}
        openedChestsRef={p.openedChestsRef}
      />
      <PortalPair
        label="Portal Estelar"
        a={[0, 0, -28]}
        b={[-42, 0, 34]}
        colorA="#c89eff"
        colorB="#ffd6a5"
        scale={1.4}
        playerPositionRef={p.playerPositionRef}
        requestTeleport={p.requestTeleport}
        onPropInteract={p.onPropInteract}
      />
      <WorldVehicles spots={[[14, 10, 0.7, '#a8c8ff'], [-16, 14, -1.2, '#ffd6a5']]} {...p} />
      {p.detail && <Fireflies count={12} color="#ffe9b5" radius={44} height={2.2} />}
      <ChestProp id="stellar-village-chest" position={[22, 0, -16]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} coins={18} />
    </>
  );
}

function NeonCityProps(p) {
  return (
    <>
      <MeetingPlaza floor="#2a2148" ring="#ff66cc" lantern="#ffd066" benches={false} label="Plaza Neón" />
      <EnterableHouses
        themeKey="neon-city"
        spots={[[-18, 0, 26], [18, 0, 30]]}
        accents={['#ff66cc', '#00d4ff']}
        bodyColors={['#3d2858', '#1f1a35']}
        roofColors={['#ff66cc', '#00d4ff']}
        playerPositionRef={p.playerPositionRef}
        requestTeleport={p.requestTeleport}
        onPropInteract={p.onPropInteract}
        openedChestsRef={p.openedChestsRef}
      />
      <PortalPair
        label="Portal Neón"
        a={[0, 0, -26]}
        b={[36, 0, 42]}
        colorA="#ff66cc"
        colorB="#00d4ff"
        scale={1.5}
        playerPositionRef={p.playerPositionRef}
        requestTeleport={p.requestTeleport}
        onPropInteract={p.onPropInteract}
      />
      <WorldVehicles spots={[[10, 14, 1.1, '#00d4ff'], [-12, 18, -0.4, '#ff66cc'], [-20, -10, 2.1, '#ffd066']]} {...p} />
      {p.detail && <Fireflies count={14} color="#66ffff" radius={42} height={2.8} />}
      <ChestProp id="neon-city-chest" position={[24, 0, 18]} playerPositionRef={p.playerPositionRef} onPropInteract={p.onPropInteract} openedChestsRef={p.openedChestsRef} coins={20} />
    </>
  );
}

const THEME_PROPS = {
  'mystic-forest': MysticForestProps,
  'sakura-city': SakuraCityProps,
  'crystal-lake': CrystalLakeProps,
  'mist-grove': MistGroveProps,
  'pastel-port': PastelPortProps,
  'cloud-valley': CloudValleyProps,
  'moon-garden': MoonGardenProps,
  'cotton-beach': CottonBeachProps,
  'aurora-mountain': MountainProps,
  'stellar-village': StellarVillageProps,
  'neon-city': NeonCityProps
};

/**
 * Capa premium de props por mundo: decoración + interacciones reales.
 * TODOS los mundos tienen: cofre con tapa, al menos 1 vehículo montable y un
 * par de portales conectados. Los mundos tipo ciudad/villa (Sakura, Puerto,
 * Villa Estelar, Ciudad Neón) tienen además 2 casas con interior funcional y
 * plaza de encuentro.
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
  const airdropAt = useMemo(() => {
    const [x, , z] = seededRing(`${worldTheme}-airdrop`, 1, 16, 38)[0] ?? [18, 0, 18];
    return [x, z];
  }, [worldTheme]);
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
    <>
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
      {/* Entrega aérea (loot raro) en todos los mundos, estilo battle-royale kawaii */}
      <SupplyDrop
        id={`${worldTheme}-airdrop`}
        landAt={airdropAt}
        delayMs={18000}
        coins={25}
        playerPositionRef={playerPositionRef}
        onPropInteract={onPropInteract}
        openedChestsRef={openedChestsRef}
      />
    </>
  );
}
