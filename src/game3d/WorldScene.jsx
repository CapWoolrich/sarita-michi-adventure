import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * THEMES — cada mundo tiene paleta coherente:
 * sky[0] = top, sky[1] = horizon (gradient), sun = key light, ground = floor base.
 */
const THEMES = {
  'mystic-forest':   { skyTop:'#a8d6ff', skyBot:'#fdf3d0', sun:'#fff1c2', fog:'#e8f6dd', ground:'#9fcf86', accent:'#ffd7ec' },
  'sakura-city':     { skyTop:'#ffc5e0', skyBot:'#fff0f7', sun:'#ffe4f1', fog:'#fcdcec', ground:'#e2c7bb', accent:'#ff9bc8' },
  'crystal-lake':    { skyTop:'#bfe6ff', skyBot:'#eafaff', sun:'#e5f7ff', fog:'#dff2fb', ground:'#bbd9c6', accent:'#9be8ff' },
  'mist-grove':      { skyTop:'#cfd8d3', skyBot:'#eef2ed', sun:'#ffffff', fog:'#dfe6e1', ground:'#a8c0ab', accent:'#c8d8c8' },
  'pastel-port':     { skyTop:'#ffd7b8', skyBot:'#fff3e3', sun:'#ffe4c4', fog:'#ffe6d2', ground:'#dac8b6', accent:'#ffb38b' },
  'cloud-valley':    { skyTop:'#cfe2ff', skyBot:'#f4f8ff', sun:'#fff7e1', fog:'#e6efff', ground:'#cad8c8', accent:'#a8c8ff' },
  'moon-garden':     { skyTop:'#1f2552', skyBot:'#5d65a4', sun:'#aab4ff', fog:'#5a64a0', ground:'#5a5f86', accent:'#ffd6f5' },
  'cotton-beach':    { skyTop:'#9fdcff', skyBot:'#e0f6ff', sun:'#fff2c4', fog:'#d2effc', ground:'#f1d7af', accent:'#ffd29b' },
  'aurora-mountain': { skyTop:'#1a2247', skyBot:'#3f5078', sun:'#a4f6ff', fog:'#3b4d77', ground:'#5c6f82', accent:'#7affd1' },
  'stellar-village': { skyTop:'#1c1745', skyBot:'#5347a0', sun:'#ffe9b5', fog:'#4d4380', ground:'#655782', accent:'#ffd6a5' }
};

/* Sky gradient via inverted sphere with vertex colors. */
function SkyDome({ top, bot }) {
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(180, 32, 16);
    const colors = [];
    const c1 = new THREE.Color(top);
    const c2 = new THREE.Color(bot);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = THREE.MathUtils.clamp((y + 100) / 200, 0, 1);
      const c = c2.clone().lerp(c1, t);
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, [top, bot]);
  return (
    <mesh geometry={geom} scale={[-1, 1, 1]} renderOrder={-1}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

/* Sparkle / particle system — gentle bobbing motion. */
function Sparkles({ count = 36, color = '#fff0ac', accent = '#e0f8ff' }) {
  const groupRef = useRef();
  const positions = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      x: Math.sin(i * 1.9) * (10 + (i % 5)),
      y: 1.2 + (i % 6) * 0.6,
      z: Math.cos(i * 2.1) * (10 + (i % 5)),
      phase: i * 0.4,
      tone: i % 3 === 0 ? accent : color
    })),
    [count, color, accent]
  );
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const p = positions[i];
      child.position.y = p.y + Math.sin(t * 1.2 + p.phase) * 0.35;
      child.position.x = p.x + Math.sin(t * 0.8 + p.phase) * 0.25;
    });
  });
  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <mesh key={`spk-${i}`} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshBasicMaterial color={p.tone} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function WorldScene({ worldTheme = 'mystic-forest' }) {
  const theme = THEMES[worldTheme] ?? THEMES['mystic-forest'];

  // Procedural tree placements — más cantidad, más variedad.
  const trees = useMemo(
    () => Array.from({ length: 26 }, (_, i) => {
      const angle = (i / 26) * Math.PI * 2 + Math.sin(i) * 0.4;
      const radius = 18 + (i % 5) * 2.5;
      const tall = 3 + (i % 4) * 0.6;
      const leafSize = 1.4 + (i % 3) * 0.35;
      const variation = i % 3;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.85 + (i % 7) * 0.07,
        tall,
        leafSize,
        variation,
        leafColor: variation === 0 ? '#7ac985' : variation === 1 ? '#a3d9a5' : '#88c4d8'
      };
    }),
    []
  );

  // Small decorative bushes / mushrooms scattered.
  const props = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      x: Math.sin(i * 2.3) * (6 + (i % 9)),
      z: Math.cos(i * 1.7) * (6 + (i % 9)),
      kind: i % 3, // 0=bush 1=mushroom 2=flower
      tone: i % 4
    })),
    []
  );

  const hasWater = ['crystal-lake', 'cotton-beach', 'pastel-port'].includes(worldTheme);
  const hasHouses = ['sakura-city', 'pastel-port', 'stellar-village'].includes(worldTheme);

  return (
    <>
      {/* Background + atmospheric fog */}
      <color attach="background" args={[theme.skyBot]} />
      <fog attach="fog" args={[theme.fog, 18, 75]} />
      <SkyDome top={theme.skyTop} bot={theme.skyBot} />

      {/* === LIGHTING (3-point + rim) === */}
      <ambientLight intensity={0.45} color="#ffffff" />
      <hemisphereLight args={['#ffffff', theme.ground, 0.55]} />
      {/* Key light — sun, casts soft shadows */}
      <directionalLight
        position={[12, 22, 8]}
        intensity={1.4}
        color={theme.sun}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0008}
        shadow-normalBias={0.04}
      />
      {/* Fill light — softens shadows, opposite side */}
      <directionalLight position={[-10, 8, -6]} intensity={0.35} color="#cfe4ff" />
      {/* Rim light — separates characters from background */}
      <directionalLight position={[0, 4, -14]} intensity={0.5} color={theme.accent} />

      {/* === GROUND === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[80, 96]} />
        <meshStandardMaterial color={theme.ground} roughness={0.95} metalness={0} />
      </mesh>

      {/* Soft path ring around player spawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[3.5, 16, 64]} />
        <meshStandardMaterial color="#fbe9c4" transparent opacity={0.55} roughness={0.9} />
      </mesh>

      {/* === WATER (selected biomes) === */}
      {hasWater && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0.04, 2]} receiveShadow>
          <planeGeometry args={[26, 44, 1, 1]} />
          <meshStandardMaterial color="#9be0ff" transparent opacity={0.78} roughness={0.2} metalness={0.1} />
        </mesh>
      )}

      {/* === TREES (low-poly stylized) === */}
      {trees.map((t, i) => (
        <group key={`tree-${i}`} position={[t.x, 0, t.z]} scale={t.scale}>
          <mesh position={[0, t.tall / 2, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.36, t.tall, 8]} />
            <meshStandardMaterial color="#8b5e41" roughness={0.95} />
          </mesh>
          {/* Layered leaves — 2-3 staggered spheres for organic look */}
          <mesh position={[0, t.tall + t.leafSize * 0.6, 0]} castShadow>
            <sphereGeometry args={[t.leafSize, 12, 10]} />
            <meshStandardMaterial color={t.leafColor} roughness={0.85} />
          </mesh>
          {t.variation !== 2 && (
            <mesh position={[t.leafSize * 0.4, t.tall + t.leafSize * 1.1, t.leafSize * 0.2]} castShadow>
              <sphereGeometry args={[t.leafSize * 0.75, 10, 8]} />
              <meshStandardMaterial color={t.leafColor} roughness={0.85} />
            </mesh>
          )}
          {t.variation === 1 && (
            <mesh position={[-t.leafSize * 0.45, t.tall + t.leafSize * 0.85, -t.leafSize * 0.3]} castShadow>
              <sphereGeometry args={[t.leafSize * 0.65, 10, 8]} />
              <meshStandardMaterial color={t.leafColor} roughness={0.85} />
            </mesh>
          )}
        </group>
      ))}

      {/* === DECOR PROPS (bushes, mushrooms, flowers) === */}
      {props.map((p, i) => {
        if (p.kind === 0) {
          // Bush
          return (
            <mesh key={`pr-${i}`} position={[p.x, 0.35, p.z]} castShadow>
              <sphereGeometry args={[0.55, 10, 8]} />
              <meshStandardMaterial color={['#a8d8a3', '#9bcf9f', '#bce0a8', '#86c9a0'][p.tone]} roughness={0.9} />
            </mesh>
          );
        }
        if (p.kind === 1) {
          // Mushroom
          return (
            <group key={`pr-${i}`} position={[p.x, 0, p.z]}>
              <mesh position={[0, 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.09, 0.36, 8]} />
                <meshStandardMaterial color="#fbf4e1" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.42, 0]} castShadow>
                <sphereGeometry args={[0.22, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={['#e98890', '#f3a5a3', '#c98ad8'][p.tone % 3]} roughness={0.7} />
              </mesh>
            </group>
          );
        }
        // Flower (pillar + tiny petal sphere)
        return (
          <group key={`pr-${i}`} position={[p.x, 0, p.z]}>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.36, 5]} />
              <meshStandardMaterial color="#84a85a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.42, 0]} castShadow>
              <sphereGeometry args={[0.11, 8, 6]} />
              <meshStandardMaterial color={['#ffb6d0', '#ffe39b', '#dab2ff', '#ff9bc8'][p.tone]} roughness={0.7} emissive={['#ff8fb8', '#ffd07a', '#bf8fee', '#ff7fab'][p.tone]} emissiveIntensity={0.15} />
            </mesh>
          </group>
        );
      })}

      {/* === HOUSES (selected biomes) === */}
      {hasHouses &&
        Array.from({ length: 7 }).map((_, i) => (
          <group key={`house-${i}`} position={[Math.sin(i * 0.95) * 22, 0, Math.cos(i * 1.1) * 22]} castShadow>
            <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.7, 1.4, 1.7]} />
              <meshStandardMaterial color={['#ffd6ea', '#ffe5be', '#d8dbff', '#fff2c4'][i % 4]} roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[1.3, 0.9, 4]} />
              <meshStandardMaterial color={['#c98390', '#a8748e', '#7d83b8'][i % 3]} roughness={0.8} />
            </mesh>
          </group>
        ))}

      {/* === SPARKLES === */}
      <Sparkles count={42} color={theme.sun} accent={theme.accent} />
    </>
  );
}
