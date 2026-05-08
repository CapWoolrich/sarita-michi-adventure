import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Power-ups visibles en el mapa que el jugador puede recoger:
 *  - 'time' (cristal azul) — +10 segundos al timer
 *  - 'shield' (cristal verde) — invulnerabilidad temporal
 *  - 'magnet' (cristal rosa) — atrae michis hacia ti por 5s
 *  - 'star' (cristal dorado) — +200 puntos
 *
 * Aparecen aleatoriamente cada nivel.
 */
const TYPES = {
  time:   { color: '#7adfff', emissive: '#3aaeff', icon: '⏱', label: '+10s' },
  shield: { color: '#7affc8', emissive: '#3acf8b', icon: '🛡', label: 'Escudo' },
  magnet: { color: '#ff8fb8', emissive: '#cf5a8e', icon: '🧲', label: 'Imán' },
  star:   { color: '#ffd066', emissive: '#cf9a3a', icon: '⭐', label: '+200' }
};

function PowerUpCrystal({ position, type, onCollect, playerPositionRef }) {
  const ref = useRef();
  const collectedRef = useRef(false);
  const [collected, setCollected] = useState(false);
  const cfg = TYPES[type] ?? TYPES.star;

  useFrame(({ clock }) => {
    if (!ref.current || collectedRef.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + 1.0 + Math.sin(t * 1.5) * 0.25;
    ref.current.rotation.y = t * 1.5;
    ref.current.rotation.x = Math.sin(t * 0.8) * 0.2;
    // Detectar pickup
    const player = playerPositionRef?.current;
    if (player) {
      const dx = position[0] - player.x;
      const dz = position[2] - player.z;
      if (Math.hypot(dx, dz) < 1.6) {
        collectedRef.current = true;
        setCollected(true);
        onCollect?.(type);
      }
    }
  });

  if (collected) return null;
  return (
    <group ref={ref} position={[position[0], position[1] + 1.0, position[2]]}>
      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshBasicMaterial color={cfg.color} transparent opacity={0.15} toneMapped={false} />
      </mesh>
      {/* Cristal central */}
      <mesh castShadow>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={0.6} metalness={0.4} roughness={0.2} />
      </mesh>
      {/* Anillo en suelo */}
      <mesh position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.65, 32]} />
        <meshBasicMaterial color={cfg.color} transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <pointLight intensity={0.5} distance={3} color={cfg.color} />
    </group>
  );
}

/**
 * Spawn de N power-ups aleatorios por nivel.
 * Distribución determinista por seed del worldId.
 */
export default function PowerUps({ count = 4, playerPositionRef, onCollect, worldKey = '' }) {
  const items = useMemo(() => {
    const types = ['time', 'shield', 'magnet', 'star'];
    let seed = 0;
    for (let i = 0; i < worldKey.length; i++) seed = (seed * 31 + worldKey.charCodeAt(i)) | 0;
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = ((seed + i * 137) * 0.1) % (Math.PI * 2);
      const r = 12 + ((seed + i * 17) % 60);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const type = types[(seed + i) % types.length];
      out.push({ id: `pu-${i}-${seed}`, position: [x, 0, z], type });
    }
    return out;
  }, [count, worldKey]);

  return (
    <>
      {items.map((it) => (
        <PowerUpCrystal
          key={it.id}
          position={it.position}
          type={it.type}
          playerPositionRef={playerPositionRef}
          onCollect={onCollect}
        />
      ))}
    </>
  );
}
