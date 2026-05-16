import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Gato ZOMBIE — versión siniestra del michi.
 *  - Cuerpo verdoso/grisáceo con tinte enfermo
 *  - Ojos rojos brillantes amenazantes (sin destellos blancos)
 *  - Boca abierta con dientes
 *  - Cicatrices/parches faltantes (X negras en cuerpo)
 *  - Cola caída arrastrando
 *  - Aura verde malsana en suelo
 *  - PERSIGUE al jugador agresivamente
 */
const BASE_SCALE = 2.0;

function useToonGradient() {
  return useMemo(() => {
    const data = new Uint8Array([40, 90, 160, 230]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, []);
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

  // Tinte zombie: si color es rosa, se vuelve verdoso. Si es claro, gris pútrido
  const zombieColor = useMemo(() => {
    const base = new THREE.Color(cat.color || '#ffd6c5');
    // Mezclar con verde zombie y desaturar
    const zombie = new THREE.Color('#7c9560');
    return base.clone().lerp(zombie, 0.65).getStyle();
  }, [cat.color]);

  const posRef = useRef({ x: anchor[0], y: anchor[1], z: anchor[2] });
  const dragStepRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + phase;
    const dt = Math.min(delta, 0.05);
    const player = playerPositionRef?.current;

    // PERSEGUIR al jugador (no wander aleatorio)
    if (player) {
      const dx = player.x - posRef.current.x;
      const dz = player.z - posRef.current.z;
      const dist = Math.hypot(dx, dz);

      // Velocidad zombie: lenta pero implacable
      const chaseSpeed = 1.4 + speed * 0.8;
      if (dist > 0.5) {
        const nx = dx / dist;
        const nz = dz / dist;
        // Movimiento "arrastrado" — pequeño jitter, no perfectamente recto
        const wobble = Math.sin(t * 4) * 0.15;
        posRef.current.x += (nx + wobble * nz) * chaseSpeed * dt;
        posRef.current.z += (nz - wobble * nx) * chaseSpeed * dt;
        // Mira al jugador
        const targetRot = Math.atan2(nx, nz) - Math.PI / 2;
        let diff = targetRot - ref.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ref.current.rotation.y += diff * 0.1;
      }
    }

    // Bobbing arrastrado (más bajo + irregular que michi normal)
    posRef.current.y = anchor[1] - 0.05 + Math.abs(Math.sin(t * 2.0)) * 0.06;
    ref.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z);
    onPositionUpdate?.(cat.id, posRef.current);

    // Cola caída con movimiento errático
    if (tailRef.current) tailRef.current.rotation.z = -0.85 + Math.sin(t * 1.5) * 0.18;
    // Orejas caídas
    if (earL.current) earL.current.rotation.z = -0.15 + Math.sin(t * 1.2) * 0.04;
    if (earR.current) earR.current.rotation.z = 0.15 - Math.sin(t * 1.2) * 0.04;

    // Walk cycle "arrastrado" — patitas alternadas pero menos coordinadas
    const cycle = t * 4.5;
    const swing = 0.4;
    if (legFL.current) legFL.current.rotation.x = Math.sin(cycle) * swing;
    if (legBR.current) legBR.current.rotation.x = Math.sin(cycle + 0.3) * swing;
    if (legFR.current) legFR.current.rotation.x = Math.sin(cycle + Math.PI) * swing;
    if (legBL.current) legBL.current.rotation.x = Math.sin(cycle + Math.PI + 0.3) * swing;

    // Bamboleo del cuerpo (tambaleo)
    ref.current.rotation.z = Math.sin(t * 2.3) * 0.07;
    ref.current.rotation.x = Math.sin(t * 1.8) * 0.04;

    const pulse = 1 + Math.sin(t * 2.4) * 0.04;
    ref.current.scale.setScalar(BASE_SCALE * pulse);

    // Aura verde malsana
    if (auraRef.current) {
      auraRef.current.material.opacity = 0.35 + Math.sin(t * 3) * 0.1;
      auraRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
    }
    // Ojos rojos brillantes pulsantes
    if (eyeGlowRef.current) {
      eyeGlowRef.current.intensity = 0.6 + Math.sin(t * 6) * 0.3;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[anchor[0], anchor[1], anchor[2]]} scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]}>
      {/* Aura verde malsana en suelo */}
      <mesh ref={auraRef} position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshBasicMaterial color="#5fa05a" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 1.0, 40]} />
        <meshBasicMaterial color="#3a8a3a" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* CUERPO zombie - oscuro grisáceo */}
      <mesh position={[-0.08, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.34, 18, 18]} />
        <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
      </mesh>
      {/* Mancha de podredumbre en cuerpo */}
      <mesh position={[-0.18, -0.08, 0.22]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshBasicMaterial color="#3a4530" />
      </mesh>

      {/* CABEZA */}
      <mesh position={[0.18, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.42, 18, 18]} />
        <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
      </mesh>
      {/* Cicatriz X en la cabeza */}
      <mesh position={[0.45, 0.5, 0.18]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.025, 0.025]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.45, 0.5, 0.18]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.025, 0.025]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* OREJAS caídas */}
      <mesh ref={earL} position={[0.1, 0.65, 0.22]} rotation={[0, 0, -0.15]} castShadow>
        <coneGeometry args={[0.13, 0.26, 10]} />
        <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
      </mesh>
      <mesh ref={earR} position={[0.1, 0.65, -0.22]} rotation={[0, 0, 0.15]} castShadow>
        <coneGeometry args={[0.13, 0.26, 10]} />
        <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
      </mesh>
      {/* Oreja rota (parche faltante en una) */}
      <mesh position={[0.12, 0.68, 0.22]} rotation={[0, 0, -0.15]}>
        <coneGeometry args={[0.06, 0.1, 6]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* OJOS ROJOS brillantes amenazantes (sin destellos) */}
      <mesh position={[0.43, 0.36, 0.16]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshBasicMaterial color="#ff1a1a" toneMapped={false} />
      </mesh>
      <mesh position={[0.43, 0.36, -0.16]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshBasicMaterial color="#ff1a1a" toneMapped={false} />
      </mesh>
      {/* Glow rojo en los ojos */}
      <pointLight ref={eyeGlowRef} position={[0.5, 0.36, 0]} intensity={0.6} distance={2} color="#ff0000" />

      {/* HOCICO oscuro */}
      <mesh position={[0.5, 0.23, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshToonMaterial color="#7a4040" gradientMap={gradientMap} />
      </mesh>
      {/* NARIZ negra */}
      <mesh position={[0.6, 0.27, 0]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* BOCA ABIERTA con dientes */}
      <mesh position={[0.58, 0.13, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.18]} />
        <meshBasicMaterial color="#3a0a0a" />
      </mesh>
      {/* Dientes blancos puntiagudos */}
      {[-0.07, 0, 0.07].map((zo, i) => (
        <mesh key={`tooth-up-${i}`} position={[0.58, 0.16, zo]}>
          <coneGeometry args={[0.012, 0.05, 4]} />
          <meshBasicMaterial color="#fff8e0" />
        </mesh>
      ))}
      {[-0.07, 0, 0.07].map((zo, i) => (
        <mesh key={`tooth-dn-${i}`} position={[0.58, 0.10, zo]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.012, 0.05, 4]} />
          <meshBasicMaterial color="#fff8e0" />
        </mesh>
      ))}
      {/* Saliva/baba verde */}
      <mesh position={[0.59, 0.05, 0.05]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#6fa050" />
      </mesh>

      {/* COLA caída arrastrando */}
      <mesh ref={tailRef} position={[-0.42, -0.08, 0]} rotation={[0, 0.6, -0.85]} castShadow>
        <capsuleGeometry args={[0.055, 0.45, 4, 8]} />
        <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
      </mesh>

      {/* PATITAS — arrastrando */}
      <group ref={legFL} position={[0.10, -0.25, 0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#5a3a3a" />
        </mesh>
      </group>
      <group ref={legFR} position={[0.10, -0.25, -0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#5a3a3a" />
        </mesh>
      </group>
      <group ref={legBL} position={[-0.22, -0.25, 0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#5a3a3a" />
        </mesh>
      </group>
      <group ref={legBR} position={[-0.22, -0.25, -0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={zombieColor} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#5a3a3a" />
        </mesh>
      </group>

      {/* Calavera flotante encima (en lugar de corazón) */}
      <group position={[0, 1.0, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 10, 8]} />
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
  );
}
