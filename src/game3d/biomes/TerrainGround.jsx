import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Terreno circular con desplazamiento procedural suave (sin/cos noise).
 * No afecta la colisión del juego (los michis se posicionan por su Y propio),
 * solo aporta relieve visual estilizado.
 */
export default function TerrainGround({ color = '#9fcf86', radius = 80, amplitude = 0.4 }) {
  const geom = useMemo(() => {
    const g = new THREE.CircleGeometry(radius, 96);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      // Mantener completamente plano cerca del spawn (radio < 6)
      const flatMask = THREE.MathUtils.smoothstep(r, 6, 14);
      const noise =
        Math.sin(x * 0.18) * 0.5 +
        Math.cos(y * 0.22) * 0.4 +
        Math.sin((x + y) * 0.11) * 0.3;
      pos.setZ(i, noise * amplitude * flatMask);
    }
    g.computeVertexNormals();
    return g;
  }, [radius, amplitude]);

  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} flatShading />
    </mesh>
  );
}
