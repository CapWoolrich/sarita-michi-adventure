import { useMemo } from 'react';
import * as THREE from 'three';
import { BIOMES } from './biomes/index.jsx';
import FallingAmbience from './biomes/FallingAmbience.jsx';
import TerrainGround from './biomes/TerrainGround.jsx';
import SkyFauna from './biomes/SkyFauna.jsx';
import BackgroundMountains from './biomes/BackgroundMountains.jsx';

const THEMES = {
  'mystic-forest':   { skyTop:'#a8d6ff', skyBot:'#fdf3d0', sun:'#fff1c2', fog:'#e8f6dd', ground:'#7fc56b', pathColor:'#fbe9c4', accent:'#ffd7ec', ambient:0.45, sunIntensity:1.4 },
  'sakura-city':     { skyTop:'#ffc5e0', skyBot:'#fff0f7', sun:'#ffe4f1', fog:'#fcdcec', ground:'#e2c7bb', pathColor:'#fff5e8', accent:'#ff9bc8', ambient:0.55, sunIntensity:1.2 },
  'crystal-lake':    { skyTop:'#bfe6ff', skyBot:'#eafaff', sun:'#e5f7ff', fog:'#dff2fb', ground:'#a8d4b6', pathColor:'#fff7d4', accent:'#9be8ff', ambient:0.55, sunIntensity:1.1 },
  'mist-grove':      { skyTop:'#9fadab', skyBot:'#cad6cf', sun:'#dde7e3', fog:'#bcc8c2', ground:'#7c9080', pathColor:'#bcc8c2', accent:'#a0c0a0', ambient:0.35, sunIntensity:0.7 },
  'pastel-port':     { skyTop:'#ffd7b8', skyBot:'#fff3e3', sun:'#ffe4c4', fog:'#ffe6d2', ground:'#dac8b6', pathColor:'#fff5e0', accent:'#ffb38b', ambient:0.55, sunIntensity:1.3 },
  'cloud-valley':    { skyTop:'#cfe2ff', skyBot:'#f4f8ff', sun:'#fff7e1', fog:'#e6efff', ground:'#cad8c8', pathColor:'#ffffff', accent:'#a8c8ff', ambient:0.6, sunIntensity:1.1 },
  'moon-garden':     { skyTop:'#0f1438', skyBot:'#3a437a', sun:'#aab4ff', fog:'#3a437a', ground:'#3d4170', pathColor:'#5a5d8d', accent:'#ffd6f5', ambient:0.18, sunIntensity:0.45 },
  'cotton-beach':    { skyTop:'#9fdcff', skyBot:'#fff2c4', sun:'#fff2c4', fog:'#d2effc', ground:'#f1d7af', pathColor:'#fff5d4', accent:'#ffd29b', ambient:0.55, sunIntensity:1.3 },
  'aurora-mountain': { skyTop:'#0d1438', skyBot:'#283d68', sun:'#cfe7ff', fog:'#2c4068', ground:'#7a8b95', pathColor:'#a8b8c8', accent:'#7affd1', ambient:0.22, sunIntensity:0.6 },
  'stellar-village': { skyTop:'#0a0828', skyBot:'#3b2f6a', sun:'#ffe9b5', fog:'#3b2f6a', ground:'#3d3460', pathColor:'#5d527a', accent:'#ffd6a5', ambient:0.18, sunIntensity:0.55 },
  'neon-city':       { skyTop:'#1a0838', skyBot:'#5d2a78', sun:'#ff8fee', fog:'#3a1858', ground:'#1f1a35', pathColor:'#3d2858', accent:'#ff66cc', ambient:0.25, sunIntensity:0.5 }
};

function SkyDome({ top, bot }) {
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(720, 32, 16);
    const colors = [];
    const c1 = new THREE.Color(top);
    const c2 = new THREE.Color(bot);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = THREE.MathUtils.clamp((y + 360) / 720, 0, 1);
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
      <color attach="background" args={[theme.skyBot]} />
      <fog attach="fog" args={[theme.fog, 80, 380]} />
      <SkyDome top={theme.skyTop} bot={theme.skyBot} />

      <ambientLight intensity={theme.ambient} color="#ffffff" />
      <hemisphereLight args={['#ffffff', theme.ground, 0.5]} />
      <directionalLight
        position={[16, 28, 12]}
        intensity={theme.sunIntensity}
        color={theme.sun}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0008}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[-12, 10, -8]} intensity={0.3} color="#cfe4ff" />
      <directionalLight position={[0, 5, -18]} intensity={0.45} color={theme.accent} />

      <TerrainGround color={theme.ground} pathColor={theme.pathColor} radius={320} />
      <BackgroundMountains biome={worldTheme} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[3.5, 32, 64]} />
        <meshStandardMaterial color={theme.pathColor} transparent opacity={0.4} roughness={0.9} />
      </mesh>

      <Biome />
      <FallingAmbience biome={worldTheme} />
      <SkyFauna biome={worldTheme} />
    </>
  );
}
