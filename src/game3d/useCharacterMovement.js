import { useRef } from 'react';
import * as THREE from 'three';
import { WORLD_BOUNDS } from './assets';

export function useCharacterMovement() {
  const position = useRef(new THREE.Vector3(0, 0, 0));
  const rotationY = useRef(0);

  const update = ({ joystick, cameraYaw, delta }) => {
    const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const moveDir = forward.multiplyScalar(joystick.y).add(right.multiplyScalar(joystick.x));
    const speed = moveDir.length();
    if (speed > 0.001) {
      moveDir.normalize();
      position.current.addScaledVector(moveDir, Math.min(5.2 * delta, 0.15));
      position.current.x = THREE.MathUtils.clamp(position.current.x, -WORLD_BOUNDS, WORLD_BOUNDS);
      position.current.z = THREE.MathUtils.clamp(position.current.z, -WORLD_BOUNDS, WORLD_BOUNDS);
      const targetYaw = Math.atan2(moveDir.x, moveDir.z);
      rotationY.current = THREE.MathUtils.lerp(rotationY.current, targetYaw, 0.18);
    }
    return { position: position.current, rotationY: rotationY.current, speed };
  };

  return { position, rotationY, update };
}
