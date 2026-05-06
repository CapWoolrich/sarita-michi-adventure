import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CAMERA_DISTANCE = 6;
const CAMERA_HEIGHT = 2.5;
const CAMERA_LOOK_AT_HEIGHT = 1.35;
const CAMERA_MIN_PITCH = -0.35;
const CAMERA_MAX_PITCH = 0.7;
const LOOK_SENSITIVITY_X = 0.0085;
const LOOK_SENSITIVITY_Y = 0.006;
const CAMERA_SMOOTHING = 0.12;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerpAngle = (from, to, alpha) => {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * alpha;
};

export default function useRobloxLikeControls({ characterRef, touchState, isPaused = false, isLevelComplete = false, onDebugUpdate, speedMode = 'normal', jumpRequestedRef }) {
  const { camera } = useThree();
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(0.35);
  const cameraDistanceRef = useRef(CAMERA_DISTANCE);
  const lookTouchIdRef = useRef(null);
  const lastLookRef = useRef({ x: 0, y: 0 });
  const lookMoveCountRef = useRef(0);
  const cameraApplyCountRef = useRef(0);
  const desiredCameraPosition = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const moveDirection = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const handleTouchStart = (event) => {
      if (lookTouchIdRef.current != null || isPaused || isLevelComplete) return;
      for (const touch of Array.from(event.changedTouches)) {
        const target = touch.target;
        if (target?.closest?.('[data-game-ui="true"], button, a, input, textarea, select')) continue;
        const width = window.innerWidth;
        if (touch.clientX < width * 0.42) continue;
        lookTouchIdRef.current = touch.identifier;
        lastLookRef.current = { x: touch.clientX, y: touch.clientY };
        event.preventDefault();
        break;
      }
    };

    const handleTouchMove = (event) => {
      if (lookTouchIdRef.current == null || isPaused || isLevelComplete) return;
      const touch = Array.from(event.touches).find((t) => t.identifier === lookTouchIdRef.current);
      if (!touch) return;
      const dx = touch.clientX - lastLookRef.current.x;
      const dy = touch.clientY - lastLookRef.current.y;
      cameraYawRef.current -= dx * LOOK_SENSITIVITY_X;
      cameraPitchRef.current = clamp(cameraPitchRef.current - dy * LOOK_SENSITIVITY_Y, CAMERA_MIN_PITCH, CAMERA_MAX_PITCH);
      lastLookRef.current = { x: touch.clientX, y: touch.clientY };
      lookMoveCountRef.current += 1;
      event.preventDefault();
    };

    const handleTouchEnd = (event) => {
      if (lookTouchIdRef.current == null) return;
      for (const touch of Array.from(event.changedTouches)) {
        if (touch.identifier === lookTouchIdRef.current) {
          lookTouchIdRef.current = null;
          break;
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false, capture: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      document.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
    };
  }, [isPaused, isLevelComplete]);

  useFrame((_, delta) => {
    if (!characterRef.current) return;
    const player = characterRef.current;
    const joy = touchState.current.joy || touchState.current.joystick;
    const strafeInput = clamp(joy?.x ?? 0, -1, 1);
    const forwardInput = clamp(-(joy?.y ?? 0), -1, 1);

    const yaw = cameraYawRef.current;
    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
    right.set(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
    moveDirection.set(0, 0, 0).addScaledVector(forward, forwardInput).addScaledVector(right, strafeInput);

    const speedMultiplier = speedMode === 'fast' ? 1.7 : 1;

    if (!isPaused && !isLevelComplete && moveDirection.lengthSq() > 0.0001) {
      moveDirection.normalize();
      const speed = 5.1 * speedMultiplier;
      player.position.x += moveDirection.x * speed * delta;
      player.position.z += moveDirection.z * speed * delta;
      player.position.x = clamp(player.position.x, -36, 36);
      player.position.z = clamp(player.position.z, -36, 36);
      const targetYaw = Math.atan2(moveDirection.x, moveDirection.z);
      player.rotation.y = lerpAngle(player.rotation.y, targetYaw, 0.18);
    }


    const jumpState = player.userData.jumpState || { jumpOffset: 0, verticalVelocity: 0, grounded: true, isJumping: false };
    const jumpRequested = Boolean(jumpRequestedRef?.current);
    if (!isPaused && !isLevelComplete && jumpRequested && jumpState.grounded && !jumpState.isJumping) {
      jumpState.verticalVelocity = 5.2;
      jumpState.grounded = false;
      jumpState.isJumping = true;
      if (jumpRequestedRef) jumpRequestedRef.current = false;
    }
    if (!jumpState.grounded) {
      jumpState.verticalVelocity -= 13 * delta;
      jumpState.jumpOffset += jumpState.verticalVelocity * delta;
      if (jumpState.jumpOffset <= 0) {
        jumpState.jumpOffset = 0;
        jumpState.verticalVelocity = 0;
        jumpState.grounded = true;
        jumpState.isJumping = false;
      }
    } else {
      jumpState.jumpOffset = 0;
      jumpState.verticalVelocity = 0;
      jumpState.isJumping = false;
    }
    player.position.y = Math.max(0, jumpState.jumpOffset);
    player.userData.jumpState = jumpState;

    const pitch = cameraPitchRef.current;
    const distance = cameraDistanceRef.current;
    const horizontalDistance = distance * Math.cos(pitch);
    const verticalOffset = CAMERA_HEIGHT + distance * Math.sin(pitch);
    desiredCameraPosition.set(
      player.position.x + Math.sin(yaw) * horizontalDistance,
      player.position.y + verticalOffset,
      player.position.z + Math.cos(yaw) * horizontalDistance
    );
    camera.position.lerp(desiredCameraPosition, CAMERA_SMOOTHING);
    camera.lookAt(player.position.x, player.position.y + CAMERA_LOOK_AT_HEIGHT, player.position.z);
    cameraApplyCountRef.current += 1;

    onDebugUpdate?.({
      joy,
      cameraYaw: cameraYawRef.current,
      cameraPitch: cameraPitchRef.current,
      lookTouchId: lookTouchIdRef.current,
      lastLookX: lastLookRef.current.x,
      lastLookY: lastLookRef.current.y,
      lookMoveCount: lookMoveCountRef.current,
      cameraApplyCount: cameraApplyCountRef.current,
      playerPosition: { x: player.position.x, y: player.position.y, z: player.position.z },
      playerRotation: player.rotation.y,
      grounded: jumpState.grounded,
      isJumping: jumpState.isJumping,
      verticalVelocity: jumpState.verticalVelocity
    });
  });

  return {
    adjustYaw: (deltaYaw) => { cameraYawRef.current += deltaYaw; },
    getYaw: () => cameraYawRef.current
  };
}
