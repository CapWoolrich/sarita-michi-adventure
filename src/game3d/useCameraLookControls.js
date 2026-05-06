import { useRef } from 'react';

const DEBUG_CAMERA = false;

export default function useCameraLookControls({ touchState, lookZoneRef, blockedSelectors = [] }) {
  const activeLookPointerId = useRef(null);

  const isBlockedTarget = (target) => {
    if (!target || !(target instanceof Element)) return false;
    return blockedSelectors.some((selector) => target.closest(selector));
  };

  const isWithinLookZone = (x, y) => {
    const rect = lookZoneRef.current?.getBoundingClientRect?.();
    if (!rect) return false;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  const onPointerDown = (e) => {
    if (!isWithinLookZone(e.clientX, e.clientY)) return;
    if (isBlockedTarget(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    lookZoneRef.current?.setPointerCapture?.(e.pointerId);
    activeLookPointerId.current = e.pointerId;
    const look = touchState.current.look;
    look.active = true;
    look.pointerId = e.pointerId;
    look.lastX = e.clientX;
    look.lastY = e.clientY;
  };

  const onPointerMove = (e) => {
    const look = touchState.current.look;
    if (!look.active || activeLookPointerId.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    look.dx += e.clientX - look.lastX;
    look.dy += e.clientY - look.lastY;
    look.lastX = e.clientX;
    look.lastY = e.clientY;
    if (DEBUG_CAMERA) console.log('[camera-look]', look.dx, look.dy, activeLookPointerId.current);
  };

  const onPointerUp = (e) => {
    const look = touchState.current.look;
    if (activeLookPointerId.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    lookZoneRef.current?.releasePointerCapture?.(e.pointerId);
    activeLookPointerId.current = null;
    look.active = false;
    look.pointerId = null;
    look.dx = 0;
    look.dy = 0;
  };

  return { onPointerDown, onPointerMove, onPointerUp, isLookDraggingRef: activeLookPointerId };
}
