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

function SlowZoneRuntime({ active, zones, playerPositionRef, movementMultiplierRef }) {
  useFrame(() => {
    if (!movementMultiplierRef) return;
    if (!active) {
      movementMultiplierRef.current = 1;
      return;
    }
    const player = playerPositionRef.current;
    if (!player) {
      movementMultiplierRef.current = 1;
      return;
    }
    const isInside = zones.some(([x, , z]) => Math.hypot(player.x - x, player.z - z) < 9);
    movementMultiplierRef.current = isInside ? 0.52 : 1;
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

export default function MissionChallengeLayer({ missionType, modifiers = {}, worldTheme, playerPositionRef, movementMultiplierRef, exitPortal, onEscapeComplete, onEnemyHit, invulnUntilRef }) {
  const slowZones = useMemo(() => stablePositions(`${worldTheme}-slow-zones`, 4, 72), [worldTheme]);
  const showSlowZones = missionType === 'slow_zone' || modifiers.slowZones;
  const showCityProps = missionType === 'city_hide' || modifiers.cityProps;
  const showMountainPlatforms = missionType === 'mountain_jump' || modifiers.platforms;
  const isEscape = missionType === 'escape' || modifiers.escapeMode;

  return (
    <group>
      <SlowZoneRuntime active={showSlowZones} zones={slowZones} playerPositionRef={playerPositionRef} movementMultiplierRef={movementMultiplierRef} />
      {showSlowZones && <SlowZones zones={slowZones} />}
      {showCityProps && <CityProps />}
      {showMountainPlatforms && <MountainPlatforms />}
      {isEscape && exitPortal && <EscapePortal portal={exitPortal} playerPositionRef={playerPositionRef} onEscapeComplete={onEscapeComplete} />}
      {/* ChaseMichi REMOVIDO — los ZombieCats spawneados por generateLevelCats manejan esto */}
    </group>
  );
}
