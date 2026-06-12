import InteractiveProp from './InteractiveProp';

/**
 * Auto kawaii funcional (versión lite, sin física):
 * - Interactuar activa "modo vehículo": boost de velocidad + kart visual
 *   que sigue a Sarita (MountedVehicle) durante `durationMs`.
 * - Volver a interactuar con un auto estacionado lo desactiva.
 * - El boost se aplica en MissionChallengeLayer vía movementMultiplierRef.
 */
export default function VehicleLite({
  position = [0, 0, 0],
  rotationY = 0,
  color = '#ff66cc',
  durationMs = 14000,
  vehicleStateRef,
  playerPositionRef,
  onVehicleToggle
}) {
  const handleInteract = () => {
    const v = vehicleStateRef?.current;
    if (!v) return;
    if (v.active) {
      v.active = false;
      v.until = 0;
      onVehicleToggle?.({ active: false });
    } else {
      v.active = true;
      v.until = Date.now() + durationMs;
      v.color = color;
      onVehicleToggle?.({ active: true, color, durationMs });
    }
  };

  return (
    <InteractiveProp
      position={position}
      radius={2.6}
      cooldownMs={2500}
      hintColor={color}
      hintY={1.9}
      playerPositionRef={playerPositionRef}
      onInteract={handleInteract}
    >
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
    </InteractiveProp>
  );
}
