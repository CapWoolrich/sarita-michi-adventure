import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Animación de captura:
 *  Fase 1 (0..0.35s): cuerpo sube y "saltito" feliz
 *  Fase 2 (0.35..0.9s): explota en partículas rosadas + estrellas doradas
 *  Fase 3 (0.6..1.4s): corazón sube hacia el HUD y se desvanece
 *
 *  El componente desaparece automáticamente al terminar.
 */
const PARTICLE_COUNT = 28;
const DURATION = 1.4;

export default function CaptureFX({ position = [0, 1, 0], color = '#ffd0e7', onComplete }) {
  const startRef = useRef(null);
  const ref = useRef();
  const heartRef = useRef();
  const [done, setDone] = useState(false);

  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const elev = Math.random() * Math.PI - Math.PI / 2;
      const speed = 1.6 + Math.random() * 2.2;
      return {
        dir: [Math.cos(a) * Math.cos(elev) * speed, Math.sin(elev) * speed + 0.6, Math.sin(a) * Math.cos(elev) * speed],
        size: 0.05 + Math.random() * 0.06,
        color: i % 3 === 0 ? '#ffe66b' : i % 3 === 1 ? '#ff8fb8' : color,
        rot: Math.random() * Math.PI * 2
      };
    }),
    [color]
  );

  useFrame(({ clock }) => {
    if (done) return;
    if (startRef.current === null) startRef.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startRef.current;
    if (elapsed > DURATION) {
      setDone(true);
      onComplete?.();
      return;
    }

    if (!ref.current) return;
    // Partículas: explosión radial con gravedad
    ref.current.children.forEach((mesh, i) => {
      if (i >= particles.length) return;
      const p = particles[i];
      const phase1 = THREE.MathUtils.clamp((elapsed - 0.35) / 0.55, 0, 1);
      mesh.position.set(
        p.dir[0] * phase1,
        p.dir[1] * phase1 - 0.5 * 6 * phase1 * phase1, // gravedad
        p.dir[2] * phase1
      );
      mesh.rotation.z = p.rot + elapsed * 4;
      const fade = THREE.MathUtils.smoothstep(elapsed, 0.7, DURATION);
      if (mesh.material) mesh.material.opacity = (1 - fade) * 0.95;
      const scale = THREE.MathUtils.clamp(elapsed / 0.4, 0, 1) * (1 + Math.sin(elapsed * 8 + i) * 0.1);
      mesh.scale.setScalar(scale);
    });

    // Corazón sube
    if (heartRef.current) {
      const phase = THREE.MathUtils.clamp((elapsed - 0.5) / 0.9, 0, 1);
      heartRef.current.position.y = phase * 4.5;
      heartRef.current.material.opacity = 1 - phase;
      heartRef.current.scale.setScalar(0.4 + phase * 0.8);
    }
  });

  if (done) return null;

  return (
    <group position={position}>
      <group ref={ref}>
        {particles.map((p, i) => (
          <mesh key={i}>
            <sphereGeometry args={[p.size, 8, 6]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.95} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={heartRef}>
        <sphereGeometry args={[0.18, 14, 10]} />
        <meshBasicMaterial color="#ff8fb8" transparent opacity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}
