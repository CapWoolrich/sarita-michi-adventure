import { useCallback, useEffect, useRef } from 'react';

export default function CameraLookPad({ touchState, debug = false }) {
  const activePointerIdRef = useRef(null);
  const lastRef = useRef({ x: 0, y: 0 });

  const onWindowPointerMove = useCallback((event) => {
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

    lastRef.current = { x: event.clientX, y: event.clientY };
  }, [touchState]);

  const cleanup = useCallback(() => {
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
    window.removeEventListener('pointercancel', onWindowPointerUp);
  }, [onWindowPointerMove]);

  const onWindowPointerUp = useCallback((event) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    event.preventDefault();

    const look = touchState.current.look;
    look.active = false;
    look.pointerId = null;
    look.dx = 0;
    look.dy = 0;

    activePointerIdRef.current = null;
    cleanup();
  }, [cleanup, touchState]);

  const onPointerDown = useCallback((event) => {
    if (
      event.target.closest('.catch-btn') ||
      event.target.closest('.integrated-hud') ||
      event.target.closest('.hud-icon-btn') ||
      event.target.closest('.joystick-zone') ||
      event.target.closest('.mobile-control-btn')
    ) return;

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

    window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', onWindowPointerUp, { passive: false });
    window.addEventListener('pointercancel', onWindowPointerUp, { passive: false });
  }, [onWindowPointerMove, onWindowPointerUp, touchState]);

  useEffect(() => () => cleanup(), [cleanup]);

  return <div
    className="camera-look-pad"
    onPointerDown={onPointerDown}
    style={{
      position: 'fixed',
      right: 0,
      top: 'max(84px, calc(env(safe-area-inset-top) + 56px))',
      bottom: 0,
      width: '65vw',
      zIndex: 35,
      touchAction: 'none',
      pointerEvents: 'auto',
      background: debug ? 'rgba(255,0,0,0.08)' : 'transparent'
    }}
  />;
}
