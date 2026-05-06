/**
 * Wrapper para vibración haptic en mobile.
 * navigator.vibrate(): Android Chrome / Firefox
 * iOS Safari NO la implementa nativamente, pero PWAs en iOS 17.4+ pueden
 * usar TapticEngine via Web. Para simplicidad, fallback: noop.
 */

let enabled = true;

export function setHapticsEnabled(v) { enabled = !!v; }

function vibrate(pattern) {
  if (!enabled) return;
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {}
}

export const haptic = {
  light: () => vibrate(8),
  medium: () => vibrate(18),
  heavy: () => vibrate(35),
  success: () => vibrate([12, 30, 18]),
  fail: () => vibrate([40, 20, 40]),
  capture: () => vibrate([10, 25, 12, 25, 18]),
  achievement: () => vibrate([20, 30, 20, 30, 40])
};
