import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Power-ups visibles en el mapa que el jugador puede recoger:
 *  - 'time' (cristal azul) — +10 segundos al timer
 *  - 'shield' (cristal verde) — invulnerabilidad temporal
 *  - 'magnet' (cristal rosa) — atrae michis hacia ti por 5s
 *  - 'star' (cristal dorado) — +200 puntos
 */
const TYPES = {
  time:   { color: '#7adfff', emissive: '#3aaeff', label: '+10s' },
  shield: { color: '#7affc8', emissive: '#3acf8b', label: 'Escudo' },
  magnet: { color: '#ff8fb8', emissive: '#cf5a8e', label: 'Imán' },
  star:   { color: '#ffd066', emissive: '#cf9a3a', label: '+200' }
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

    const player = playerPositionRef?.current;
    if (!player) return;

    const dx = position[0] - player.x;
    const dz = position[2] - player.z;
    if (dx * dx + dz * dz < 2.56) {
      collectedRef.current = true;
      setCollected(true);
      // Evita ejecutar setState del runtime dentro del mismo frame de render 3D.
      // Esto reduce micro-trabas en iPhone al recoger potenciadores.
      window.requestAnimationFrame(() => onCollect?.(type));
    }
  });

  if (collected) return null;
  return (
    <group ref={ref} position={[position[0], position[1] + 1.0, position[2]]}>
      <mesh>
        <sphereGeometry args={[0.55, 12, 8]} />
        <meshBasicMaterial color={cfg.color} transparent opacity={0.13} toneMapped={false} />
      </mesh>
      <mesh castShadow>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={0.45} metalness={0.2} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.65, 24]} />
        <meshBasicMaterial color={cfg.color} transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PowerUps({ count = 4, playerPositionRef, onCollect, worldKey = '' }) {
  const items = useMemo(() => {
    const types = ['time', 'shield', 'magnet', 'star'];
    let seed = 0;
    for (let i = 0; i < worldKey.length; i++) seed = (seed * 31 + worldKey.charCodeAt(i)) | 0;
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = ((seed + i * 137) * 0.1) % (Math.PI * 2);
      const r = 12 + Math.abs((seed + i * 17) % 60);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const type = types[Math.abs(seed + i) % types.length];
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
