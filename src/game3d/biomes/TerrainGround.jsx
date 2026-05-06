import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Terreno circular con desplazamiento procedural y caminos visuales.
 * - radius: 120 (antes 80) — mapas más grandes
 * - amplitude: 0.7 (antes 0.4) — más relieve
 * - paths: ondulación de color hacia 2 direcciones (S y E) para simular caminos
 */
export default function TerrainGround({ color = '#9fcf86', pathColor = '#fbe9c4', radius = 120, amplitude = 0.7 }) {
  const geom = useMemo(() => {
    const g = new THREE.CircleGeometry(radius, 128);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const baseCol = new THREE.Color(color);
    const pathCol = new THREE.Color(pathColor);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      const flatMask = THREE.MathUtils.smoothstep(r, 6, 18);
      const noise =
        Math.sin(x * 0.12) * 0.55 +
        Math.cos(y * 0.16) * 0.4 +
        Math.sin((x + y) * 0.09) * 0.3;
      pos.setZ(i, noise * amplitude * flatMask);

      // Caminos: dos bandas curvadas con color más claro
      // Camino A: serpentea S->N (z varía con x)
      const pathACenter = Math.sin(y * 0.05) * 8;
      const distA = Math.abs(x - pathACenter);
      // Camino B: serpentea W->E
      const pathBCenter = Math.cos(x * 0.04) * 6;
      const distB = Math.abs(y - pathBCenter);

      const onPath = Math.min(distA, distB);
      const pathMask = 1 - THREE.MathUtils.smoothstep(onPath, 0.8, 2.2);
      const c = baseCol.clone().lerp(pathCol, pathMask * 0.7);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [radius, amplitude, color, pathColor]);

  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} flatShading />
    </mesh>
  );
}
