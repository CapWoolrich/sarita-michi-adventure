import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/* ==== PAJARITO — silueta simple con alas que aletean ==== */
function Bird({ ref, color = '#ffffff' }) {
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh name="wingL" position={[0, 0.05, -0.1]}>
        <coneGeometry args={[0.12, 0.4, 4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh name="wingR" position={[0, 0.05, 0.1]}>
        <coneGeometry args={[0.12, 0.4, 4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function BirdFlock({ count = 6, height = 12, radius = 28, speed = 0.4, color = '#ffffff' }) {
  const groupRef = useRef();
  const data = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      offset: i * 0.4,
      yOffset: i * 0.3,
      color
    })),
    [count, color]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((bird, i) => {
      const d = data[i];
      const a = t * speed + d.offset;
      bird.position.x = Math.cos(a) * radius;
      bird.position.z = Math.sin(a) * radius;
      bird.position.y = height + Math.sin(t * 1.5 + d.yOffset) * 0.6;
      bird.rotation.y = -a + Math.PI / 2;
      // Aletear
      const flap = Math.sin(t * 12 + i) * 0.5;
      bird.children.forEach((child) => {
        if (child.name === 'wingL') child.rotation.z = -flap;
        if (child.name === 'wingR') child.rotation.z = flap;
      });
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <group key={i}>
          <Bird color={d.color} />
        </group>
      ))}
    </group>
  );
}

/* ==== MARIPOSAS — flotan en órbitas pequeñas ==== */
function Butterfly({ color1 = '#ffb6e6', color2 = '#ffeb9c' }) {
  const wingL = useRef();
  const wingR = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wingL.current) wingL.current.rotation.y = -0.7 + Math.sin(t * 18) * 0.6;
    if (wingR.current) wingR.current.rotation.y = 0.7 - Math.sin(t * 18) * 0.6;
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color="#3a2a3a" toneMapped={false} />
      </mesh>
      <group ref={wingL}>
        <mesh position={[-0.18, 0, 0]}>
          <sphereGeometry args={[0.18, 6, 4]} />
          <meshBasicMaterial color={color1} transparent opacity={0.85} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={wingR}>
        <mesh position={[0.18, 0, 0]}>
          <sphereGeometry args={[0.18, 6, 4]} />
          <meshBasicMaterial color={color2} transparent opacity={0.85} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export function ButterflyCloud({ count = 8, palette = ['#ffb6e6', '#ffeb9c', '#b6d8ff', '#d4b6ff'] }) {
  const groupRef = useRef();
  const data = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 30,
      y: 1.5 + Math.random() * 2,
      orbR: 1 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      color1: palette[i % palette.length],
      color2: palette[(i + 1) % palette.length]
    })),
    [count, palette]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((bf, i) => {
      const d = data[i];
      bf.position.x = d.x + Math.cos(t * d.speed + d.phase) * d.orbR;
      bf.position.z = d.z + Math.sin(t * d.speed * 1.3 + d.phase) * d.orbR;
      bf.position.y = d.y + Math.sin(t * 2 + d.phase) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <group key={i}>
          <Butterfly color1={d.color1} color2={d.color2} />
        </group>
      ))}
    </group>
  );
}

/* ==== AVIÓN — pasa cruzando el cielo ocasionalmente ==== */
export function AirplaneOverhead({ height = 22, speed = 0.08, scale = 1.2, color = '#fff8e1' }) {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * speed;
    // Loop cada ~80s sobre el mapa
    const loop = (t % 1) * 2 - 1;
    groupRef.current.position.x = loop * 90;
    groupRef.current.position.z = -10 + Math.sin(t * 0.2) * 5;
    groupRef.current.position.y = height;
    groupRef.current.rotation.y = -Math.PI / 2;
  });
  return (
    <group ref={groupRef} scale={scale}>
      {/* Fuselaje */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 1.8, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Cabina */}
      <mesh position={[0.5, 0.05, 0]}>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshStandardMaterial color="#a8d8ff" transparent opacity={0.85} roughness={0.1} metalness={0.6} />
      </mesh>
      {/* Alas */}
      <mesh position={[-0.05, 0, 0]}>
        <boxGeometry args={[0.7, 0.05, 2.0]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Cola */}
      <mesh position={[-0.7, 0.18, 0]}>
        <boxGeometry args={[0.3, 0.35, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[-0.7, 0.05, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Estela (trail) */}
      <mesh position={[-1.5, 0, 0]}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh position={[-2.2, 0, 0]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ==== Configuración por bioma ==== */
const FAUNA = {
  'mystic-forest': { birds: { count: 5, color: '#fff8d4' }, butterflies: { count: 8, palette: ['#ffd0e7', '#ffe39b'] } },
  'sakura-city': { birds: { count: 4, color: '#ffe5f4' }, butterflies: { count: 12, palette: ['#ff9bc8', '#ffc8e3', '#ffe1ee'] } },
  'crystal-lake': { birds: { count: 6, color: '#ffffff' }, butterflies: { count: 5, palette: ['#9bdaff', '#cfe7ff'] } },
  'mist-grove': { butterflies: { count: 3, palette: ['#a5e8c8', '#7fc8a8'] } },
  'pastel-port': { birds: { count: 8, color: '#ffffff' }, plane: true, butterflies: { count: 4, palette: ['#ffd87a', '#ffb6e0'] } },
  'cloud-valley': { birds: { count: 7, color: '#fff0fa' }, butterflies: { count: 8, palette: ['#cfe7ff', '#e8d5ff'] } },
  'moon-garden': { butterflies: { count: 6, palette: ['#a8c8ff', '#d4b6ff'] } },
  'cotton-beach': { birds: { count: 10, color: '#ffffff' }, butterflies: { count: 6, palette: ['#ffd87a', '#ffb6e0', '#a8e8ff'] } },
  'aurora-mountain': { birds: { count: 3, color: '#cfe7ff' } },
  'stellar-village': {},
  'neon-city': { birds: { count: 8, color: '#ffd066' }, plane: true }
};

export default function SkyFauna({ biome = 'mystic-forest' }) {
  const cfg = FAUNA[biome] ?? {};
  return (
    <>
      {cfg.birds && <BirdFlock count={cfg.birds.count} color={cfg.birds.color} />}
      {cfg.butterflies && <ButterflyCloud count={cfg.butterflies.count} palette={cfg.butterflies.palette} />}
      {cfg.plane && <AirplaneOverhead />}
    </>
  );
}
