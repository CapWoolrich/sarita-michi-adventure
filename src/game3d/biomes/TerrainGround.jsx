import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Terreno PLANO en zona jugable (radio 0..30) — los gatos, Sarita y todos los
 * props se posicionan a Y=0 y caminan sobre superficie sin hundirse.
 *
 * Solo aplica relieve sutil DECORATIVO en la banda externa (radio 30..50)
 * que es donde no camina nadie. Las montañas grandes ahora son meshes
 * separados en BackgroundMountains.
 */
export default function TerrainGround({ color = '#9fcf86', pathColor = '#fbe9c4', radius = 80 }) {
  const geom = useMemo(() => {
    const g = new THREE.CircleGeometry(radius, 128);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const baseCol = new THREE.Color(color);
    const pathCol = new THREE.Color(pathColor);
    const peakCol = baseCol.clone().lerp(new THREE.Color('#ffffff'), 0.25);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);

      // Zona jugable (r < 30): perfectamente plana
      // Zona de transición (30..50): relieve creciente, decorativo
      // Zona externa (50+): pendiente sutil hacia las montañas de fondo
      const playableMask = THREE.MathUtils.smoothstep(r, 30, 45);
      const noise = Math.sin(x * 0.12) * 0.5 + Math.cos(y * 0.15) * 0.4;
      const h = noise * playableMask * 1.2;
      pos.setZ(i, h);

      // Caminos solo dentro de la zona jugable (más visibles ahí)
      const pathFactor = 1 - playableMask;
      const pathACenter = Math.sin(y * 0.05) * 8;
      const distA = Math.abs(x - pathACenter);
      const pathBCenter = Math.cos(x * 0.04) * 6;
      const distB = Math.abs(y - pathBCenter);
      const onPath = Math.min(distA, distB);
      const pathMask = (1 - THREE.MathUtils.smoothstep(onPath, 0.8, 2.2)) * pathFactor;

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
