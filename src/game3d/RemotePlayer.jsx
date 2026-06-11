import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Nameplate barato: canvas → CanvasTexture → sprite (sin drei Html ni fuentes externas). */
function useNameTexture(name) {
  const texture = useMemo(() => {
    if (!name) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = 'rgba(24, 18, 48, 0.62)';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(6, 8, 244, 48, 22);
      ctx.fill();
    } else {
      ctx.fillRect(6, 8, 244, 48);
    }
    ctx.font = '700 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(name).slice(0, 16), 128, 34);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    return tex;
  }, [name]);
  useEffect(() => () => texture?.dispose?.(), [texture]);
  return texture;
}

/**
 * Renderizado de un jugador remoto en la escena 3D.
 * Chibi simple con colores sincronizados (outfit/gorra del peer),
 * nombre flotante y bob de carrera cuando anim === 'run'.
 */
export default function RemotePlayer({
  peerId,
  name,
  color = '#ffd6c5',
  outfitColor = '#c084fc',
  hatColor = null,
  anim = 'idle',
  position,
  rotation = 0
}) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const lastPosRef = useRef({ x: position?.x ?? 0, z: position?.z ?? 0, ry: rotation });
  const nameTexture = useNameTexture(name);
  const accentColor = hatColor || color;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Lerp suave hacia la posición remota (smoothing)
    const target = position ?? lastPosRef.current;
    lastPosRef.current.x = THREE.MathUtils.lerp(lastPosRef.current.x, target.x ?? 0, 0.15);
    lastPosRef.current.z = THREE.MathUtils.lerp(lastPosRef.current.z, target.z ?? 0, 0.15);
    lastPosRef.current.ry = THREE.MathUtils.lerp(lastPosRef.current.ry, rotation ?? 0, 0.15);
    groupRef.current.position.set(lastPosRef.current.x, 0.5, lastPosRef.current.z);
    groupRef.current.rotation.y = lastPosRef.current.ry;
    if (bodyRef.current) {
      const t = clock.getElapsedTime();
      bodyRef.current.position.y = anim === 'run' ? Math.abs(Math.sin(t * 9)) * 0.09 : 0;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* Cuerpo simple */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.32, 0.6, 6, 12]} />
          <meshStandardMaterial color={outfitColor} roughness={0.6} />
        </mesh>
        {/* Cabeza */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.36, 16, 14]} />
          <meshStandardMaterial color="#ffd9c0" roughness={0.7} />
        </mesh>
        {/* Pelo */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <sphereGeometry args={[0.4, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#5a3a2a" roughness={0.9} />
        </mesh>
        {/* Ojos */}
        <mesh position={[0.13, 0.7, 0.32]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[-0.13, 0.7, 0.32]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>
        {/* Gorra/lazo con color sincronizado del peer */}
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} />
        </mesh>
      </group>
      {/* Anillo de jugador remoto en suelo */}
      <mesh position={[0, -0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 24]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      {/* Nombre flotante */}
      {nameTexture && (
        <sprite position={[0, 1.75, 0]} scale={[1.7, 0.42, 1]}>
          <spriteMaterial map={nameTexture} transparent depthWrite={false} />
        </sprite>
      )}
    </group>
  );
}
