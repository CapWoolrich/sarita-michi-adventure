import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Cada bioma define cómo lucen y se mueven las partículas atmosféricas.
 * "petals" — caen y giran (Sakura, Cotton)
 * "snow" — caen lentamente (Aurora)
 * "fireflies" — flotan en órbitas pequeñas (Mystic, Mist, Moon)
 * "bubbles" — suben (Crystal Lake, Cotton Beach)
 * "stars" — destellan en lo alto (Stellar, Moon)
 * "leaves" — caen oscilando (Cloud Valley)
 */

const BIOME_AMBIENCE = {
  'mystic-forest': { kind: 'fireflies', count: 28, color: '#fff0a8', accent: '#fff7c4' },
  'sakura-city': { kind: 'petals', count: 50, color: '#ffb6d9', accent: '#ffd0e7' },
  'crystal-lake': { kind: 'bubbles', count: 32, color: '#cfe7ff', accent: '#9be0ff' },
  'mist-grove': { kind: 'fireflies', count: 22, color: '#a5e8c8', accent: '#7fc8a8' },
  'pastel-port': { kind: 'petals', count: 28, color: '#ffe5be', accent: '#ffc8a8' },
  'cloud-valley': { kind: 'leaves', count: 30, color: '#cfe7ff', accent: '#e8d5ff' },
  'moon-garden': { kind: 'fireflies', count: 36, color: '#a8c8ff', accent: '#d4b6ff' },
  'cotton-beach': { kind: 'bubbles', count: 24, color: '#fff0c8', accent: '#a8e8ff' },
  'aurora-mountain': { kind: 'snow', count: 70, color: '#ffffff', accent: '#cfe7ff' },
  'stellar-village': { kind: 'stars', count: 60, color: '#fff5d4', accent: '#a8c8ff' }
};

export default function FallingAmbience({ biome = 'mystic-forest' }) {
  const cfg = BIOME_AMBIENCE[biome] ?? BIOME_AMBIENCE['mystic-forest'];
  const groupRef = useRef();

  const data = useMemo(
    () => Array.from({ length: cfg.count }, (_, i) => ({
      x: (Math.random() - 0.5) * 50,
      y: cfg.kind === 'bubbles' ? Math.random() * 6 : 4 + Math.random() * 12,
      z: (Math.random() - 0.5) * 50,
      speed: 0.5 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
      tone: i % 3 === 0 ? cfg.accent : cfg.color,
      size: cfg.kind === 'snow' ? 0.05 + Math.random() * 0.03 : cfg.kind === 'stars' ? 0.08 + Math.random() * 0.05 : 0.07 + Math.random() * 0.05
    })),
    [cfg]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((mesh, i) => {
      const d = data[i];
      switch (cfg.kind) {
        case 'petals':
        case 'leaves':
          mesh.position.y -= d.speed * 0.025;
          mesh.position.x += Math.sin(t * 0.8 + d.phase) * 0.012;
          mesh.rotation.x += 0.02;
          mesh.rotation.z += 0.018;
          if (mesh.position.y < 0.2) {
            mesh.position.y = 14 + Math.random() * 6;
            mesh.position.x = (Math.random() - 0.5) * 50;
            mesh.position.z = (Math.random() - 0.5) * 50;
          }
          break;
        case 'snow':
          mesh.position.y -= d.speed * 0.018;
          mesh.position.x += Math.sin(t * 0.5 + d.phase) * 0.005;
          if (mesh.position.y < 0.1) {
            mesh.position.y = 14 + Math.random() * 4;
            mesh.position.x = (Math.random() - 0.5) * 50;
            mesh.position.z = (Math.random() - 0.5) * 50;
          }
          break;
        case 'bubbles':
          mesh.position.y += d.speed * 0.02;
          mesh.position.x += Math.sin(t * 1.0 + d.phase) * 0.008;
          if (mesh.position.y > 10) {
            mesh.position.y = 0.2;
            mesh.position.x = (Math.random() - 0.5) * 30;
            mesh.position.z = (Math.random() - 0.5) * 30;
          }
          break;
        case 'fireflies':
          mesh.position.x = d.x + Math.sin(t * 0.7 + d.phase) * 1.5;
          mesh.position.z = d.z + Math.cos(t * 0.6 + d.phase) * 1.5;
          mesh.position.y = d.y + Math.sin(t * 1.4 + d.phase) * 0.6;
          if (mesh.material) {
            mesh.material.opacity = 0.5 + Math.sin(t * 2.5 + d.phase) * 0.4;
          }
          break;
        case 'stars':
          if (mesh.material) {
            mesh.material.opacity = 0.6 + Math.sin(t * 1.8 + d.phase) * 0.4;
          }
          break;
        default:
          break;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          {cfg.kind === 'petals' ? (
            <planeGeometry args={[d.size * 1.6, d.size * 1.0]} />
          ) : cfg.kind === 'leaves' ? (
            <planeGeometry args={[d.size * 1.2, d.size * 1.6]} />
          ) : (
            <sphereGeometry args={[d.size, 6, 6]} />
          )}
          <meshBasicMaterial
            color={d.tone}
            transparent
            opacity={cfg.kind === 'fireflies' || cfg.kind === 'stars' ? 0.7 : 0.85}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
