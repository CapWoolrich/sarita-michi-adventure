import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThirdPersonCamera({ targetRef, cameraStateRef }) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3());
  useFrame(() => {
    if (!targetRef.current) return;
    const target = targetRef.current.position;
    const { yaw, pitch, distance } = cameraStateRef.current;
    const offset = new THREE.Vector3(
      Math.sin(yaw) * distance,
      2.9 + pitch * 1.9,
      Math.cos(yaw) * distance
    );
    const desired = new THREE.Vector3().copy(target).add(offset);
    camera.position.lerp(desired, 0.12);
    lookAt.current.set(target.x, target.y + 1.4, target.z);
    camera.lookAt(lookAt.current);
  });
  useEffect(() => { camera.fov = 60; camera.updateProjectionMatrix(); }, [camera]);
  return null;
}
