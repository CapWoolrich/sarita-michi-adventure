import { useEffect, useRef, useState } from 'react';

const DEBUG_MOBILE_INPUT = false;
const JOYSTICK_RADIUS = 56;
const MOVE_DEADZONE = 0.1;

export default function MobileGameInputLayer({ touchState, onCatch, isCatInCaptureRange, cameraDebug }) {
  const layerRef = useRef(null);
  const moveTouchIdRef = useRef(null);
  const lookTouchIdRef = useRef(null);
  const moveOriginRef = useRef({ x: 0, y: 0 });
  const lastLookRef = useRef({ x: 0, y: 0 });
  const [joystickVisual, setJoystickVisual] = useState({ active: false, x: 0, y: 0, centerX: 0, centerY: 0 });

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const resetJoystick = () => {
      touchState.current.joystick.active = false;
      touchState.current.joystick.x = 0;
      touchState.current.joystick.y = 0;
      touchState.current.joystick.magnitude = 0;
      touchState.current.joy = touchState.current.joystick;
      setJoystickVisual((s) => ({ ...s, active: false, x: 0, y: 0 }));
    };

    const endLook = () => {
      const look = touchState.current.look;
      look.active = false;
      look.dx = 0;
      look.dy = 0;
    };

    const handleStartForTouch = (touch, event) => {
      const target = document.elementFromPoint(touch.clientX, touch.clientY) || event.target;
      if (target?.closest?.('[data-game-ui="true"]')) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const leftMoveZone = touch.clientX <= vw * 0.45 && touch.clientY >= vh * 0.35;
      const rightLookZone = touch.clientX >= vw * 0.4;

      if (leftMoveZone && moveTouchIdRef.current == null) {
        moveTouchIdRef.current = touch.identifier;
        moveOriginRef.current = { x: touch.clientX, y: touch.clientY };
        touchState.current.joystick.active = true;
        touchState.current.joy = touchState.current.joystick;
        setJoystickVisual({ active: true, x: 0, y: 0, centerX: touch.clientX, centerY: touch.clientY });
        return;
      }

      if (rightLookZone && lookTouchIdRef.current == null) {
        lookTouchIdRef.current = touch.identifier;
        lastLookRef.current = { x: touch.clientX, y: touch.clientY };
        touchState.current.look.active = true;
        return;
      }
    };

    const onTouchStart = (event) => {
      for (const touch of Array.from(event.changedTouches)) handleStartForTouch(touch, event);
      if (moveTouchIdRef.current != null || lookTouchIdRef.current != null) event.preventDefault();
    };

    const onTouchMove = (event) => {
      let consumed = false;
      for (const touch of Array.from(event.changedTouches)) {
        if (touch.identifier === moveTouchIdRef.current) {
          const dx = touch.clientX - moveOriginRef.current.x;
          const dy = touch.clientY - moveOriginRef.current.y;
          const magPx = Math.hypot(dx, dy);
          const clampedMag = Math.min(1, magPx / JOYSTICK_RADIUS);
          const nx = magPx > 0 ? dx / magPx : 0;
          const ny = magPx > 0 ? dy / magPx : 0;
          const rawX = nx * clampedMag;
          const rawY = ny * clampedMag;
          const mag = Math.hypot(rawX, rawY);
          const joystick = touchState.current.joystick;
          if (mag < MOVE_DEADZONE) {
            joystick.x = 0; joystick.y = 0; joystick.magnitude = 0;
          } else {
            joystick.x = Math.max(-1, Math.min(1, rawX));
            joystick.y = Math.max(-1, Math.min(1, rawY));
            joystick.magnitude = Math.min(1, mag);
          }
          joystick.active = true;
          touchState.current.joy = joystick;
          setJoystickVisual((s) => ({ ...s, active: true, x: joystick.x * JOYSTICK_RADIUS * 0.6, y: joystick.y * JOYSTICK_RADIUS * 0.6 }));
          consumed = true;
        }

        if (touch.identifier === lookTouchIdRef.current) {
          const look = touchState.current.look;
          look.active = true;
          look.dx += touch.clientX - lastLookRef.current.x;
          look.dy += touch.clientY - lastLookRef.current.y;
          lastLookRef.current = { x: touch.clientX, y: touch.clientY };
          consumed = true;
        }
      }
      if (consumed) event.preventDefault();
    };

    const onTouchEnd = (event) => {
      let consumed = false;
      for (const touch of Array.from(event.changedTouches)) {
        if (touch.identifier === moveTouchIdRef.current) {
          moveTouchIdRef.current = null;
          resetJoystick();
          consumed = true;
        }
        if (touch.identifier === lookTouchIdRef.current) {
          lookTouchIdRef.current = null;
          endLook();
          consumed = true;
        }
      }
      if (consumed) event.preventDefault();
    };

    layer.addEventListener('touchstart', onTouchStart, { passive: false });
    layer.addEventListener('touchmove', onTouchMove, { passive: false });
    layer.addEventListener('touchend', onTouchEnd, { passive: false });
    layer.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      layer.removeEventListener('touchstart', onTouchStart);
      layer.removeEventListener('touchmove', onTouchMove);
      layer.removeEventListener('touchend', onTouchEnd);
      layer.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [touchState]);

  return <div ref={layerRef} className="mobile-game-input-layer" style={{ position: 'fixed', inset: 0, zIndex: 52, touchAction: 'none' }}>
    <div className="mobile-move-zone" style={{ position: 'fixed', left: 0, bottom: 0, width: '45vw', height: '65vh' }} />
    <div className="mobile-look-zone" style={{ position: 'fixed', right: 0, top: 'max(84px, calc(env(safe-area-inset-top) + 56px))', bottom: 0, width: '60vw' }} />
    {joystickVisual.active && <div style={{ position: 'fixed', left: joystickVisual.centerX - JOYSTICK_RADIUS, top: joystickVisual.centerY - JOYSTICK_RADIUS, width: JOYSTICK_RADIUS * 2, height: JOYSTICK_RADIUS * 2, borderRadius: '50%', border: '2px solid rgba(255,255,255,.85)', background: 'rgba(255,255,255,.12)', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: JOYSTICK_RADIUS + joystickVisual.x - 18, top: JOYSTICK_RADIUS + joystickVisual.y - 18, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.9)' }} />
    </div>}
    <button data-game-ui="true" className={`catch-btn mobile ${isCatInCaptureRange ? 'catch-btn-ready' : ''}`} onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onCatch(); }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCatch(); }} style={{ position: 'fixed', right: 20, bottom: 'max(16px,env(safe-area-inset-bottom))', zIndex: 70 }}>🐾 Atrapar</button>
    {DEBUG_MOBILE_INPUT && <div style={{ position: 'fixed', left: 8, top: 96, zIndex: 90, background: 'rgba(0,0,0,.75)', color: '#fff', fontSize: 11, padding: 8, borderRadius: 8, fontFamily: 'monospace' }}>
      <div>moveTouchId: {String(moveTouchIdRef.current)}</div><div>lookTouchId: {String(lookTouchIdRef.current)}</div>
      <div>joy.x: {touchState.current.joystick.x.toFixed(2)}</div><div>joy.y: {touchState.current.joystick.y.toFixed(2)}</div>
      <div>look.dx: {touchState.current.look.dx.toFixed(2)}</div><div>look.dy: {touchState.current.look.dy.toFixed(2)}</div>
      <div>yaw: {cameraDebug?.yaw?.toFixed?.(3) ?? '0.000'}</div><div>pitch: {cameraDebug?.pitch?.toFixed?.(3) ?? '0.000'}</div>
    </div>}
  </div>;
}
