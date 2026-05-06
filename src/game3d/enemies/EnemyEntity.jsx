import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function useToon() {
  return useMemo(() => {
    const data = new Uint8Array([60, 130, 200, 255]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function WolfBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.7, 6, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.55, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.78, 0.5, 0]} castShadow rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.3, 8]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.45, 0.85, 0.14]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.09, 0.2, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.45, 0.85, -0.14]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.09, 0.2, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.7, 0.6, 0.1]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
      </mesh>
      <mesh position={[0.7, 0.6, -0.1]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
      </mesh>
      <mesh position={[-0.55, 0.45, 0]} rotation={[0, 0, -0.4]} castShadow>
        <capsuleGeometry args={[0.06, 0.4, 4, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {[[0.25, 0.2], [0.25, -0.2], [-0.25, 0.2], [-0.25, -0.2]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.05, p[1]]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.3, 8]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
    </group>
  );
}

function OwlBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.42, 14, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 0.5, 0.32]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#fff8e1" />
      </mesh>
      <mesh position={[-0.12, 0.55, 0.34]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshBasicMaterial color="#ffd066" toneMapped={false} />
      </mesh>
      <mesh position={[0.12, 0.55, 0.34]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshBasicMaterial color="#ffd066" toneMapped={false} />
      </mesh>
      <mesh position={[-0.12, 0.55, 0.42]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.12, 0.55, 0.42]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0, 0.42, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshBasicMaterial color="#ffaa44" />
      </mesh>
      <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

function CrabBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.12, 0.34, 0.22]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.12, 0.34, 0.22]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.12, 0.42, 0.22]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.12, 0.42, 0.22]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[-0.45, 0.18, 0.25]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.15]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.45, 0.18, 0.25]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.15]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

function DroneBody({ color }) {
  return (
    <group>
      <mesh castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} emissive="#ff3a8a" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.3, 0]} intensity={0.8} distance={3} color="#ff3b3b" />
    </group>
  );
}

const BODIES = { wolf: WolfBody, owl: OwlBody, crab: CrabBody, drone: DroneBody };

function pickPatrolTarget(center, radius) {
  const a = Math.random() * Math.PI * 2;
  const r = radius * 0.5 + Math.random() * radius * 0.5;
  return [center[0] + Math.cos(a) * r, 0, center[2] + Math.sin(a) * r];
}

export default function EnemyEntity({
  type = 'wolf',
  spawn = [0, 0, 0],
  patrolRadius = 6,
  detectionRadius = 7,
  speed = 1.4,
  color = '#5a4030',
  playerPositionRef,
  onHit,
  invulnUntilRef
}) {
  const groupRef = useRef();
  const gradientMap = useToon();
  const stateRef = useRef({ x: spawn[0], z: spawn[2], target: pickPatrolTarget(spawn, patrolRadius) });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const player = playerPositionRef?.current;
    const s = stateRef.current;

    let mode = 'patrol';
    if (player) {
      const distToPlayer = Math.hypot(player.x - s.x, player.z - s.z);
      if (distToPlayer < detectionRadius) mode = 'chase';
    }

    const target = mode === 'chase' && player ? [player.x, 0, player.z] : s.target;
    const dx = target[0] - s.x;
    const dz = target[2] - s.z;
    const dist = Math.hypot(dx, dz);
    const stepSpeed = mode === 'chase' ? speed * 1.4 : speed * 0.6;

    if (dist < 0.3 && mode === 'patrol') {
      s.target = pickPatrolTarget(spawn, patrolRadius);
    } else if (dist > 0.05) {
      const nx = dx / dist;
      const nz = dz / dist;
      s.x += nx * stepSpeed * dt;
      s.z += nz * stepSpeed * dt;
      const targetRot = Math.atan2(nx, nz) - Math.PI / 2;
      let diff = targetRot - groupRef.current.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.18;
    }

    const flying = type === 'owl' || type === 'drone';
    const yBase = flying ? 1.8 + Math.sin(Date.now() * 0.003) * 0.15 : 0;
    groupRef.current.position.set(s.x, yBase, s.z);

    if (player) {
      const distToPlayer = Math.hypot(player.x - s.x, player.z - s.z);
      const now = Date.now();
      const invulnUntil = invulnUntilRef?.current ?? 0;
      if (distToPlayer < 1.6 && now > invulnUntil) {
        onHit?.(now);
      }
    }
  });

  const Body = BODIES[type] ?? WolfBody;
  return (
    <group ref={groupRef} position={spawn}>
      <Body color={color} gradientMap={gradientMap} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius - 0.15, detectionRadius, 48]} />
        <meshBasicMaterial color="#ff3b3b" transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </group>
  );
}
