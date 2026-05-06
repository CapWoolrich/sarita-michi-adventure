import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

const BASE_SCALE = 1.95;

/* Toon gradient — 4 steps cell-shaded look */
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

/**
 * Roaming AI estado:
 *  - Cada gato elige un "target" aleatorio dentro del mapa, camina hacia él
 *  - Al llegar (o tras X segundos), elige otro target
 *  - Velocidad y radio de roaming distintos por gato
 */
function makeRoamingState(cat, mapRadius) {
  return {
    target: pickTarget(cat.anchor, mapRadius),
    timer: 0,
    cooldown: 4 + Math.random() * 4,
    state: 'walk',  // walk | idle | sit | stretch
    idleEndAt: 0
  };
}

function pickTarget(anchor, mapRadius) {
  // Rangos amplios pero centrados — el gato vaga por casi todo el mapa
  const r = 5 + Math.random() * (mapRadius - 8);
  const a = Math.random() * Math.PI * 2;
  return [Math.cos(a) * r, anchor[1], Math.sin(a) * r];
}

export default function CatEntity3D({ cat, visible, highlight = false, showDebugMarker = false, distance = null, onPositionUpdate, mapRadius = 28 }) {
  const ref = useRef();
  const tailRef = useRef();
  const earL = useRef();
  const earR = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  const heartRef = useRef();
  const legFL = useRef(); // front-left
  const legFR = useRef();
  const legBL = useRef();
  const legBR = useRef();
  const gradientMap = useToonGradient();

  const anchor = cat.anchor ?? [cat.x, cat.y ?? 0.95, cat.z];
  const speed = cat.speed ?? 0.5;
  const phase = cat.phase ?? 0;

  const roamRef = useRef(null);
  if (roamRef.current === null) roamRef.current = makeRoamingState({ anchor }, mapRadius);
  // posición actual mantenida en ref (para que Game3DCanvas pueda leerla)
  const posRef = useRef({ x: anchor[0], y: anchor[1], z: anchor[2] });

  useEffect(() => {
    if (cat.captured) {
      // se eliminó del visible flag pero conservamos limpio
    }
  }, [cat.captured]);

  useFrame(({ clock }, delta) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + phase;
    const dt = Math.min(delta, 0.05);
    const roam = roamRef.current;

    roam.timer += dt;

    // Decisión: cuando timer pasa cooldown, elige nuevo target o entra en idle
    if (roam.state === 'walk') {
      const dxT = roam.target[0] - posRef.current.x;
      const dzT = roam.target[2] - posRef.current.z;
      const distT = Math.hypot(dxT, dzT);

      if (distT < 0.6 || roam.timer > roam.cooldown) {
        // Llegó o se aburrió — 30% chance de idle, 70% nuevo target
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
        // Camina hacia target
        const stepSpeed = 1.6 + speed * 0.6;
        const nx = dxT / Math.max(distT, 0.001);
        const nz = dzT / Math.max(distT, 0.001);
        posRef.current.x += nx * stepSpeed * dt;
        posRef.current.z += nz * stepSpeed * dt;

        // Mira hacia donde camina
        const targetRot = Math.atan2(nx, nz) - Math.PI / 2;
        let diff = targetRot - ref.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ref.current.rotation.y += diff * 0.12;
      }
    } else if (clock.getElapsedTime() > roam.idleEndAt) {
      // Vuelve a walk
      roam.state = 'walk';
      roam.target = pickTarget(anchor, mapRadius);
      roam.timer = 0;
    }

    // Bobbing vertical
    const baseY = anchor[1];
    posRef.current.y = baseY + Math.sin(t * 2.4) * 0.07;

    // Aplica posición
    ref.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z);
    onPositionUpdate?.(cat.id, posRef.current);

    // Cola, orejas
    if (tailRef.current) tailRef.current.rotation.y = 0.6 + Math.sin(t * 3.4) * 0.45;
    if (earL.current) earL.current.rotation.z = 0.25 + Math.sin(t * 2.5) * 0.06;
    if (earR.current) earR.current.rotation.z = -0.25 - Math.sin(t * 2.5) * 0.06;

    // === WALK CYCLE: 4 patitas alternadas ===
    if (roam.state === 'walk') {
      const cycle = t * 7;
      // FL ↔ BR (par diagonal 1)
      // FR ↔ BL (par diagonal 2)
      const swing = 0.55;
      if (legFL.current) { legFL.current.rotation.x = Math.sin(cycle) * swing; }
      if (legBR.current) { legBR.current.rotation.x = Math.sin(cycle) * swing; }
      if (legFR.current) { legFR.current.rotation.x = Math.sin(cycle + Math.PI) * swing; }
      if (legBL.current) { legBL.current.rotation.x = Math.sin(cycle + Math.PI) * swing; }
    } else {
      // Idle: patitas en reposo
      if (legFL.current) legFL.current.rotation.x *= 0.85;
      if (legFR.current) legFR.current.rotation.x *= 0.85;
      if (legBL.current) legBL.current.rotation.x *= 0.85;
      if (legBR.current) legBR.current.rotation.x *= 0.85;
    }

    // Pose por estado
    let bodyTilt = 0;
    if (roam.state === 'sit') bodyTilt = -0.15;
    if (roam.state === 'stretch') bodyTilt = 0.08 + Math.sin(t * 5) * 0.04;
    ref.current.rotation.x = bodyTilt;

    const pulse = highlight ? 1 + Math.sin(t * 4.5) * 0.08 : 1 + Math.sin(t * 2.6) * 0.02;
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
      heartRef.current.position.y = 0.95 + Math.sin(t * 2) * 0.08;
      heartRef.current.scale.setScalar(highlight ? 1.3 + Math.sin(t * 5) * 0.15 : 1);
    }
  });

  if (!visible) return null;
  const accent = String(cat.id).length % 2 ? '#ffdff1' : '#e9f4ff';

  return (
    <group ref={ref} position={[anchor[0], anchor[1], anchor[2]]} scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]}>
      {/* Halo en suelo */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={glowRef}>
        <circleGeometry args={[0.95, 32]} />
        <meshBasicMaterial color={highlight ? '#fff1b8' : '#cfe7ff'} transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={ringRef}>
        <ringGeometry args={[0.55, 0.9, 40]} />
        <meshBasicMaterial color={highlight ? '#ffe289' : '#c2dbff'} transparent opacity={0.4} toneMapped={false} />
      </mesh>

      {/* CUERPO */}
      <mesh castShadow>
        <sphereGeometry args={[0.36, 18, 18]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} emissive={highlight ? '#fff1b8' : '#000000'} emissiveIntensity={highlight ? 0.6 : 0} />
      </mesh>

      {/* CABEZA */}
      <mesh position={[0.33, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.29, 16, 16]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} emissive={highlight ? '#fff1b8' : '#000000'} emissiveIntensity={highlight ? 0.6 : 0} />
      </mesh>

      {/* OREJAS */}
      <mesh ref={earL} position={[0.43, 0.43, 0.14]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.11, 0.22, 10]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
      </mesh>
      <mesh ref={earR} position={[0.43, 0.43, -0.14]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.11, 0.22, 10]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.44, 0.43, 0.14]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.06, 0.12, 8]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[0.44, 0.43, -0.14]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.06, 0.12, 8]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* HOCICO */}
      <mesh position={[0.5, 0.23, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshToonMaterial color="#fff7ee" gradientMap={gradientMap} />
      </mesh>

      {/* OJOS */}
      <mesh position={[0.51, 0.31, 0.08]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.51, 0.31, -0.08]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.527, 0.34, 0.094]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0.527, 0.34, -0.066]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* NARIZ + BOCA */}
      <mesh position={[0.6, 0.24, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ff8eb8" />
      </mesh>
      <mesh position={[0.64, 0.2, 0]} rotation={[Math.PI, Math.PI / 2, 0]}>
        <torusGeometry args={[0.03, 0.004, 6, 10, Math.PI]} />
        <meshBasicMaterial color="#965672" />
      </mesh>

      {/* COLA */}
      <mesh ref={tailRef} position={[-0.52, 0.32, 0]} rotation={[0, 0.6, -0.55]} castShadow>
        <capsuleGeometry args={[0.048, 0.36, 4, 8]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
      </mesh>

      {/* PATITAS — 4 cilindros con anclas que rotan en X */}
      {/* Front-left */}
      <group ref={legFL} position={[0.18, -0.25, 0.22]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.24, 8]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        {/* Almohadilla */}
        <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 12]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>
      {/* Front-right */}
      <group ref={legFR} position={[0.18, -0.25, -0.22]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.24, 8]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 12]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>
      {/* Back-left */}
      <group ref={legBL} position={[-0.22, -0.25, 0.22]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.24, 8]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 12]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>
      {/* Back-right */}
      <group ref={legBR} position={[-0.22, -0.25, -0.22]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.24, 8]} />
          <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 12]} />
          <meshBasicMaterial color="#ff8eb8" />
        </mesh>
      </group>

      {/* Indicador corazón flotante */}
      <group ref={heartRef} position={[0, 0.95, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshBasicMaterial color={highlight ? '#ff8fb8' : '#ffb6d9'} transparent opacity={highlight ? 0.95 : 0.78} toneMapped={false} />
        </mesh>
      </group>

      {showDebugMarker && (
        <group position={[0, 0.94, 0]}>
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
