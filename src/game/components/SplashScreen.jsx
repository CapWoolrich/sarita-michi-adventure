import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { PineTree, SakuraTree, FlowerScatter, GrassPatches } from '../../game3d/biomes/primitives.jsx';

/**
 * Mini escena 3D para splash — Sarita estática + 3 michis flotando.
 * Cámara animada (rotación lenta) + sparkles dorados.
 */

function FloatingCat({ position, color, phase = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.18;
    ref.current.rotation.y = Math.sin(t * 0.8) * 0.15;
  });
  const gradientMap = useMemo(() => {
    const data = new Uint8Array([60, 130, 200, 255]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
  return (
    <group ref={ref} position={position} scale={1.4}>
      <mesh castShadow>
        <sphereGeometry args={[0.36, 18, 18]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.29, 16, 16]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.16, 0.65, 0.14]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.11, 0.22, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.16, 0.65, -0.14]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.11, 0.22, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 0.4, 0.28]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.18, 0.4, 0.22]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.09, 0.32, 0.34]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ff8eb8" />
      </mesh>
    </group>
  );
}

function MagicSparkles({ count = 36 }) {
  const ref = useRef();
  const positions = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 16,
      y: 1 + Math.random() * 5,
      z: (Math.random() - 0.5) * 8,
      phase: Math.random() * Math.PI * 2,
      color: i % 3 === 0 ? '#ffe66b' : i % 3 === 1 ? '#ff8fb8' : '#ffffff'
    })),
    [count]
  );
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((mesh, i) => {
      const p = positions[i];
      mesh.position.y = p.y + Math.sin(t * 1.2 + p.phase) * 0.5;
      if (mesh.material) {
        mesh.material.opacity = 0.5 + Math.sin(t * 2 + p.phase) * 0.4;
      }
    });
  });
  return (
    <group ref={ref}>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function CameraOrbit() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const r = 9;
    camera.position.x = Math.sin(t * 0.12) * r;
    camera.position.z = 6 + Math.cos(t * 0.12) * 1.5;
    camera.position.y = 3.2;
    camera.lookAt(0, 1.4, 0);
  });
  return null;
}

function SplashScene() {
  return (
    <>
      <CameraOrbit />
      <color attach="background" args={['#fff0fa']} />
      <fog attach="fog" args={['#ffe5f4', 12, 30]} />

      {/* Cielo gradient mediante esfera invertida */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[60, 24, 16]} />
        <meshBasicMaterial color="#fff0fa" side={THREE.BackSide} fog={false} />
      </mesh>

      <ambientLight intensity={0.7} color="#fff5fa" />
      <hemisphereLight args={['#ffffff', '#ffd4e8', 0.6]} />
      <directionalLight position={[8, 12, 6]} intensity={1.4} color="#fff5e0" castShadow />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#ffc8e3" />

      {/* Suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#a8d997" roughness={0.95} />
      </mesh>

      {/* Sakuras + pinos en fondo */}
      <SakuraTree position={[-5, 0, -2]} scale={1.2} />
      <SakuraTree position={[5, 0, -1]} scale={1.0} />
      <SakuraTree position={[-7, 0, 1]} scale={0.9} />
      <PineTree position={[7, 0, 0]} scale={1.1} color="#7ac985" />
      <PineTree position={[-3, 0, -5]} scale={0.9} color="#5fa667" />

      <FlowerScatter count={50} area={10} palette={['#ff9bc8', '#ffe39b', '#dab2ff', '#ffb6d0']} />
      <GrassPatches count={80} area={12} color="#8dc66b" />

      {/* 3 michis en el centro */}
      <FloatingCat position={[-1.2, 1.0, 1]} color="#ffe28d" phase={0} />
      <FloatingCat position={[0.2, 1.0, 1.4]} color="#f7f7ff" phase={1.2} />
      <FloatingCat position={[1.6, 1.0, 1] } color="#ffd6c5" phase={2.4} />

      <MagicSparkles count={50} />
    </>
  );
}

export default function SplashScreen({ onStart, onContinue, onCollection, onHowToPlay, onCredits, onAchievements, hasProgress = false }) {
  return (
    <div className="kw-splash" data-game-ui="true">
      <div className="kw-splash-canvas">
        <Canvas camera={{ fov: 45, near: 0.1, far: 80 }} shadows>
          <Suspense fallback={null}>
            <SplashScene />
          </Suspense>
        </Canvas>
      </div>
      <div className="kw-splash-overlay">
        <div className="kw-splash-title">
          <h1>
            <span className="kw-splash-line1">Sarita</span>
            <span className="kw-splash-line2">y los michi perdidos</span>
          </h1>
          <p className="kw-splash-tagline">Una aventura mágica para rescatar gatitos perdidos</p>
        </div>
        <div className="kw-splash-actions">
          <button className="kw-splash-primary" onClick={onStart}>
            <span className="kw-splash-wand">🪄</span>
            Comenzar aventura
          </button>
          <div className="kw-splash-secondary-row">
            {hasProgress && (
              <button className="kw-splash-btn" onClick={onContinue}>
                <span aria-hidden>📖</span> Continuar
              </button>
            )}
            <button className="kw-splash-btn" onClick={onCollection}>
              <span aria-hidden>🧺</span> Colección
            </button>
          </div>
          <div className="kw-splash-secondary-row">
            <button className="kw-splash-btn kw-splash-btn-sm" onClick={onHowToPlay}>
              <span aria-hidden>💡</span> Cómo jugar
            </button>
            <button className="kw-splash-btn kw-splash-btn-sm" onClick={onCredits}>
              <span aria-hidden>🎨</span> Créditos
            </button>
            <button className="kw-splash-btn kw-splash-btn-sm" onClick={onAchievements}>
              <span aria-hidden>🏆</span> Logros
            </button>
          </div>
        </div>
        <div className="kw-splash-footer">Creado por Bernard y Sarita</div>
      </div>
    </div>
  );
}
