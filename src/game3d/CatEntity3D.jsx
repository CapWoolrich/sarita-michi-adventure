import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const BASE_SCALE = 2.0;

function useToonGradient() {
  return useMemo(() => {
    const data = new Uint8Array([60, 130, 200, 255]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function makeRoamingState(cat, mapRadius) {
  return {
    target: pickTarget(cat.anchor, mapRadius),
    timer: 0,
    cooldown: 4 + Math.random() * 4,
    state: 'walk',
    idleEndAt: 0
  };
}

function pickTarget(anchor, mapRadius) {
  const r = 5 + Math.random() * (mapRadius - 8);
  const a = Math.random() * Math.PI * 2;
  return [Math.cos(a) * r, anchor[1], Math.sin(a) * r];
}

/**
 * Gato kawaii v2 — proporciones MUCHO más cute:
 *  - Cabeza enorme (proporcionalmente) vs cuerpo pequeño
 *  - Ojos grandes redondos con destello
 *  - Blush rosa en mejillas
 *  - Cuerpo redondeado tipo "puff"
 *  - Patitas cortas con almohadillas
 *  - Bigotes finitos
 */
export default function CatEntity3D({ cat, visible, highlight = false, showDebugMarker = false, distance = null, onPositionUpdate, mapRadius = 28 }) {
  const ref = useRef();
  const tailRef = useRef();
  const earL = useRef();
  const earR = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  const heartRef = useRef();
  const legFL = useRef();
  const legFR = useRef();
  const legBL = useRef();
  const legBR = useRef();
  const gradientMap = useToonGradient();

  const anchor = cat.anchor ?? [cat.x, cat.y ?? 0.95, cat.z];
  const speed = cat.speed ?? 0.5;
  const phase = cat.phase ?? 0;

  const roamRef = useRef(null);
  if (roamRef.current === null) roamRef.current = makeRoamingState({ anchor }, mapRadius);
  const posRef = useRef({ x: anchor[0], y: anchor[1], z: anchor[2] });

  useFrame(({ clock }, delta) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + phase;
    const dt = Math.min(delta, 0.05);
    const roam = roamRef.current;

    roam.timer += dt;

    if (roam.state === 'walk') {
      const dxT = roam.target[0] - posRef.current.x;
      const dzT = roam.target[2] - posRef.current.z;
      const distT = Math.hypot(dxT, dzT);

      if (distT < 0.6 || roam.timer > roam.cooldown) {
        if (Math.random() < 0.3) {
          const idleType = Math.random();
          roam.state = idleType < 0.5 ? 'sit' : idleType < 0.8 ? 'stretch' : 'idle';
          roam.idleEndAt = clock.getElapsedTime() + 1.2 + Math.random() * 1.5;
        } else {
          roam.target = pickTarget(anchor, mapRadius);
        }
        roam.timer = 0;
        roam.cooldown = 3 + Math.random() * 5;
      } else {
        const stepSpeed = 1.6 + speed * 0.6;
        const nx = dxT / Math.max(distT, 0.001);
        const nz = dzT / Math.max(distT, 0.001);
        posRef.current.x += nx * stepSpeed * dt;
        posRef.current.z += nz * stepSpeed * dt;
        const targetRot = Math.atan2(nx, nz) - Math.PI / 2;
        let diff = targetRot - ref.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ref.current.rotation.y += diff * 0.12;
      }
    } else if (clock.getElapsedTime() > roam.idleEndAt) {
      roam.state = 'walk';
      roam.target = pickTarget(anchor, mapRadius);
      roam.timer = 0;
    }

    posRef.current.y = anchor[1] + Math.sin(t * 2.4) * 0.07;
    ref.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z);
    onPositionUpdate?.(cat.id, posRef.current);

    if (tailRef.current) tailRef.current.rotation.z = -0.4 + Math.sin(t * 4.2) * 0.55;
    if (earL.current) earL.current.rotation.z = 0.32 + Math.sin(t * 2.5) * 0.08;
    if (earR.current) earR.current.rotation.z = -0.32 - Math.sin(t * 2.5) * 0.08;

    if (roam.state === 'walk') {
      const cycle = t * 7;
      const swing = 0.55;
      if (legFL.current) legFL.current.rotation.x = Math.sin(cycle) * swing;
      if (legBR.current) legBR.current.rotation.x = Math.sin(cycle) * swing;
      if (legFR.current) legFR.current.rotation.x = Math.sin(cycle + Math.PI) * swing;
      if (legBL.current) legBL.current.rotation.x = Math.sin(cycle + Math.PI) * swing;
    } else {
      if (legFL.current) legFL.current.rotation.x *= 0.85;
      if (legFR.current) legFR.current.rotation.x *= 0.85;
      if (legBL.current) legBL.current.rotation.x *= 0.85;
      if (legBR.current) legBR.current.rotation.x *= 0.85;
    }

    let bodyTilt = 0;
    if (roam.state === 'sit') bodyTilt = -0.15;
    if (roam.state === 'stretch') bodyTilt = 0.08 + Math.sin(t * 5) * 0.04;
    ref.current.rotation.x = bodyTilt;

    const pulse = highlight ? 1 + Math.sin(t * 4.5) * 0.08 : 1 + Math.sin(t * 2.6) * 0.025;
    ref.current.scale.setScalar(BASE_SCALE * pulse);

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.material.opacity = highlight ? 0.7 : 0.4;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = highlight
        ? 0.55 + Math.sin(t * 4) * 0.15
        : 0.28 + Math.sin(t * 2) * 0.06;
      const s = highlight ? 1 + Math.sin(t * 3.5) * 0.06 : 1 + Math.sin(t * 1.8) * 0.03;
      glowRef.current.scale.setScalar(s);
    }
    if (heartRef.current) {
      heartRef.current.position.y = 1.05 + Math.sin(t * 2) * 0.08;
      heartRef.current.scale.setScalar(highlight ? 1.3 + Math.sin(t * 5) * 0.15 : 1);
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[anchor[0], anchor[1], anchor[2]]} scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]}>
      {/* Halo en suelo */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={glowRef}>
        <circleGeometry args={[0.95, 32]} />
        <meshBasicMaterial color={highlight ? '#fff1b8' : '#ffd0e7'} transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={ringRef}>
        <ringGeometry args={[0.55, 0.9, 40]} />
        <meshBasicMaterial color={highlight ? '#ffe289' : '#ffb6d9'} transparent opacity={0.4} toneMapped={false} />
      </mesh>

      {/* CUERPO redondeado pequeño (puff) */}
      <mesh position={[-0.08, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.32, 18, 18]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} emissive={cat.golden ? '#ffaa33' : (highlight ? '#fff1b8' : '#000000')} emissiveIntensity={cat.golden ? 0.45 : (highlight ? 0.6 : 0)} />
      </mesh>

      {/* CABEZA enorme (proporciones kawaii) */}
      <mesh position={[0.18, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.42, 18, 18]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} emissive={cat.golden ? '#ffaa33' : (highlight ? '#fff1b8' : '#000000')} emissiveIntensity={cat.golden ? 0.45 : (highlight ? 0.6 : 0)} />
      </mesh>

      {/* OREJAS triangulares */}
      <mesh ref={earL} position={[0.1, 0.7, 0.22]} rotation={[0, 0, 0.32]} castShadow>
        <coneGeometry args={[0.13, 0.28, 10]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
      </mesh>
      <mesh ref={earR} position={[0.1, 0.7, -0.22]} rotation={[0, 0, -0.32]} castShadow>
        <coneGeometry args={[0.13, 0.28, 10]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
      </mesh>
      {/* Interior orejas rosadas */}
      <mesh position={[0.12, 0.7, 0.22]} rotation={[0, 0, 0.32]}>
        <coneGeometry args={[0.07, 0.16, 8]} />
        <meshBasicMaterial color="#ffb6d9" />
      </mesh>
      <mesh position={[0.12, 0.7, -0.22]} rotation={[0, 0, -0.32]}>
        <coneGeometry args={[0.07, 0.16, 8]} />
        <meshBasicMaterial color="#ffb6d9" />
      </mesh>

      {/* OJOS GRANDES — esferas negras con destello */}
      <mesh position={[0.43, 0.36, 0.16]}>
        <sphereGeometry args={[0.085, 16, 14]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.43, 0.36, -0.16]}>
        <sphereGeometry args={[0.085, 16, 14]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      {/* Destellos blancos grandes */}
      <mesh position={[0.50, 0.40, 0.18]}>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0.50, 0.40, -0.14]}>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {/* Destellos pequeños inferiores */}
      <mesh position={[0.49, 0.33, 0.15]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0.49, 0.33, -0.17]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* MEJILLAS BLUSH — círculos rosa */}
      <mesh position={[0.49, 0.24, 0.22]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.075, 16]} />
        <meshBasicMaterial color="#ff8fb8" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0.49, 0.24, -0.22]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.075, 16]} />
        <meshBasicMaterial color="#ff8fb8" transparent opacity={0.55} toneMapped={false} />
      </mesh>

      {/* NARIZ pequeña y bonita */}
      <mesh position={[0.58, 0.27, 0]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshBasicMaterial color="#ff8eb8" />
      </mesh>

      {/* BOQUITA — sonrisa kawaii ":3" */}
      <mesh position={[0.58, 0.20, 0.04]} rotation={[0, 0, -0.3]}>
        <torusGeometry args={[0.025, 0.005, 6, 10, Math.PI]} />
        <meshBasicMaterial color="#965672" />
      </mesh>
      <mesh position={[0.58, 0.20, -0.04]} rotation={[0, 0, 0.3]}>
        <torusGeometry args={[0.025, 0.005, 6, 10, Math.PI]} />
        <meshBasicMaterial color="#965672" />
      </mesh>

      {/* BIGOTES finos a cada lado */}
      {[0.32, 0.27, 0.22].map((y, i) => (
        <mesh key={`whL-${i}`} position={[0.58, y, 0.18 + i * 0.02]} rotation={[0, Math.PI / 2, -0.1 + i * 0.1]}>
          <boxGeometry args={[0.18, 0.005, 0.005]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      ))}
      {[0.32, 0.27, 0.22].map((y, i) => (
        <mesh key={`whR-${i}`} position={[0.58, y, -0.18 - i * 0.02]} rotation={[0, -Math.PI / 2, -0.1 + i * 0.1]}>
          <boxGeometry args={[0.18, 0.005, 0.005]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* COLA curvada hacia arriba (más expresiva) */}
      <mesh ref={tailRef} position={[-0.42, 0.05, 0]} rotation={[0, 0.6, -0.2]} castShadow>
        <capsuleGeometry args={[0.055, 0.42, 4, 8]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
      </mesh>
      {/* Punta blanca de la cola */}
      <mesh position={[-0.65, 0.28, 0.04]} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshToonMaterial color="#ffffff" gradientMap={gradientMap} />
      </mesh>

      {/* PATITAS cortas con almohadillas */}
      <group ref={legFL} position={[0.10, -0.25, 0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>
      <group ref={legFR} position={[0.10, -0.25, -0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>
      <group ref={legBL} position={[-0.22, -0.25, 0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>
      <group ref={legBR} position={[-0.22, -0.25, -0.18]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.10, 0.20, 10]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.10, 14]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>

      {/* Corona si es michi dorado */}
      {cat.golden && (
        <group position={[0.18, 0.78, 0]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.22, 0.12, 8]} />
            <meshStandardMaterial color="#ffd066" roughness={0.3} metalness={0.7} emissive="#ffd066" emissiveIntensity={0.4} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.18, 0.1, Math.sin(a) * 0.18]}>
                <coneGeometry args={[0.04, 0.12, 5]} />
                <meshStandardMaterial color="#ffd066" roughness={0.3} metalness={0.7} emissive="#ffd066" emissiveIntensity={0.5} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshBasicMaterial color="#ff66cc" toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* Indicador corazón flotante (más alto por la cabeza grande) */}
      <group ref={heartRef} position={[0, 1.05, 0]}>
        <mesh>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshBasicMaterial color={highlight ? '#ff8fb8' : '#ffb6d9'} transparent opacity={highlight ? 0.95 : 0.78} toneMapped={false} />
        </mesh>
      </group>

      {showDebugMarker && (
        <group position={[0, 1.05, 0]}>
          <mesh>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={highlight ? '#7dffac' : '#ffd68f'} />
          </mesh>
          {distance != null && (
            <mesh position={[0, 0.13, 0]}>
              <boxGeometry args={[0.14, 0.04, 0.14]} />
              <meshBasicMaterial color={distance <= 2.6 ? '#6eff9e' : '#ff9ca9'} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}
