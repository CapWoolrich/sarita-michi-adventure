import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

/**
 * Trail de partículas que aparece detrás de Sarita cuando corre rápido.
 * Las partículas se desvanecen y suben.
 */
const TRAIL_LENGTH = 18;

export default function SaritaTrail({ characterRef, active = false }) {
  const groupRef = useRef();
  const trail = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({
      x: 0,
      y: 0,
      z: 0,
      life: 0,
      hue: 0
    }))
  );
  const colors = useMemo(() => ['#ffd066', '#ff8fb8', '#a8c8ff', '#d4b6ff'], []);
  const tickRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    tickRef.current += dt;

    // Spawn new particle si está activo y character existe
    if (active && characterRef?.current && tickRef.current > 0.06) {
      tickRef.current = 0;
      const p = trail.current.shift();
      const pos = characterRef.current.position;
      p.x = pos.x + (Math.random() - 0.5) * 0.3;
      p.y = pos.y + 0.1;
      p.z = pos.z + (Math.random() - 0.5) * 0.3;
      p.life = 1;
      p.hue = Math.floor(Math.random() * colors.length);
      trail.current.push(p);
    }

    // Update particles
    groupRef.current.children.forEach((mesh, i) => {
      const p = trail.current[i];
      if (p.life > 0) {
        p.life -= dt * 1.4;
        p.y += dt * 0.7; // sube
        mesh.visible = true;
        mesh.position.set(p.x, p.y, p.z);
        if (mesh.material) mesh.material.opacity = Math.max(0, p.life);
        const s = (1 - p.life) * 0.3 + 0.1;
        mesh.scale.setScalar(s);
        if (mesh.material) mesh.material.color.set(colors[p.hue]);
      } else {
        mesh.visible = false;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {trail.current.map((_, i) => (
        <mesh key={i} visible={false}>
          <sphereGeometry args={[0.18, 8, 6]} />
          <meshBasicMaterial color="#ffd066" transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
