import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const BASE_SCALE = 2.6;
const FOG_TRAIL_LENGTH = 14;

/**
 * Gato ZOMBIE v2 — misma anatomía cute que CatEntity3D pero corrompida:
 *   - Cabeza grande, ojos enormes pero ROJOS sin destello blanco
 *   - Boca abierta con dientes blancos puntiagudos en lugar de sonrisa
 *   - Mejillas blush oscuro morado-verde (en vez de rosa)
 *   - Bigotes rotos (cortos e irregulares)
 *   - Cola caída arrastrando con punta podrida (gris en vez de blanca)
 *   - Patitas con almohadillas oscuras
 *   - Cicatriz X en cabeza + parche oscuro en cuerpo
 *   - Cuerpo tintado verdoso pero conserva las formas redondeadas cute
 *   - Trail de NIEBLA VERDE detrás (partículas que se desvanecen)
 *   - PERSIGUE al jugador agresivamente
 */
function useToonGradient() {
  return useMemo(() => {
    const data = new Uint8Array([40, 100, 170, 230]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function FogTrail({ posRef }) {
  const groupRef = useRef();
  const slotsRef = useRef(
    Array.from({ length: FOG_TRAIL_LENGTH }, () => ({ x: 0, y: 0.4, z: 0, life: 0 }))
  );
  const tickRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !posRef?.current) return;
    const dt = Math.min(delta, 0.05);
    tickRef.current += dt;
    if (tickRef.current > 0.08) {
      tickRef.current = 0;
      const slot = slotsRef.current.shift();
      slot.x = posRef.current.x + (Math.random() - 0.5) * 0.25;
      slot.y = 0.3;
      slot.z = posRef.current.z + (Math.random() - 0.5) * 0.25;
      slot.life = 1;
      slotsRef.current.push(slot);
    }
    groupRef.current.children.forEach((mesh, i) => {
      const s = slotsRef.current[i];
      if (s.life > 0) {
        s.life -= dt * 0.6;
        s.y += dt * 0.25;
        mesh.visible = true;
        mesh.position.set(s.x, s.y, s.z);
        const scale = (1 - s.life) * 0.7 + 0.4;
        mesh.scale.setScalar(scale);
        if (mesh.material) mesh.material.opacity = s.life * 0.45;
      } else {
        mesh.visible = false;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {slotsRef.current.map((_, i) => (
        <mesh key={i} visible={false}>
          <sphereGeometry args={[0.32, 8, 6]} />
          <meshBasicMaterial color="#9bcf6f" transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function ZombieCat({
  cat,
  visible,
  highlight = false,
  showDebugMarker = false,
  distance = null,
  onPositionUpdate,
  mapRadius = 56,
  playerPositionRef
}) {
  const ref = useRef();
  const tailRef = useRef();
  const earL = useRef();
  const earR = useRef();
  const auraRef = useRef();
  const legFL = useRef();
  const legFR = useRef();
  const legBL = useRef();
  const legBR = useRef();
  const eyeGlowRef = useRef();
  const gradientMap = useToonGradient();

  const anchor = cat.anchor ?? [cat.x, cat.y ?? 0.95, cat.z];
  const speed = cat.speed ?? 0.5;
  const phase = cat.phase ?? 0;

  // Tinte zombie: mezcla con verde podrido
  const zombieColor = useMemo(() => {
    const base = new THREE.Color(cat.color || '#ffd6c5');
    const zombie = new THREE.Color('#86a86b');
    return base.clone().lerp(zombie, 0.85).getStyle();
  }, [cat.color]);
  const zombieAccent = useMemo(() => {
    const c = new THREE.Color(zombieColor).multiplyScalar(0.65);
    return c.getStyle();
  }, [zombieColor]);

  const posRef = useRef({ x: anchor[0], y: anchor[1], z: anchor[2] });

  useFrame(({ clock }, delta) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + phase;
    const dt = Math.min(delta, 0.05);
    const player = playerPositionRef?.current;

    if (player) {
      const dx = player.x - posRef.current.x;
      const dz = player.z - posRef.current.z;
      const dist = Math.hypot(dx, dz);
      const chaseSpeed = 1.4 + speed * 0.8;
      if (dist > 0.5) {
        const nx = dx / dist;
        const nz = dz / dist;
        const wobble = Math.sin(t * 4) * 0.15;
        posRef.current.x += (nx + wobble * nz) * chaseSpeed * dt;
        posRef.current.z += (nz - wobble * nx) * chaseSpeed * dt;
        const targetRot = Math.atan2(nx, nz) - Math.PI / 2;
        let diff = targetRot - ref.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ref.current.rotation.y += diff * 0.1;
      }
    }

    posRef.current.y = anchor[1] - 0.05 + Math.abs(Math.sin(t * 2.0)) * 0.06;
    ref.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z);
    onPositionUpdate?.(cat.id, posRef.current);

    if (tailRef.current) tailRef.current.rotation.z = -0.85 + Math.sin(t * 1.5) * 0.18;
    if (earL.current) earL.current.rotation.z = -0.05 + Math.sin(t * 1.2) * 0.04;
    if (earR.current) earR.current.rotation.z = 0.05 - Math.sin(t * 1.2) * 0.04;

    const cycle = t * 4.8;
    const swing = 0.5;
    if (legFL.current) legFL.current.rotation.x = Math.sin(cycle) * swing;
    if (legBR.current) legBR.current.rotation.x = Math.sin(cycle + 0.3) * swing;
    if (legFR.current) legFR.current.rotation.x = Math.sin(cycle + Math.PI) * swing;
    if (legBL.current) legBL.current.rotation.x = Math.sin(cycle + Math.PI + 0.3) * swing;

    ref.current.rotation.z = Math.sin(t * 2.3) * 0.07;
    ref.current.rotation.x = Math.sin(t * 1.8) * 0.04;

    const pulse = 1 + Math.sin(t * 2.4) * 0.04;
    ref.current.scale.setScalar(BASE_SCALE * pulse);

    if (auraRef.current) {
      auraRef.current.material.opacity = 0.55 + Math.sin(t * 3) * 0.20;
      auraRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
    }
    if (eyeGlowRef.current) {
      eyeGlowRef.current.intensity = 0.7 + Math.sin(t * 6) * 0.3;
    }
  });

  if (!visible) return null;

  return (
    <>
      <FogTrail posRef={posRef} />
      <group ref={ref} position={[anchor[0], anchor[1], anchor[2]]} scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]}>
        {/* Aura verde malsana en suelo */}
        <mesh ref={auraRef} position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.6, 32]} />
          <meshBasicMaterial color="#5fa05a" transparent opacity={0.35} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 1.0, 40]} />
          <meshBasicMaterial color="#3a8a3a" transparent opacity={0.5} toneMapped={false} />
        </mesh>

        {/* CUERPO con misma forma cute que CatEntity3D */}
        <mesh position={[-0.08, -0.05, 0]} castShadow>
          <sphereGeometry args={[0.32, 18, 18]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        {/* Parche de podredumbre */}
        <mesh position={[-0.16, 0.0, 0.22]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshBasicMaterial color="#3a4530" />
        </mesh>

        {/* CABEZA grande proporciones cute */}
        <mesh position={[0.18, 0.32, 0]} castShadow>
          <sphereGeometry args={[0.42, 18, 18]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        {/* Cicatriz X negra en la cabeza */}
        <mesh position={[0.40, 0.50, 0.20]} rotation={[0, Math.PI / 6, Math.PI / 4]}>
          <boxGeometry args={[0.14, 0.03, 0.03]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.40, 0.50, 0.20]} rotation={[0, Math.PI / 6, -Math.PI / 4]}>
          <boxGeometry args={[0.14, 0.03, 0.03]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>

        {/* OREJAS — una rota, una entera */}
        <mesh ref={earL} position={[0.1, 0.7, 0.22]} rotation={[0, 0, 0.20]} castShadow>
          <coneGeometry args={[0.13, 0.28, 10]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        <mesh ref={earR} position={[0.1, 0.65, -0.22]} rotation={[0, 0, -0.10]} castShadow>
          <coneGeometry args={[0.13, 0.20, 10]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        {/* Interior orejas oscuro */}
        <mesh position={[0.12, 0.70, 0.22]} rotation={[0, 0, 0.20]}>
          <coneGeometry args={[0.07, 0.16, 8]} />
          <meshBasicMaterial color="#5a3030" />
        </mesh>
        <mesh position={[0.12, 0.65, -0.22]} rotation={[0, 0, -0.10]}>
          <coneGeometry args={[0.07, 0.12, 8]} />
          <meshBasicMaterial color="#5a3030" />
        </mesh>
        {/* Mordida en la oreja izquierda */}
        <mesh position={[0.06, 0.78, 0.30]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>

        {/* OJOS ROJOS grandes amenazantes */}
        <mesh position={[0.43, 0.36, 0.16]}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshBasicMaterial color="#ff2020" toneMapped={false} />
        </mesh>
        <mesh position={[0.43, 0.36, -0.16]}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshBasicMaterial color="#ff2020" toneMapped={false} />
        </mesh>
        {/* Pupila negra pequeña */}
        <mesh position={[0.50, 0.36, 0.18]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial color="#1a0000" />
        </mesh>
        <mesh position={[0.50, 0.36, -0.14]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial color="#1a0000" />
        </mesh>
        {/* Glow rojo */}
        <pointLight ref={eyeGlowRef} position={[0.5, 0.36, 0]} intensity={0.7} distance={2.5} color="#ff0000" />

        {/* MEJILLAS BLUSH verdes/moradas oscuras (en vez de rosa) */}
        <mesh position={[0.49, 0.24, 0.22]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.075, 16]} />
          <meshBasicMaterial color="#6a4070" transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh position={[0.49, 0.24, -0.22]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.075, 16]} />
          <meshBasicMaterial color="#6a4070" transparent opacity={0.55} toneMapped={false} />
        </mesh>

        {/* HOCICO ennegrecido */}
        <mesh position={[0.5, 0.23, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshToonMaterial color="#6a4040" gradientMap={gradientMap} />
        </mesh>
        {/* NARIZ negra (sin punta rosa) */}
        <mesh position={[0.60, 0.27, 0]}>
          <sphereGeometry args={[0.03, 10, 8]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>

        {/* BOCA ABIERTA con dientes */}
        <mesh position={[0.58, 0.13, 0]}>
          <boxGeometry args={[0.12, 0.10, 0.20]} />
          <meshBasicMaterial color="#3a0a0a" />
        </mesh>
        {/* Dientes superiores */}
        {[-0.08, -0.04, 0, 0.04, 0.08].map((zo, i) => (
          <mesh key={`tooth-up-${i}`} position={[0.58, 0.17, zo]}>
            <coneGeometry args={[0.014, 0.06, 4]} />
            <meshBasicMaterial color="#fff5e0" />
          </mesh>
        ))}
        {/* Dientes inferiores */}
        {[-0.06, 0, 0.06].map((zo, i) => (
          <mesh key={`tooth-dn-${i}`} position={[0.58, 0.08, zo]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.014, 0.06, 4]} />
            <meshBasicMaterial color="#fff5e0" />
          </mesh>
        ))}
        {/* Babita verde colgando */}
        <mesh position={[0.59, 0.04, 0.04]}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshBasicMaterial color="#7fb060" />
        </mesh>
        <mesh position={[0.59, -0.01, 0.04]}>
          <sphereGeometry args={[0.014, 6, 6]} />
          <meshBasicMaterial color="#7fb060" transparent opacity={0.7} />
        </mesh>

        {/* BIGOTES rotos — solo 2 por lado, irregulares */}
        <mesh position={[0.58, 0.30, 0.20]} rotation={[0, Math.PI / 2, -0.15]}>
          <boxGeometry args={[0.10, 0.005, 0.005]} />
          <meshBasicMaterial color="#e8e8e8" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.58, 0.22, 0.22]} rotation={[0, Math.PI / 2, 0.10]}>
          <boxGeometry args={[0.07, 0.005, 0.005]} />
          <meshBasicMaterial color="#e8e8e8" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.58, 0.30, -0.20]} rotation={[0, -Math.PI / 2, -0.15]}>
          <boxGeometry args={[0.13, 0.005, 0.005]} />
          <meshBasicMaterial color="#e8e8e8" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.58, 0.22, -0.22]} rotation={[0, -Math.PI / 2, 0.10]}>
          <boxGeometry args={[0.06, 0.005, 0.005]} />
          <meshBasicMaterial color="#e8e8e8" transparent opacity={0.6} />
        </mesh>

        {/* COLA caída arrastrando con punta gris (no blanca) */}
        <mesh ref={tailRef} position={[-0.42, -0.05, 0]} rotation={[0, 0.6, -0.85]} castShadow>
          <capsuleGeometry args={[0.055, 0.45, 4, 8]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.68, 0.20, 0.04]} castShadow>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshToonMaterial color="#5a5a5a" gradientMap={gradientMap} />
        </mesh>

        {/* PATITAS cortas con almohadillas oscuras */}
        <group ref={legFL} position={[0.10, -0.25, 0.18]}>
          <mesh position={[0, -0.10, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
            <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.10, 14]} />
            <meshBasicMaterial color="#4a2a2a" />
          </mesh>
        </group>
        <group ref={legFR} position={[0.10, -0.25, -0.18]}>
          <mesh position={[0, -0.10, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
            <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.10, 14]} />
            <meshBasicMaterial color="#4a2a2a" />
          </mesh>
        </group>
        <group ref={legBL} position={[-0.22, -0.25, 0.18]}>
          <mesh position={[0, -0.10, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
            <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.10, 14]} />
            <meshBasicMaterial color="#4a2a2a" />
          </mesh>
        </group>
        <group ref={legBR} position={[-0.22, -0.25, -0.18]}>
          <mesh position={[0, -0.10, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
            <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.10, 14]} />
            <meshBasicMaterial color="#4a2a2a" />
          </mesh>
        </group>

        {/* Calavera roja flotante */}
        <group position={[0, 1.05, 0]}>
          <mesh>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshBasicMaterial color="#ff3030" transparent opacity={0.85} toneMapped={false} />
          </mesh>
        </group>

        {showDebugMarker && distance != null && (
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.14, 0.04, 0.14]} />
            <meshBasicMaterial color={distance <= 2.6 ? '#6eff9e' : '#ff9ca9'} />
          </mesh>
        )}
      </group>
    </>
  );
}
