/**
 * Barra de vida — corazones rosados.
 * Aparece arriba-izq junto al timer (debajo del minimap si hay).
 */
export default function HealthBar({ current, max, isInvuln = false }) {
  return (
    <div className={`kw-health-bar ${isInvuln ? 'kw-invuln' : ''}`} data-game-ui="true">
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} on={i < current} />
      ))}
    </div>
  );
}

function Heart({ on }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={`kw-heart ${on ? 'kw-heart-on' : 'kw-heart-off'}`}>
      <path
        d="M12 21s-7-4.5-9-9.5C1.5 7 4 4 7.5 4c2 0 3.5 1.2 4.5 2.6C13 5.2 14.5 4 16.5 4 20 4 22.5 7 21 11.5 19 16.5 12 21 12 21z"
        fill={on ? '#ff5588' : 'rgba(255,150,180,0.22)'}
        stroke={on ? '#c8336e' : 'rgba(200,50,100,0.35)'}
        strokeWidth="1.4"
      />
    </svg>
  );
}
