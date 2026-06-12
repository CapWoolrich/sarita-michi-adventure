import InteractiveProp from './InteractiveProp';

/**
 * Casita kawaii ligera con puerta visual interactiva.
 * `interiorId` queda reservado para la fase futura de "interior zones":
 * cuando existan interiores, la puerta hará transición en vez de mostrar mensaje.
 */
export default function CityHouseLite({
  position = [0, 0, 0],
  rotationY = 0,
  bodyColor = '#fff0e0',
  roofColor = '#c98390',
  doorColor = '#8a5a44',
  interiorId = null,
  playerPositionRef,
  onDoorInteract
}) {
  // Posición mundial de la puerta (frente local +z rotado por rotationY)
  const doorWorld = [
    position[0] + Math.sin(rotationY) * 2.4,
    0,
    position[2] + Math.cos(rotationY) * 2.4
  ];

  return (
    <>
      <group position={position} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 2.5, 4.0]} />
          <meshStandardMaterial color={bodyColor} roughness={0.82} />
        </mesh>
        <mesh position={[0, 2.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.4, 1.6, 4]} />
          <meshStandardMaterial color={roofColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.85, 2.02]}>
          <boxGeometry args={[1.0, 1.7, 0.08]} />
          <meshStandardMaterial color={doorColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.3, 0.85, 2.07]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#ffd066" roughness={0.4} />
        </mesh>
        <mesh position={[-1.4, 1.55, 2.02]}>
          <boxGeometry args={[0.74, 0.74, 0.06]} />
          <meshStandardMaterial color="#bfe6ff" emissive="#9fd2ff" emissiveIntensity={0.25} roughness={0.3} />
        </mesh>
        <mesh position={[1.4, 1.55, 2.02]}>
          <boxGeometry args={[0.74, 0.74, 0.06]} />
          <meshStandardMaterial color="#bfe6ff" emissive="#9fd2ff" emissiveIntensity={0.25} roughness={0.3} />
        </mesh>
      </group>
      {onDoorInteract && (
        <InteractiveProp
          position={doorWorld}
          radius={2.2}
          cooldownMs={3000}
          hintColor="#ff9bc8"
          hintY={2.4}
          playerPositionRef={playerPositionRef}
          onInteract={() => onDoorInteract(interiorId)}
        />
      )}
    </>
  );
}
