import { useEffect, useState } from 'react';

const SIZE = 88;
const DEFAULT_MAP_RANGE = 30;

/**
 * Mini-map radar. Punto central = jugador, blips = michis no capturados.
 * Lee posiciones via prop callback que se ejecuta cada 200ms.
 */
export default function MiniMap({ getRadarSnapshot, mapRange = DEFAULT_MAP_RANGE }) {
  const [snapshot, setSnapshot] = useState({ player: null, cats: [] });

  useEffect(() => {
    const id = setInterval(() => {
      const snap = getRadarSnapshot?.();
      if (snap) setSnapshot(snap);
    }, 200);
    return () => clearInterval(id);
  }, [getRadarSnapshot]);

  const { player, cats } = snapshot;
  if (!player) return null;

  const range = Math.max(8, Number(mapRange) || DEFAULT_MAP_RANGE);
  const half = SIZE / 2;
  const blips = cats
    .map((c) => {
      const dx = c.x - player.x;
      const dz = c.z - player.z;
      const dist = Math.hypot(dx, dz);
      if (dist > range) return null;
      const rx = (dx / range) * (half - 8);
      const ry = (dz / range) * (half - 8);
      return { id: c.id, color: c.color, rx, ry, dist, golden: c.golden };
    })
    .filter(Boolean);

  return (
    <div className="kw-minimap" data-game-ui="true">
      <svg viewBox={`-${half} -${half} ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        <circle cx="0" cy="0" r={half - 2} fill="rgba(255,255,255,0.55)" stroke="rgba(192,132,252,0.4)" strokeWidth="1.2" />
        <circle cx="0" cy="0" r={(half - 8) * 0.66} fill="none" stroke="rgba(192,132,252,0.18)" strokeWidth="0.8" />
        <circle cx="0" cy="0" r={(half - 8) * 0.33} fill="none" stroke="rgba(192,132,252,0.18)" strokeWidth="0.8" />
        <text x="0" y={-half + 9} textAnchor="middle" fontSize="8" fill="#6e3f9a" fontWeight="700">N</text>
        <circle cx="0" cy="0" r="3.5" fill="#6e3f9a" />
        <circle cx="0" cy="0" r="6" fill="none" stroke="#c084fc" strokeWidth="1.2" opacity="0.6">
          <animate attributeName="r" values="4;9;4" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
        </circle>
        {blips.map((b) => (
          <g key={b.id}>
            <circle cx={b.rx} cy={b.ry} r={b.golden ? 4 : 2.8} fill={b.golden ? '#ffd066' : b.color} stroke="#1a1a2e" strokeWidth="0.6" />
            {b.golden && (
              <circle cx={b.rx} cy={b.ry} r="6" fill="none" stroke="#ffd066" strokeWidth="1">
                <animate attributeName="r" values="4;9;4" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
