import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

function stablePositions(key, count, radius = 48) {
  const seed = Array.from(String(key)).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 5), 0);
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / Math.max(1, count)) * Math.PI * 2 + (seed % 19) * 0.09;
    const r = radius * 0.45 + ((seed + index * 23) % Math.max(1, Math.floor(radius * 0.48)));
    return [Math.cos(angle) * r, 0.035, Math.sin(angle) * r];
  });
}

/**
 * Único escritor de movementMultiplierRef: combina zonas lentas y modo
 * vehículo (boost). También expira el vehículo y avisa una sola vez.
 */
function MovementRuntime({ slowActive, zones, playerPositionRef, movementMultiplierRef, vehicleStateRef, onVehicleEnd }) {
  useFrame(() => {
    if (!movementMultiplierRef) return;
    let multiplier = 1;
    const player = playerPositionRef.current;
    if (slowActive && player) {
      const isInside = zones.some(([x, , z]) => Math.hypot(player.x - x, player.z - z) < 9);
      if (isInside) multiplier *= 0.52;
    }
    const vehicle = vehicleStateRef?.current;
    if (vehicle?.active) {
      if (Date.now() > (vehicle.until ?? 0)) {
        vehicle.active = false;
        onVehicleEnd?.();
      } else {
        multiplier *= 1.6;
      }
    }
    movementMultiplierRef.current = multiplier;
  });
  return null;
}

function SlowZones({ zones }) {
  return zones.map((pos, index) => (
    <group key={`slow-zone-${index}`} position={pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 32]} />
        <meshBasicMaterial color="#8edcff" transparent opacity={0.22} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[8.2, 9.1, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.42} toneMapped={false} />
      </mesh>
    </group>
  ));
}

function CityProps() {
  const houses = useMemo(() => stablePositions('city-lite-props', 5, 66), []);
  return (
    <group>
      {houses.map(([x, , z], index) => (
        <group key={`city-house-${index}`} position={[x, 0, z]} rotation={[0, index * 0.7, 0]}>
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.2, 2.2, 3.8]} />
            <meshStandardMaterial color={index % 2 ? '#ffd3e8' : '#f0ddff'} roughness={0.72} />
          </mesh>
          <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[3.1, 1.45, 4]} />
            <meshStandardMaterial color="#9d6fd3" roughness={0.64} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MountainPlatforms() {
  const platforms = [[-22, 0.52, -18], [4, 0.9, -34], [26, 0.7, -12], [-28, 0.8, 22]];
  return (
    <group>
      {platforms.map(([x, y, z], index) => (
        <mesh key={`platform-${index}`} position={[x, y, z]} rotation={[0, index * 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[9, 0.45, 5]} />
          <meshStandardMaterial color={index % 2 ? '#b9c9d8' : '#d8e9f5'} roughness={0.78} />
        </mesh>
      ))}
    </group>
  );
}

function EscapePortal({ portal, playerPositionRef, onEscapeComplete }) {
  const ref = useRef();
  const doneRef = useRef(false);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 1.1;
      ref.current.position.y = portal.position[1] + Math.sin(clock.getElapsedTime() * 2.2) * 0.12;
    }
    const player = playerPositionRef.current;
    if (!player || doneRef.current) return;
    const distance = Math.hypot(player.x - portal.position[0], player.z - portal.position[2]);
    if (distance <= (portal.radius ?? 4.4)) {
      doneRef.current = true;
      onEscapeComplete?.('portal');
    }
  });

  return (
    <group ref={ref} position={portal.position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.16, 12, 48]} />
        <meshBasicMaterial color="#b57cff" toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.42, 0.08, 12, 36]} />
        <meshBasicMaterial color="#ffd066" toneMapped={false} />
      </mesh>
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[portal.radius ?? 4.4, 36]} />
        <meshBasicMaterial color="#7c4dff" transparent opacity={0.2} toneMapped={false} />
      </mesh>
      <pointLight color="#b57cff" intensity={1.2} distance={18} />
    </group>
  );
}

/** Anillos de la misión "vehicle_dash": cuentan solo con vehículo activo. */
function DashCheckpoints({ checkpoints = [], hitIds = [], playerPositionRef, vehicleStateRef, onCheckpointHit, onNeedVehicle }) {
  const firedRef = useRef(new Set());
  const needMsgAtRef = useRef(0);
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((g, i) => {
        g.rotation.y = t * 0.6 + i * 2.1;
        g.position.y = checkpoints[i]?.position?.[1] ?? 1.4;
      });
    }
    // Resync tras restart: el runtime limpia hitIds, limpiamos el dedupe local
    if (hitIds.length === 0 && firedRef.current.size > 0) firedRef.current.clear();
    const player = playerPositionRef.current;
    if (!player) return;
    for (const cp of checkpoints) {
      if (hitIds.includes(cp.id) || firedRef.current.has(cp.id)) continue;
      const distance = Math.hypot(player.x - cp.position[0], player.z - cp.position[2]);
      if (distance < 3.4) {
        if (vehicleStateRef?.current?.active) {
          firedRef.current.add(cp.id);
          onCheckpointHit?.(cp.id);
        } else if (Date.now() > needMsgAtRef.current) {
          needMsgAtRef.current = Date.now() + 3500;
          onNeedVehicle?.();
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      {checkpoints.map((cp) => {
        const hit = hitIds.includes(cp.id);
        return (
          <group key={cp.id} position={cp.position}>
            <mesh>
              <torusGeometry args={[2.6, 0.18, 10, 36]} />
              <meshBasicMaterial color={hit ? '#7aff9e' : '#ffd066'} transparent opacity={hit ? 0.3 : 0.9} toneMapped={false} />
            </mesh>
            <mesh position={[0, -(cp.position[1] ?? 1.4) + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.2, 2.7, 28]} />
              <meshBasicMaterial color={hit ? '#7aff9e' : '#ffd066'} transparent opacity={0.3} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Zona de regreso de "city_quest": aparece en la plaza al juntar los tesoros. */
function QuestReturnZone({ active, position = [0, 0, 16], playerPositionRef, onReached }) {
  const doneRef = useRef(false);
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.visible = !!active;
      if (active) {
        const s = 1 + Math.sin(clock.getElapsedTime() * 2.4) * 0.08;
        ringRef.current.scale.set(s, 1, s);
      }
    }
    if (!active) {
      doneRef.current = false;
      return;
    }
    const player = playerPositionRef.current;
    if (!player || doneRef.current) return;
    if (Math.hypot(player.x - position[0], player.z - position[2]) < 5.2) {
      doneRef.current = true;
      onReached?.();
    }
  });
  return (
    <group position={position}>
      <group ref={ringRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[4.2, 5, 40]} />
          <meshBasicMaterial color="#7aff9e" transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshBasicMaterial color="#7aff9e" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function ChaseMichi({ index, playerPositionRef, onEnemyHit, invulnUntilRef }) {
  const ref = useRef();
  const lastHitRef = useRef(0);
  const spawn = useMemo(() => {
    const angle = (index / 3) * Math.PI * 2 + 0.8;
    const radius = 26 + index * 8;
    return [Math.cos(angle) * radius, 0.42, Math.sin(angle) * radius];
  }, [index]);

  useFrame((_, delta) => {
    const player = playerPositionRef.current;
    if (!player || !ref.current) return;
    const p = ref.current.position;
    const dx = player.x - p.x;
    const dz = player.z - p.z;
    const distance = Math.hypot(dx, dz);
    if (distance > 0.1) {
      const speed = 1.7 + index * 0.15;
      p.x += (dx / distance) * speed * Math.min(delta, 0.05);
      p.z += (dz / distance) * speed * Math.min(delta, 0.05);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    const now = Date.now();
    if (distance < 1.45 && now > lastHitRef.current && now > (invulnUntilRef?.current ?? 0)) {
      lastHitRef.current = now + 1000;
      onEnemyHit?.();
    }
  });

  return (
    <group ref={ref} position={spawn} scale={1.1}>
      <mesh castShadow><sphereGeometry args={[0.42, 16, 12]} /><meshStandardMaterial color={index % 2 ? '#ff91b2' : '#ff6688'} roughness={0.5} emissive="#6a1025" emissiveIntensity={0.12} /></mesh>
      <mesh position={[0, 0.5, 0.22]} castShadow><sphereGeometry args={[0.28, 14, 10]} /><meshStandardMaterial color={index % 2 ? '#ff91b2' : '#ff6688'} roughness={0.5} emissive="#6a1025" emissiveIntensity={0.12} /></mesh>
      <mesh position={[-0.14, 0.78, 0.2]}><coneGeometry args={[0.1, 0.24, 5]} /><meshStandardMaterial color="#ff6688" /></mesh>
      <mesh position={[0.14, 0.78, 0.2]}><coneGeometry args={[0.1, 0.24, 5]} /><meshStandardMaterial color="#ff6688" /></mesh>
      <mesh position={[-0.09, 0.55, 0.45]}><sphereGeometry args={[0.045, 8, 6]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
      <mesh position={[0.09, 0.55, 0.45]}><sphereGeometry args={[0.045, 8, 6]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
    </group>
  );
}

export default function MissionChallengeLayer({
  missionType,
  modifiers = {},
  worldTheme,
  playerPositionRef,
  movementMultiplierRef,
  exitPortal,
  onEscapeComplete,
  onEnemyHit,
  invulnUntilRef,
  vehicleStateRef,
  onVehicleEnd,
  checkpoints = [],
  checkpointsHit = [],
  onCheckpointHit,
  onNeedVehicle,
  questPhase = 'collect',
  onQuestZoneReached
}) {
  const slowZones = useMemo(() => stablePositions(`${worldTheme}-slow-zones`, 4, 72), [worldTheme]);
  const showSlowZones = missionType === 'slow_zone' || modifiers.slowZones;
  const showCityProps = missionType === 'city_hide' || modifiers.cityProps;
  const showMountainPlatforms = missionType === 'mountain_jump' || modifiers.platforms;
  const isEscape = missionType === 'escape' || modifiers.escapeMode;
  const isDash = missionType === 'vehicle_dash';
  const isCityQuest = missionType === 'city_quest';

  return (
    <group>
      <MovementRuntime
        slowActive={showSlowZones}
        zones={slowZones}
        playerPositionRef={playerPositionRef}
        movementMultiplierRef={movementMultiplierRef}
        vehicleStateRef={vehicleStateRef}
        onVehicleEnd={onVehicleEnd}
      />
      {showSlowZones && <SlowZones zones={slowZones} />}
      {showCityProps && <CityProps />}
      {showMountainPlatforms && <MountainPlatforms />}
      {isEscape && exitPortal && <EscapePortal portal={exitPortal} playerPositionRef={playerPositionRef} onEscapeComplete={onEscapeComplete} />}
      {isDash && checkpoints.length > 0 && (
        <DashCheckpoints
          checkpoints={checkpoints}
          hitIds={checkpointsHit}
          playerPositionRef={playerPositionRef}
          vehicleStateRef={vehicleStateRef}
          onCheckpointHit={onCheckpointHit}
          onNeedVehicle={onNeedVehicle}
        />
      )}
      {isCityQuest && (
        <QuestReturnZone
          active={questPhase === 'return'}
          position={[0, 0, 16]}
          playerPositionRef={playerPositionRef}
          onReached={onQuestZoneReached}
        />
      )}
      {/* ChaseMichi REMOVIDO — los ZombieCats spawneados por generateLevelCats manejan esto */}
    </group>
  );
}
