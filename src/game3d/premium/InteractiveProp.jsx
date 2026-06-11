import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/**
 * Prop interactivo ligero por proximidad.
 * - Sin física: solo distancia XZ contra playerPositionRef.
 * - Sin setState por frame: hint y anillo se muestran/ocultan vía refs.
 * - Dispara onInteract al ENTRAR al radio (edge trigger) con cooldown,
 *   o una sola vez si once=true.
 */
export default function InteractiveProp({
  position = [0, 0, 0],
  radius = 2.6,
  once = false,
  cooldownMs = 6000,
  hintColor = '#ffd066',
  hintY = 2.1,
  showRing = true,
  playerPositionRef,
  onInteract,
  children
}) {
  const hintRef = useRef();
  const ringRef = useRef();
  const stateRef = useRef({ inside: false, lastFire: 0, fired: false });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (hintRef.current && hintRef.current.visible) {
      hintRef.current.position.y = hintY + Math.sin(t * 2.4) * 0.12;
      hintRef.current.rotation.y = t * 1.4;
    }
    const player = playerPositionRef?.current;
    if (!player) return;
    const st = stateRef.current;
    const distance = Math.hypot(player.x - position[0], player.z - position[2]);
    const near = distance <= radius;
    const consumed = once && st.fired;
    if (hintRef.current) hintRef.current.visible = near && !consumed;
    if (ringRef.current) ringRef.current.visible = showRing && near && !consumed;
    if (near && !st.inside && !consumed) {
      const now = Date.now();
      if (now - st.lastFire >= cooldownMs) {
        st.lastFire = now;
        st.fired = true;
        onInteract?.();
      }
    }
    st.inside = near;
  });

  return (
    <group position={position}>
      {children}
      <mesh ref={hintRef} position={[0, hintY, 0]} visible={false}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial color={hintColor} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} visible={false}>
        <ringGeometry args={[Math.max(0.6, radius - 0.4), Math.max(0.9, radius - 0.1), 36]} />
        <meshBasicMaterial color={hintColor} transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
}
