import { useMemo } from 'react';
import * as THREE from 'three';
import { BIOMES } from './biomes/index.jsx';
import FallingAmbience from './biomes/FallingAmbience.jsx';
import TerrainGround from './biomes/TerrainGround.jsx';

/**
 * THEMES — paleta + iluminación por mundo.
 * skyTop/skyBot: gradient del SkyDome
 * sun: color de la directional key
 * fog: color de la niebla
 * ground: color del terreno
 * accent: color del rim light
 * ambient: intensity de luz ambiente (0..1)
 * sunIntensity: intensidad del key light
 */
const THEMES = {
  'mystic-forest':   { skyTop:'#a8d6ff', skyBot:'#fdf3d0', sun:'#fff1c2', fog:'#e8f6dd', ground:'#7fc56b', accent:'#ffd7ec', ambient:0.45, sunIntensity:1.4 },
  'sakura-city':     { skyTop:'#ffc5e0', skyBot:'#fff0f7', sun:'#ffe4f1', fog:'#fcdcec', ground:'#e2c7bb', accent:'#ff9bc8', ambient:0.55, sunIntensity:1.2 },
  'crystal-lake':    { skyTop:'#bfe6ff', skyBot:'#eafaff', sun:'#e5f7ff', fog:'#dff2fb', ground:'#a8d4b6', accent:'#9be8ff', ambient:0.55, sunIntensity:1.1 },
  'mist-grove':      { skyTop:'#9fadab', skyBot:'#cad6cf', sun:'#dde7e3', fog:'#bcc8c2', ground:'#7c9080', accent:'#a0c0a0', ambient:0.35, sunIntensity:0.7 },
  'pastel-port':     { skyTop:'#ffd7b8', skyBot:'#fff3e3', sun:'#ffe4c4', fog:'#ffe6d2', ground:'#dac8b6', accent:'#ffb38b', ambient:0.55, sunIntensity:1.3 },
  'cloud-valley':    { skyTop:'#cfe2ff', skyBot:'#f4f8ff', sun:'#fff7e1', fog:'#e6efff', ground:'#cad8c8', accent:'#a8c8ff', ambient:0.6, sunIntensity:1.1 },
  'moon-garden':     { skyTop:'#0f1438', skyBot:'#3a437a', sun:'#aab4ff', fog:'#3a437a', ground:'#3d4170', accent:'#ffd6f5', ambient:0.18, sunIntensity:0.45 },
  'cotton-beach':    { skyTop:'#9fdcff', skyBot:'#fff2c4', sun:'#fff2c4', fog:'#d2effc', ground:'#f1d7af', accent:'#ffd29b', ambient:0.55, sunIntensity:1.3 },
  'aurora-mountain': { skyTop:'#0d1438', skyBot:'#283d68', sun:'#cfe7ff', fog:'#2c4068', ground:'#7a8b95', accent:'#7affd1', ambient:0.22, sunIntensity:0.6 },
  'stellar-village': { skyTop:'#0a0828', skyBot:'#3b2f6a', sun:'#ffe9b5', fog:'#3b2f6a', ground:'#3d3460', accent:'#ffd6a5', ambient:0.18, sunIntensity:0.55 }
};

/* Sky gradient via inverted sphere with vertex colors. */
function SkyDome({ top, bot }) {
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(180, 32, 16);
    const colors = [];
    const c1 = new THREE.Color(top);
    const c2 = new THREE.Color(bot);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = THREE.MathUtils.clamp((y + 100) / 200, 0, 1);
      const c = c2.clone().lerp(c1, t);
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, [top, bot]);
  return (
    <mesh geometry={geom} scale={[-1, 1, 1]} renderOrder={-1}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

export default function WorldScene({ worldTheme = 'mystic-forest' }) {
  const theme = THEMES[worldTheme] ?? THEMES['mystic-forest'];
  const Biome = BIOMES[worldTheme] ?? BIOMES['mystic-forest'];

  return (
    <>
      {/* Background + atmospheric fog */}
      <color attach="background" args={[theme.skyBot]} />
      <fog attach="fog" args={[theme.fog, 16, 78]} />
      <SkyDome top={theme.skyTop} bot={theme.skyBot} />

      {/* === LIGHTING (3-point per-biome) === */}
      <ambientLight intensity={theme.ambient} color="#ffffff" />
      <hemisphereLight args={['#ffffff', theme.ground, 0.5]} />
      {/* Key light — sun */}
      <directionalLight
        position={[12, 22, 8]}
        intensity={theme.sunIntensity}
        color={theme.sun}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0008}
        shadow-normalBias={0.04}
      />
      {/* Fill */}
      <directionalLight position={[-10, 8, -6]} intensity={0.3} color="#cfe4ff" />
      {/* Rim — separa personajes del fondo */}
      <directionalLight position={[0, 4, -14]} intensity={0.45} color={theme.accent} />

      {/* === TERRAIN === */}
      <TerrainGround color={theme.ground} />

      {/* Soft path ring around player spawn (siempre visible, brújula visual) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[3.5, 16, 64]} />
        <meshStandardMaterial color="#fbe9c4" transparent opacity={0.4} roughness={0.9} />
      </mesh>

      {/* === BIOMA ESPECÍFICO === */}
      <Biome />

      {/* === PARTÍCULAS ATMOSFÉRICAS DEL BIOMA === */}
      <FallingAmbience biome={worldTheme} />
    </>
  );
}
