import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Casa que se vuelve semi-transparente cuando el jugador está cerca,
 * revelando un michi escondido adentro.
 *
 * Estilos: 'sakura' | 'port' | 'stellar' | 'neon'
 *
 * Props:
 *   position: [x,y,z]
 *   bodyColor / roofColor
 *   playerPositionRef: { current: { x,z } }
 *   hiddenCat: { color, name } o null
 *   onPeek: callback cuando el jugador se acerca lo suficiente para ver al michi
 */
export default function TranslucentHouse({
  position = [0, 0, 0],
  bodyColor = '#fff8ec',
  roofColor = '#3a2a2a',
  style = 'sakura',
  playerPositionRef,
  hiddenCat = null,
  rotation = [0, 0, 0],
  scale = 1
}) {
  const groupRef = useRef();
  const bodyMatRef = useRef();
  const roofMatRef = useRef();
  const catGroupRef = useRef();
  const opacityRef = useRef(1);

  useFrame(() => {
    if (!groupRef.current || !playerPositionRef?.current) return;
    const p = playerPositionRef.current;
    const dx = position[0] - p.x;
    const dz = position[2] - p.z;
    const dist = Math.hypot(dx, dz);

    // Lejos (>10m): opaco
    // Cerca (3-10m): transparencia gradual
    // Muy cerca (<3m): casi invisible (revealing cat)
    let targetOpacity = 1;
    if (dist < 10) {
      targetOpacity = THREE.MathUtils.clamp((dist - 3) / 7, 0.25, 1);
    }
    // Lerp suave
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOpacity, 0.12);

    if (bodyMatRef.current) {
      bodyMatRef.current.opacity = opacityRef.current;
      bodyMatRef.current.transparent = true;
    }
    if (roofMatRef.current) {
      roofMatRef.current.opacity = Math.min(1, opacityRef.current * 1.1);
      roofMatRef.current.transparent = true;
    }
    // Cat adentro flota
    if (catGroupRef.current && hiddenCat) {
      const t = Date.now() * 0.002;
      catGroupRef.current.position.y = 0.5 + Math.sin(t) * 0.08;
      catGroupRef.current.rotation.y = Math.sin(t * 0.5) * 0.4;
    }
  });

  // Configuración por estilo
  const config = useMemo(() => {
    switch (style) {
      case 'port':
        return { width: 2.8, height: 2.0, depth: 2.5, roofType: 'pyramid', roofH: 1.4, roofR: 2.0 };
      case 'stellar':
        return { width: 2.4, height: 1.8, depth: 2.2, roofType: 'pyramid', roofH: 1.0, roofR: 1.9 };
      case 'neon':
        return { width: 3.0, height: 4.0, depth: 3.0, roofType: 'flat', roofH: 0.3, roofR: 0 };
      case 'sakura':
      default:
        return { width: 3.0, height: 2.0, depth: 2.5, roofType: 'pyramid', roofH: 1.2, roofR: 2.4 };
    }
  }, [style]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Cuerpo */}
      <mesh position={[0, config.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width, config.height, config.depth]} />
        <meshStandardMaterial ref={bodyMatRef} color={bodyColor} roughness={0.85} />
      </mesh>
      {/* Techo */}
      {config.roofType === 'pyramid' ? (
        <mesh position={[0, config.height + config.roofH / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[config.roofR, config.roofH, 4]} />
          <meshStandardMaterial ref={roofMatRef} color={roofColor} roughness={0.7} />
        </mesh>
      ) : (
        <mesh position={[0, config.height + config.roofH / 2, 0]} castShadow>
          <boxGeometry args={[config.width * 1.1, config.roofH, config.depth * 1.1]} />
          <meshStandardMaterial ref={roofMatRef} color={roofColor} roughness={0.7} />
        </mesh>
      )}

      {/* Puerta */}
      <mesh position={[0, 0.6, config.depth / 2 + 0.01]}>
        <planeGeometry args={[0.7, 1.2]} />
        <meshBasicMaterial color="#3a2a2a" />
      </mesh>
      {/* Ventana iluminada */}
      <mesh position={[config.width * 0.3, 1.4, config.depth / 2 + 0.01]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial color="#ffe8a0" toneMapped={false} />
      </mesh>

      {/* Michi escondido adentro (visible cuando casa es translúcida) */}
      {hiddenCat && (
        <group ref={catGroupRef} position={[0, 0.5, 0]}>
          {/* Mini-michi básico (igual al CatEntity3D pero estático) */}
          <mesh castShadow>
            <sphereGeometry args={[0.32, 14, 12]} />
            <meshStandardMaterial color={hiddenCat.color} emissive={hiddenCat.color} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0.18, 0.18, 0]} castShadow>
            <sphereGeometry args={[0.26, 12, 10]} />
            <meshStandardMaterial color={hiddenCat.color} emissive={hiddenCat.color} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0.05, 0.4, 0.13]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.1, 0.18, 8]} />
            <meshStandardMaterial color={hiddenCat.color} />
          </mesh>
          <mesh position={[0.05, 0.4, -0.13]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.1, 0.18, 8]} />
            <meshStandardMaterial color={hiddenCat.color} />
          </mesh>
          {/* Ojos */}
          <mesh position={[0.3, 0.22, 0.08]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[0.3, 0.22, -0.08]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>
          {/* Heart flotante "encontré algo" */}
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshBasicMaterial color="#ffb6d9" transparent opacity={0.85} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}
