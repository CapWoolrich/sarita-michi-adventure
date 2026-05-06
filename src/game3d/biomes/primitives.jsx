import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

/* ===== TREES (variantes por bioma) ===== */

export function PineTree({ position = [0, 0, 0], scale = 1, color = '#5fa667' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 1.8, 6]} />
        <meshStandardMaterial color="#6b3f24" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[1.2, 1.8, 8]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.9, 0]} castShadow>
        <coneGeometry args={[0.85, 1.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.7, 0]} castShadow>
        <coneGeometry args={[0.5, 1.0, 8]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </group>
  );
}

export function SakuraTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 2.0, 7]} />
        <meshStandardMaterial color="#5b3f2b" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <sphereGeometry args={[1.4, 12, 10]} />
        <meshStandardMaterial color="#ffb6d9" roughness={0.7} emissive="#ff8fc4" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0.7, 2.7, 0.4]} castShadow>
        <sphereGeometry args={[0.9, 10, 8]} />
        <meshStandardMaterial color="#ffc8e3" roughness={0.7} emissive="#ff8fc4" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[-0.6, 2.5, -0.5]} castShadow>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshStandardMaterial color="#ffd0e7" roughness={0.7} emissive="#ff8fc4" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

export function PalmTree({ position = [0, 0, 0], scale = 1 }) {
  const fronds = 7;
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.22, 2.8, 8]} />
        <meshStandardMaterial color="#a06c3e" roughness={0.95} />
      </mesh>
      {Array.from({ length: fronds }).map((_, i) => {
        const angle = (i / fronds) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.6, 2.85, Math.sin(angle) * 0.6]}
            rotation={[Math.PI * 0.18, angle, Math.cos(angle) * 0.3]}
            castShadow
          >
            <coneGeometry args={[0.18, 1.5, 4]} />
            <meshStandardMaterial color="#7fc46b" roughness={0.8} />
          </mesh>
        );
      })}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#c47a3e" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function CrystalSpire({ position = [0, 0, 0], scale = 1, color = '#9be8ff' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.5, 2.4, 5]} />
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.3} transparent opacity={0.85} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.3, 0.5, 0.2]} rotation={[0.2, 0.4, 0.15]} castShadow>
        <coneGeometry args={[0.22, 1.0, 5]} />
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.3} transparent opacity={0.85} emissive={color} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

export function BareTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.28, 2.4, 6]} />
        <meshStandardMaterial color="#4a3a2c" roughness={0.95} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.45, 2.2 + i * 0.15, Math.sin(angle) * 0.45]}
            rotation={[0, angle, Math.PI * 0.35]}
            castShadow
          >
            <cylinderGeometry args={[0.04, 0.08, 1.0, 5]} />
            <meshStandardMaterial color="#4a3a2c" roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

export function CottonTree({ position = [0, 0, 0], scale = 1, color = '#ffe5e5' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 1.4, 8]} />
        <meshStandardMaterial color="#a06c3e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.95, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.5, 2.0, 0.3]} castShadow>
        <sphereGeometry args={[0.65, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[-0.4, 1.95, -0.4]} castShadow>
        <sphereGeometry args={[0.6, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} emissive={color} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

/* ===== INSTANCED SCATTERS (densidad sin matar FPS) ===== */

export function GrassPatches({ count = 80, area = 30, color = '#7fbf6b' }) {
  const positions = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const a = (i * 137.5) * (Math.PI / 180);
      const r = Math.sqrt((i + 1) / count) * area;
      return [Math.cos(a) * r, 0, Math.sin(a) * r];
    }),
    [count, area]
  );
  return (
    <Instances limit={count} castShadow>
      <coneGeometry args={[0.08, 0.32, 4]} />
      <meshStandardMaterial color={color} roughness={0.85} />
      {positions.map((p, i) => (
        <Instance key={i} position={[p[0], 0.16, p[2]]} rotation={[0, i * 0.7, 0]} scale={0.8 + (i % 5) * 0.15} />
      ))}
    </Instances>
  );
}

export function FlowerScatter({ count = 50, area = 25, palette = ['#ffb6d0', '#ffe39b', '#dab2ff', '#ff9bc8'] }) {
  const items = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const a = i * 0.97;
      const r = 4 + ((i * 1.3) % area);
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        color: palette[i % palette.length],
        scale: 0.7 + (i % 4) * 0.2
      };
    }),
    [count, area, palette]
  );
  return (
    <group>
      {items.map((it, i) => (
        <group key={i} position={[it.x, 0, it.z]} scale={it.scale}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.36, 5]} />
            <meshStandardMaterial color="#84a85a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.11, 8, 6]} />
            <meshStandardMaterial color={it.color} roughness={0.7} emissive={it.color} emissiveIntensity={0.18} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function MushroomCluster({ positions = [], color = '#e98890' }) {
  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.36, 8]} />
            <meshStandardMaterial color="#fbf4e1" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={color} roughness={0.7} emissive={color} emissiveIntensity={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function RockCluster({ positions = [], color = '#8a8e95' }) {
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p} rotation={[i * 0.3, i * 0.7, 0]} castShadow>
          <dodecahedronGeometry args={[0.35 + (i % 3) * 0.12, 0]} />
          <meshStandardMaterial color={color} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function FloatingCloud({ position = [0, 4, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.8, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} emissive="#ffeaff" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.7, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.6, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} emissive="#ffeaff" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[-0.6, 0.05, 0.2]} castShadow>
        <sphereGeometry args={[0.55, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} emissive="#ffeaff" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

/* ===== FEATURE LANDMARKS (uno por mundo) ===== */

export function ToriiGate({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Pillars */}
      <mesh position={[-1.4, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 2.8, 8]} />
        <meshStandardMaterial color="#c63a4a" roughness={0.7} />
      </mesh>
      <mesh position={[1.4, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 2.8, 8]} />
        <meshStandardMaterial color="#c63a4a" roughness={0.7} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, 2.95, 0]} castShadow>
        <boxGeometry args={[3.4, 0.25, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.25, 0]} castShadow>
        <boxGeometry args={[3.8, 0.18, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[2.4, 0.15, 0.25]} />
        <meshStandardMaterial color="#c63a4a" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function Lighthouse({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.4, 1.0, 16]} />
        <meshStandardMaterial color="#e8e2d3" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.85, 1.0, 2.4, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow>
        <cylinderGeometry args={[0.86, 0.86, 0.5, 16]} />
        <meshStandardMaterial color="#e35a55" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.65, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.7, 12]} />
        <meshStandardMaterial color="#fff8b8" emissive="#ffd66b" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 4.2, 0]} castShadow>
        <coneGeometry args={[0.85, 0.7, 12]} />
        <meshStandardMaterial color="#c0393a" roughness={0.7} />
      </mesh>
      <pointLight position={[0, 3.65, 0]} intensity={1.5} distance={20} color="#ffd066" />
    </group>
  );
}

export function MoonOrb({ position = [0, 12, -28], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[3.5, 32, 24]} />
        <meshBasicMaterial color="#fff5d4" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.2, 32, 24]} />
        <meshBasicMaterial color="#fff5d4" transparent opacity={0.18} toneMapped={false} />
      </mesh>
      <pointLight intensity={1.2} distance={50} color="#aab9ff" />
    </group>
  );
}

export function Mountain({ position = [0, 0, -20], scale = 1, color = '#5c6f82' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 4, 0]} castShadow>
        <coneGeometry args={[6, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 7.5, 0]} castShadow>
        <coneGeometry args={[2.2, 2.2, 6]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[-7, 3.0, 1]} castShadow>
        <coneGeometry args={[4.2, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[7, 2.5, 0.5]} castShadow>
        <coneGeometry args={[3.5, 5, 6]} />
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

export function AuroraBand({ position = [0, 8, -20] }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.35 + Math.sin(clock.elapsedTime * 0.4) * 0.1;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[0, 0, Math.PI * 0.05]}>
      <planeGeometry args={[40, 8, 1, 1]} />
      <meshBasicMaterial color="#7affd1" transparent opacity={0.4} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

export function StarField({ count = 80 }) {
  const stars = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      const r = 60 + (i % 7);
      const h = 5 + (i % 12);
      return [Math.cos(a) * r, h, Math.sin(a) * r];
    }),
    [count]
  );
  return (
    <group>
      {stars.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshBasicMaterial color={i % 4 === 0 ? '#ffe9b5' : '#ffffff'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Lantern({ position = [0, 0, 0], color = '#ffd066' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.0, 6]} />
        <meshStandardMaterial color="#3a2e22" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.1, 0]} intensity={0.4} distance={4} color={color} />
    </group>
  );
}

export function LilyPad({ position = [0, 0.05, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.55, 12]} />
        <meshStandardMaterial color="#5fa86b" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.05, 0.05]} castShadow>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#fff0f6" emissive="#ffd0e7" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function CloudPlatform({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.3, 14, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} emissive="#ffeaff" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[1.0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.85, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} emissive="#ffeaff" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-0.9, 0.1, 0.3]} castShadow>
        <sphereGeometry args={[0.8, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} emissive="#ffeaff" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

export function BeachUmbrella({ position = [0, 0, 0], color = '#ff9bc8' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[1.0, 0.5, 12, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
