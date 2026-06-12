import InteractiveProp from './InteractiveProp';
import { ChestProp } from './PremiumWorldProps';

/**
 * Interior funcional "estilo dollhouse": paredes bajas para que la cámara
 * en tercera persona nunca quede ocluida (sin colisiones de cámara).
 * Vive en una esquina lejana del mapa (dentro del clamp ±110 de movimiento)
 * y se entra/sale por teleport.
 */
export default function HouseInteriorLite({
  id,
  position = [0, 0, 0],
  accent = '#ff9bc8',
  exitTarget = [0, 0],
  questChest = false,
  chestCoins = 14,
  playerPositionRef,
  requestTeleport,
  onPropInteract,
  openedChestsRef
}) {
  const [x, , z] = position;

  return (
    <>
      <group position={position}>
        {/* Piso */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[8.4, 0.12, 8.4]} />
          <meshStandardMaterial color="#e8cdb0" roughness={0.85} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0.4]}>
          <circleGeometry args={[2.1, 24]} />
          <meshStandardMaterial color={accent} roughness={0.8} />
        </mesh>
        {/* Paredes bajas (dollhouse) */}
        <mesh position={[0, 0.62, -4.1]} castShadow>
          <boxGeometry args={[8.4, 1.15, 0.22]} />
          <meshStandardMaterial color="#fff3e6" roughness={0.85} />
        </mesh>
        <mesh position={[-4.1, 0.62, 0]} castShadow>
          <boxGeometry args={[0.22, 1.15, 8.4]} />
          <meshStandardMaterial color="#fff3e6" roughness={0.85} />
        </mesh>
        <mesh position={[4.1, 0.62, 0]} castShadow>
          <boxGeometry args={[0.22, 1.15, 8.4]} />
          <meshStandardMaterial color="#fff3e6" roughness={0.85} />
        </mesh>
        {/* Frente con hueco de puerta */}
        <mesh position={[-2.75, 0.62, 4.1]} castShadow>
          <boxGeometry args={[2.9, 1.15, 0.22]} />
          <meshStandardMaterial color="#fff3e6" roughness={0.85} />
        </mesh>
        <mesh position={[2.75, 0.62, 4.1]} castShadow>
          <boxGeometry args={[2.9, 1.15, 0.22]} />
          <meshStandardMaterial color="#fff3e6" roughness={0.85} />
        </mesh>
        {/* Marco de puerta */}
        <mesh position={[-1.3, 1.05, 4.1]}>
          <boxGeometry args={[0.18, 2.1, 0.26]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
        <mesh position={[1.3, 1.05, 4.1]}>
          <boxGeometry args={[0.18, 2.1, 0.26]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.12, 4.1]}>
          <boxGeometry args={[2.78, 0.18, 0.26]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
        {/* Camita */}
        <group position={[-2.4, 0, -2.3]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.7, 0.55, 2.6]} />
            <meshStandardMaterial color="#ffd6e5" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.74, -0.85]}>
            <boxGeometry args={[1.2, 0.26, 0.6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
        </group>
        {/* Mesita con tetera */}
        <group position={[2.3, 0, -2.2]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.85, 0.95, 0.14, 12]} />
            <meshStandardMaterial color="#b08a5a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.14, 0.18, 0.5, 8]} />
            <meshStandardMaterial color="#8a6a4a" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color={accent} roughness={0.5} />
          </mesh>
        </group>
        {/* Lamparita brillante (emisiva, sin pointLight) */}
        <group position={[3.2, 0, 3.0]}>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 1.3, 8]} />
            <meshStandardMaterial color="#8a6a4a" roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshBasicMaterial color="#ffe9b5" toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* Cofre del interior (tesoro de misión si questChest) */}
      <ChestProp
        id={`${id}-treasure`}
        position={[x + 2.4, 0, z + 1.7]}
        coins={chestCoins}
        quest={questChest}
        playerPositionRef={playerPositionRef}
        onPropInteract={onPropInteract}
        openedChestsRef={openedChestsRef}
      />

      {/* Michi de casita (mimos = moneditas) */}
      <InteractiveProp
        position={[x - 2.3, 0, z + 2.1]}
        radius={1.7}
        once
        hintColor="#ffb6d0"
        hintY={1.3}
        playerPositionRef={playerPositionRef}
        onInteract={() => onPropInteract?.({ type: 'kitty', id: `${id}-kitty`, coins: 5, message: '🐱 ¡Michi de casita feliz! +5' })}
      >
        <group scale={0.9}>
          <mesh position={[0, 0.34, 0]} castShadow>
            <sphereGeometry args={[0.34, 14, 10]} />
            <meshStandardMaterial color="#ffe28d" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.72, 0.1]} castShadow>
            <sphereGeometry args={[0.26, 12, 10]} />
            <meshStandardMaterial color="#ffe28d" roughness={0.6} />
          </mesh>
          <mesh position={[-0.13, 0.94, 0.08]}>
            <coneGeometry args={[0.09, 0.18, 5]} />
            <meshStandardMaterial color="#ffe28d" roughness={0.6} />
          </mesh>
          <mesh position={[0.13, 0.94, 0.08]}>
            <coneGeometry args={[0.09, 0.18, 5]} />
            <meshStandardMaterial color="#ffe28d" roughness={0.6} />
          </mesh>
          <mesh position={[-0.09, 0.74, 0.33]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[0.09, 0.74, 0.33]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>
        </group>
      </InteractiveProp>

      {/* Puerta de salida → teleport de regreso afuera */}
      <InteractiveProp
        position={[x, 0, z + 4.4]}
        radius={1.8}
        cooldownMs={2500}
        hintColor={accent}
        hintY={2.5}
        playerPositionRef={playerPositionRef}
        onInteract={() => {
          requestTeleport?.(exitTarget[0], exitTarget[1]);
          onPropInteract?.({ type: 'house_exit', id, message: '🚪 Saliste de la casita' });
        }}
      />
    </>
  );
}
