import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Terreno con relieve PRONUNCIADO + colinas de fondo.
 *  - Inner (r 0..18): plano cerca del spawn, relieve sutil
 *  - Mid (r 18..50): colinas medianas con noise multi-frecuencia
 *  - Outer (r 50..120): montañas grandes que forman el horizonte
 */
export default function TerrainGround({ color = '#9fcf86', pathColor = '#fbe9c4', radius = 120 }) {
  const geom = useMemo(() => {
    const g = new THREE.CircleGeometry(radius, 160);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const baseCol = new THREE.Color(color);
    const pathCol = new THREE.Color(pathColor);
    const peakCol = baseCol.clone().lerp(new THREE.Color('#ffffff'), 0.35);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);

      // Mascara plana central (radio 6..14 transición)
      const flatMask = THREE.MathUtils.smoothstep(r, 6, 14);
      // Banda media: relieve más fuerte
      const midMask = THREE.MathUtils.smoothstep(r, 14, 35);
      // Banda externa: montañas
      const farMask = THREE.MathUtils.smoothstep(r, 35, 90);

      // Multi-octave noise determinista
      const n1 = Math.sin(x * 0.18) * Math.cos(y * 0.16);
      const n2 = Math.sin(x * 0.07 + y * 0.05) * 1.4;
      const n3 = Math.sin(x * 0.03 + y * 0.04) * 2.6;

      // Altura compuesta
      let h = 0;
      h += n1 * 0.4 * flatMask;
      h += n2 * 1.2 * midMask;
      h += (n3 * 4 + Math.abs(Math.sin(x * 0.025) + Math.cos(y * 0.025)) * 5) * farMask;

      pos.setZ(i, h);

      // Caminos centrales serpenteantes
      const pathACenter = Math.sin(y * 0.05) * 8;
      const distA = Math.abs(x - pathACenter);
      const pathBCenter = Math.cos(x * 0.04) * 6;
      const distB = Math.abs(y - pathBCenter);
      const onPath = Math.min(distA, distB);
      const pathMask = (1 - THREE.MathUtils.smoothstep(onPath, 0.8, 2.2)) * (1 - midMask);

      // Tinte por altura: picos más claros
      const heightTint = THREE.MathUtils.clamp(h / 8, 0, 1);
      let c = baseCol.clone().lerp(peakCol, heightTint * 0.55);
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
