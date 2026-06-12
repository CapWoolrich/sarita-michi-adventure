/**
 * Accesorios geométricos ligeros por personaje.
 * Se renderizan tanto en el jugador local (CharacterSarita3D) como en el
 * remoto (RemotePlayer). Solo geometría simple, sin GLB ni luces.
 */
export default function CharacterAccessories({ characterId, scale = 1 }) {
  if (!characterId || characterId === 'sarita') return null;
  return (
    <group scale={scale}>
      {characterId === 'exploradora' && (
        <>
          {/* Mochila de aventura */}
          <group position={[0, 0.92, -0.3]}>
            <mesh castShadow>
              <boxGeometry args={[0.42, 0.52, 0.22]} />
              <meshStandardMaterial color="#8a5a3a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.04, -0.14]}>
              <boxGeometry args={[0.3, 0.28, 0.08]} />
              <meshStandardMaterial color="#ffd066" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.34, 8]} />
              <meshStandardMaterial color="#6a4a2a" roughness={0.85} />
            </mesh>
          </group>
          {/* Sombrero explorador */}
          <group position={[0, 1.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.44, 0.48, 0.06, 16]} />
              <meshStandardMaterial color="#c8a060" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.11, 0]}>
              <cylinderGeometry args={[0.26, 0.3, 0.22, 14]} />
              <meshStandardMaterial color="#b08a4a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.08, 0.28]}>
              <boxGeometry args={[0.5, 0.07, 0.04]} />
              <meshStandardMaterial color="#7ac985" roughness={0.6} />
            </mesh>
          </group>
        </>
      )}
      {characterId === 'guardiana-niebla' && (
        <>
          {/* Capa sombría */}
          <mesh position={[0, 0.82, -0.27]} rotation={[0.16, 0, 0]} castShadow>
            <boxGeometry args={[0.62, 0.98, 0.06]} />
            <meshStandardMaterial color="#2c2350" roughness={0.85} />
          </mesh>
          {/* Capucha */}
          <mesh position={[0, 1.34, -0.1]}>
            <sphereGeometry args={[0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#241c44" roughness={0.85} />
          </mesh>
          {/* Orbe de niebla flotante */}
          <mesh position={[0, 1.78, 0]}>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshBasicMaterial color="#b9a8ff" toneMapped={false} />
          </mesh>
        </>
      )}
      {characterId === 'runner-neon' && (
        <>
          {/* Visor neón */}
          <mesh position={[0, 1.38, 0.2]}>
            <boxGeometry args={[0.44, 0.1, 0.1]} />
            <meshBasicMaterial color="#00d4ff" toneMapped={false} />
          </mesh>
          {/* Aletas de velocidad en la espalda */}
          <mesh position={[-0.16, 0.92, -0.27]} rotation={[0.32, 0, -0.16]}>
            <boxGeometry args={[0.06, 0.52, 0.16]} />
            <meshBasicMaterial color="#ff66cc" toneMapped={false} />
          </mesh>
          <mesh position={[0.16, 0.92, -0.27]} rotation={[0.32, 0, 0.16]}>
            <boxGeometry args={[0.06, 0.52, 0.16]} />
            <meshBasicMaterial color="#00d4ff" toneMapped={false} />
          </mesh>
        </>
      )}
      {characterId === 'princesa-estelar' && (
        <>
          {/* Coronita */}
          <group position={[0, 1.52, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.045, 8, 18]} />
              <meshStandardMaterial color="#ffd066" metalness={0.5} roughness={0.3} />
            </mesh>
            {[-1, 0, 1].map((i) => (
              <mesh key={i} position={[Math.sin(i * 0.7) * 0.18, 0.1, Math.cos(i * 0.7) * 0.08]}>
                <coneGeometry args={[0.045, 0.15, 6]} />
                <meshStandardMaterial color="#ffd066" metalness={0.5} roughness={0.3} />
              </mesh>
            ))}
          </group>
          {/* Estrellita flotante */}
          <mesh position={[0.32, 1.72, 0]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshBasicMaterial color="#ffe9b5" toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}
