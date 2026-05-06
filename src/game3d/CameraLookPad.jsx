import { useEffect, useRef } from 'react';

const DEBUG_CAMERA = false;

export default function CameraLookPad({ touchState, debug = false }) {
  const activePointerIdRef = useRef(null);
  const activeTouchIdRef = useRef(null);
  const lastRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const removeListeners = () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
      window.removeEventListener('touchcancel', onWindowTouchEnd);
    };

    const onWindowPointerMove = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      event.preventDefault();
      const dx = event.clientX - lastRef.current.x;
      const dy = event.clientY - lastRef.current.y;
      const look = touchState.current.look;
      look.active = true;
      look.pointerId = event.pointerId;
      look.dx += dx;
      look.dy += dy;
      look.lastX = event.clientX;
      look.lastY = event.clientY;
      if (DEBUG_CAMERA) console.log('[camera-pad] pointermove', { dx, dy, active: look.active });
      lastRef.current = { x: event.clientX, y: event.clientY };
    };

    const onWindowPointerUp = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      event.preventDefault();
      const look = touchState.current.look;
      look.active = false;
      look.pointerId = null;
      look.dx = 0;
      look.dy = 0;
      if (DEBUG_CAMERA) console.log('[camera-pad] pointerup', { pointerId: event.pointerId, active: look.active });
      activePointerIdRef.current = null;
      removeListeners();
    };

    const onWindowTouchMove = (event) => {
      const touchId = activeTouchIdRef.current;
      if (touchId == null) return;
      const touch = Array.from(event.changedTouches).find((t) => t.identifier === touchId);
      if (!touch) return;
      event.preventDefault();
      const dx = touch.clientX - lastRef.current.x;
      const dy = touch.clientY - lastRef.current.y;
      const look = touchState.current.look;
      look.active = true;
      look.pointerId = `touch-${touchId}`;
      look.dx += dx;
      look.dy += dy;
      look.lastX = touch.clientX;
      look.lastY = touch.clientY;
      if (DEBUG_CAMERA) console.log('[camera-pad] touchmove', { dx, dy, active: look.active });
      lastRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const onWindowTouchEnd = (event) => {
      const touchId = activeTouchIdRef.current;
      if (touchId == null) return;
      const touch = Array.from(event.changedTouches).find((t) => t.identifier === touchId);
      if (!touch) return;
      const look = touchState.current.look;
      look.active = false;
      look.pointerId = null;
      look.dx = 0;
      look.dy = 0;
      if (DEBUG_CAMERA) console.log('[camera-pad] touchend', { touchId, active: look.active });
      activeTouchIdRef.current = null;
      removeListeners();
    };

    const onPointerDown = (event) => {
      if (event.target.closest('.catch-btn') || event.target.closest('.integrated-hud') || event.target.closest('.hud-icon-btn') || event.target.closest('.joystick-zone') || event.target.closest('.mobile-control-btn') || event.target.closest('button')) return;
      if (activePointerIdRef.current != null) return;
      event.preventDefault();
      event.stopPropagation();
      activePointerIdRef.current = event.pointerId;
      lastRef.current = { x: event.clientX, y: event.clientY };
      const look = touchState.current.look;
      look.active = true;
      look.pointerId = event.pointerId;
      look.lastX = event.clientX;
      look.lastY = event.clientY;
      look.dx = 0;
      look.dy = 0;
      if (DEBUG_CAMERA) console.log('[camera-pad] pointerdown', { pointerId: event.pointerId, x: event.clientX, y: event.clientY });
      window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
      window.addEventListener('pointerup', onWindowPointerUp, { passive: false });
      window.addEventListener('pointercancel', onWindowPointerUp, { passive: false });
    };

    const onTouchStart = (event) => {
      if (activeTouchIdRef.current != null || event.changedTouches.length === 0) return;
      const touch = event.changedTouches[0];
      activeTouchIdRef.current = touch.identifier;
      lastRef.current = { x: touch.clientX, y: touch.clientY };
      const look = touchState.current.look;
      look.active = true;
      look.pointerId = `touch-${touch.identifier}`;
      look.lastX = touch.clientX;
      look.lastY = touch.clientY;
      look.dx = 0;
      look.dy = 0;
      if (DEBUG_CAMERA) console.log('[camera-pad] touchstart', { touchId: touch.identifier, x: touch.clientX, y: touch.clientY });
      window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
      window.addEventListener('touchend', onWindowTouchEnd, { passive: false });
      window.addEventListener('touchcancel', onWindowTouchEnd, { passive: false });
    };

    const node = document.querySelector('.camera-look-pad');
    node?.addEventListener('pointerdown', onPointerDown, { passive: false });
    node?.addEventListener('touchstart', onTouchStart, { passive: false });

    return () => {
      node?.removeEventListener('pointerdown', onPointerDown);
      node?.removeEventListener('touchstart', onTouchStart);
      removeListeners();
    };
  }, [touchState]);

  return <div
    className="camera-look-pad"
    style={{ position: 'fixed', right: 0, top: 'max(84px, calc(env(safe-area-inset-top) + 56px))', bottom: 0, width: '65vw', zIndex: 35, touchAction: 'none', pointerEvents: 'auto', background: debug ? 'rgba(255,0,0,0.08)' : 'transparent' }}
  />;
}
