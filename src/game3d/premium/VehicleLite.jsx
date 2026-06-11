import InteractiveProp from './InteractiveProp';

/**
 * Auto kawaii decorativo con interacción "vehículo encontrado".
 * No hay conducción: la arquitectura queda lista para una fase futura
 * (al interactuar se podría montar/poseer el vehículo desde el runtime).
 */
export default function VehicleLite({
  position = [0, 0, 0],
  rotationY = 0,
  color = '#ff66cc',
  playerPositionRef,
  onInteract
}) {
  const visual = (
    <group rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[2.4, 0.6, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[-0.2, 0.9, 0]} castShadow>
        <boxGeometry args={[1.3, 0.55, 1.1]} />
        <meshStandardMaterial color="#eaf6ff" roughness={0.2} metalness={0.1} />
      </mesh>
      {[[-0.8, 0.55], [0.8, 0.55], [-0.8, -0.55], [0.8, -0.55]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.26, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.18, 12]} />
          <meshStandardMaterial color="#2a2438" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[1.21, 0.45, 0.32]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshBasicMaterial color="#fff7c8" toneMapped={false} />
      </mesh>
      <mesh position={[1.21, 0.45, -0.32]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshBasicMaterial color="#fff7c8" toneMapped={false} />
      </mesh>
    </group>
  );

  if (!onInteract) return <group position={position}>{visual}</group>;
  return (
    <InteractiveProp
      position={position}
      radius={2.6}
      cooldownMs={9000}
      hintColor={color}
      hintY={1.9}
      playerPositionRef={playerPositionRef}
      onInteract={onInteract}
    >
      {visual}
    </InteractiveProp>
  );
}
