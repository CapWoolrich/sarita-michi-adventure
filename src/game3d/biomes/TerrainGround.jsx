import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Terreno PLANO en zona jugable (radio 0..60). El doble de tamaño que antes.
 * Caminos visuales serpentean; relieve sutil decorativo solo en banda 60..90.
 */
export default function TerrainGround({ color = '#9fcf86', pathColor = '#fbe9c4', radius = 320 }) {
  const geom = useMemo(() => {
    const g = new THREE.CircleGeometry(radius, 160);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const baseCol = new THREE.Color(color);
    const pathCol = new THREE.Color(pathColor);
    const peakCol = baseCol.clone().lerp(new THREE.Color('#ffffff'), 0.25);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);

      // Zona jugable plana: radio 0..60 (antes 0..30)
      const playableMask = THREE.MathUtils.smoothstep(r, 130, 180);
      const noise = Math.sin(x * 0.03) * 0.6 + Math.cos(y * 0.038) * 0.5;
      const h = noise * playableMask * 1.5;
      pos.setZ(i, h);

      // Caminos centrales serpenteantes - cubren más territorio
      const pathFactor = 1 - playableMask;
      const pathACenter = Math.sin(y * 0.012) * 28;
      const distA = Math.abs(x - pathACenter);
      const pathBCenter = Math.cos(x * 0.01) * 24;
      const distB = Math.abs(y - pathBCenter);
      const onPath = Math.min(distA, distB);
      const pathMask = (1 - THREE.MathUtils.smoothstep(onPath, 2.5, 7.0)) * pathFactor;

      const heightTint = THREE.MathUtils.clamp(h / 2, 0, 1);
      let c = baseCol.clone().lerp(peakCol, heightTint * 0.35);
      c = c.lerp(pathCol, pathMask * 0.7);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [radius, color, pathColor]);

  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} flatShading />
    </mesh>
  );
}
