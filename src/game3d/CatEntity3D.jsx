import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const BASE_SCALE = 1.95;

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

export default function CatEntity3D({ cat, visible, highlight = false, showDebugMarker = false, distance = null }) {
  const ref = useRef();
  const tailRef = useRef();
  const earL = useRef();
  const earR = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  const heartRef = useRef();
  const gradientMap = useToonGradient();

  const anchor = cat.anchor ?? [cat.x, cat.y ?? 0.95, cat.z];
  const wanderRadius = cat.wanderRadius ?? 1.6;
  const speed = cat.speed ?? 0.5;
  const phase = cat.phase ?? 0;

  useFrame(({ clock }) => {
    if (!ref.current || !visible) return;
    const t = clock.getElapsedTime() + phase;

    // Wander en figura-8 (Lissajous)
    const wx = Math.sin(t * speed * 0.7) * wanderRadius;
    const wz = Math.sin(t * speed * 1.4) * wanderRadius * 0.7;
    ref.current.position.x = anchor[0] + wx;
    ref.current.position.z = anchor[2] + wz;
    ref.current.position.y = anchor[1] + Math.sin(t * 2.4) * 0.13;

    // Mira hacia donde se mueve
    const tNext = t + 0.05;
    const wxNext = Math.sin(tNext * speed * 0.7) * wanderRadius;
    const wzNext = Math.sin(tNext * speed * 1.4) * wanderRadius * 0.7;
    const dx = wxNext - wx;
    const dz = wzNext - wz;
    if (Math.hypot(dx, dz) > 0.001) {
      const target = Math.atan2(dx, dz) - Math.PI / 2;
      let diff = target - ref.current.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      ref.current.rotation.y += diff * 0.08;
    }

    if (tailRef.current) tailRef.current.rotation.y = 0.6 + Math.sin(t * 3.4) * 0.45;
    if (earL.current) earL.current.rotation.z = 0.25 + Math.sin(t * 2.5) * 0.06;
    if (earR.current) earR.current.rotation.z = -0.25 - Math.sin(t * 2.5) * 0.06;

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
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={glowRef}>
        <circleGeometry args={[0.95, 32]} />
        <meshBasicMaterial color={highlight ? '#fff1b8' : '#cfe7ff'} transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={ringRef}>
        <ringGeometry args={[0.55, 0.9, 40]} />
        <meshBasicMaterial color={highlight ? '#ffe289' : '#c2dbff'} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh castShadow>
        <sphereGeometry args={[0.36, 18, 18]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} emissive={highlight ? '#fff1b8' : '#000000'} emissiveIntensity={highlight ? 0.6 : 0} />
      </mesh>
      <mesh position={[0.33, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.29, 16, 16]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} emissive={highlight ? '#fff1b8' : '#000000'} emissiveIntensity={highlight ? 0.6 : 0} />
      </mesh>
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
      <mesh position={[0.5, 0.23, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshToonMaterial color="#fff7ee" gradientMap={gradientMap} />
      </mesh>
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
      <mesh position={[0.6, 0.24, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ff8eb8" />
      </mesh>
      <mesh position={[0.64, 0.2, 0]} rotation={[Math.PI, Math.PI / 2, 0]}>
        <torusGeometry args={[0.03, 0.004, 6, 10, Math.PI]} />
        <meshBasicMaterial color="#965672" />
      </mesh>
      <mesh ref={tailRef} position={[-0.52, 0.32, 0]} rotation={[0, 0.6, -0.55]} castShadow>
        <capsuleGeometry args={[0.048, 0.36, 4, 8]} />
        <meshToonMaterial color={cat.color} gradientMap={gradientMap} />
      </mesh>
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
