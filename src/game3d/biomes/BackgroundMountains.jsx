import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Montañas de fondo — anillo decorativo a radio 60..90 que rompe el horizonte
 * sin afectar la zona jugable. Cada bioma define su propia silueta y color.
 */

const MOUNTAIN_PROFILES = {
  'mystic-forest': {
    count: 16,
    radius: [110, 160],
    height: [6, 10],
    width: 11,
    color: '#5a8a52',
    peakColor: '#a3d39a',
    style: 'rounded' // colinas suaves
  },
  'sakura-city': {
    count: 14,
    radius: [110, 156],
    height: [5, 9],
    width: 10,
    color: '#b88aa0',
    peakColor: '#ffd5e8',
    style: 'pagoda' // niveles tipo terraza
  },
  'crystal-lake': {
    count: 18,
    radius: [110, 160],
    height: [7, 13],
    width: 7,
    color: '#7a9bb8',
    peakColor: '#cfe7ff',
    style: 'sharp' // picos angulosos
  },
  'mist-grove': {
    count: 12,
    radius: [110, 160],
    height: [8, 14],
    width: 9,
    color: '#5d6f60',
    peakColor: '#aabaad',
    style: 'rounded',
    foggy: true
  },
  'pastel-port': {
    count: 12,
    radius: [120, 170],
    height: [4, 7],
    width: 12,
    color: '#a89580',
    peakColor: '#fff5e0',
    style: 'cliff' // acantilados
  },
  'cloud-valley': {
    count: 14,
    radius: [110, 170],
    height: [5, 9],
    width: 9,
    color: '#a8b5d0',
    peakColor: '#ffffff',
    style: 'floating' // chunks flotando
  },
  'moon-garden': {
    count: 14,
    radius: [110, 160],
    height: [7, 12],
    width: 9,
    color: '#2a2545',
    peakColor: '#5a5d8d',
    style: 'sharp'
  },
  'cotton-beach': {
    count: 10,
    radius: [120, 170],
    height: [3, 5],
    width: 14,
    color: '#d8c0a0',
    peakColor: '#fff0d4',
    style: 'rounded' // dunas
  },
  'aurora-mountain': {
    count: 16,
    radius: [100, 156],
    height: [10, 18],
    width: 11,
    color: '#3a4d62',
    peakColor: '#ffffff', // nieve
    style: 'sharp',
    snow: true
  },
  'stellar-village': {
    count: 16,
    radius: [110, 170],
    height: [4, 9],
    width: 7,
    color: '#3a2e5a',
    peakColor: '#a87fee',
    style: 'floating'
  },
  'neon-city': {
    count: 14,
    radius: [120, 170],
    height: [10, 18],
    width: 6,
    color: '#1a1a3a',
    peakColor: '#ff66cc',
    style: 'cyber' // megaestructuras lineares
  }
};

function MountainShape({ position, height, width, color, peakColor, style, snow }) {
  if (style === 'sharp') {
    return (
      <group position={position}>
        <mesh castShadow>
          <coneGeometry args={[width * 0.5, height, 6]} />
          <meshStandardMaterial color={color} roughness={0.95} flatShading />
        </mesh>
        {snow && (
          <mesh position={[0, height * 0.3, 0]} castShadow>
            <coneGeometry args={[width * 0.18, height * 0.35, 6]} />
            <meshStandardMaterial color={peakColor} roughness={0.7} flatShading />
          </mesh>
        )}
      </group>
    );
  }

  if (style === 'pagoda') {
    return (
      <group position={position}>
        <mesh position={[0, height * 0.0, 0]} castShadow>
          <cylinderGeometry args={[width * 0.5, width * 0.55, height * 0.4, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0, height * 0.45, 0]} castShadow>
          <cylinderGeometry args={[width * 0.36, width * 0.42, height * 0.35, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0, height * 0.85, 0]} castShadow>
          <coneGeometry args={[width * 0.28, height * 0.35, 8]} />
          <meshStandardMaterial color={peakColor} roughness={0.85} />
        </mesh>
      </group>
    );
  }

  if (style === 'cliff') {
    return (
      <group position={position}>
        <mesh castShadow>
          <boxGeometry args={[width, height, width * 0.7]} />
          <meshStandardMaterial color={color} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, height * 0.45, 0]} castShadow>
          <boxGeometry args={[width * 0.85, height * 0.1, width * 0.6]} />
          <meshStandardMaterial color={peakColor} roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (style === 'floating') {
    return (
      <group position={[position[0], position[1] + 4, position[2]]}>
        <mesh castShadow>
          <dodecahedronGeometry args={[width * 0.5, 0]} />
          <meshStandardMaterial color={color} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, width * 0.3, 0]} castShadow>
          <coneGeometry args={[width * 0.4, height * 0.5, 6]} />
          <meshStandardMaterial color={peakColor} roughness={0.85} flatShading />
        </mesh>
      </group>
    );
  }

  if (style === 'cyber') {
    return (
      <group position={position}>
        <mesh castShadow>
          <boxGeometry args={[width * 0.6, height, width * 0.6]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Neón en cima */}
        <mesh position={[0, height * 0.5 + 0.3, 0]}>
          <boxGeometry args={[width * 0.7, 0.2, width * 0.7]} />
          <meshBasicMaterial color={peakColor} toneMapped={false} />
        </mesh>
        {/* Antena */}
        <mesh position={[0, height * 0.5 + 1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 2, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>
    );
  }

  // 'rounded' — colinas suaves
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[width * 0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[width * 0.15, height * 0.3, width * 0.1]} castShadow>
        <sphereGeometry args={[width * 0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={peakColor} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

export default function BackgroundMountains({ biome = 'mystic-forest' }) {
  const profile = MOUNTAIN_PROFILES[biome] ?? MOUNTAIN_PROFILES['mystic-forest'];
  const items = useMemo(() => {
    const out = [];
    for (let i = 0; i < profile.count; i++) {
      const a = (i / profile.count) * Math.PI * 2 + Math.sin(i * 7) * 0.1;
      const r = profile.radius[0] + (Math.sin(i * 3.3) * 0.5 + 0.5) * (profile.radius[1] - profile.radius[0]);
      const h = profile.height[0] + (Math.sin(i * 5.7) * 0.5 + 0.5) * (profile.height[1] - profile.height[0]);
      const w = profile.width * (0.85 + Math.sin(i * 9) * 0.15);
      out.push({
        position: [Math.cos(a) * r, h * 0.35, Math.sin(a) * r],
        height: h,
        width: w,
        color: profile.color,
        peakColor: profile.peakColor,
        style: profile.style,
        snow: profile.snow
      });
    }
    return out;
  }, [profile]);

  return (
    <group>
      {items.map((item, i) => (
        <MountainShape key={i} {...item} />
      ))}
    </group>
  );
}
