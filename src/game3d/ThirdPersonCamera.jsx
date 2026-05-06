import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThirdPersonCamera({ targetRef, cameraStateRef }) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3());
  useFrame(() => {
    if (!targetRef.current) return;
    const target = targetRef.current.position;
    const { yaw, pitch, distance, height = 3.2, smoothing = 0.14 } = cameraStateRef.current;
    const horizontalDistance = distance * Math.cos(pitch);
    const verticalOffset = height + distance * Math.sin(pitch);
    const desired = new THREE.Vector3(
      target.x + Math.sin(yaw) * horizontalDistance,
      target.y + verticalOffset,
      target.z + Math.cos(yaw) * horizontalDistance
    );
    camera.position.lerp(desired, smoothing);
    lookAt.current.set(target.x, target.y + 1.42, target.z);
    camera.lookAt(lookAt.current);
  });
  useEffect(() => { camera.fov = 60; camera.updateProjectionMatrix(); }, [camera]);
  return null;
}
