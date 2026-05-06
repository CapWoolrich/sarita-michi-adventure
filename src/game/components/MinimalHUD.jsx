import { PawIcon, TimeIcon, HomeIcon } from '../../components/Icons.jsx';

/**
 * HUD minimalista durante el juego — máxima visibilidad.
 *   Esquina superior izquierda: timer + conteo de michis (en una sola línea compacta)
 *   Esquina superior derecha: botón home (circular, glass)
 *
 * Todo lo demás (mundo, nivel, score) se muestra solo en el intro y al pausar.
 */
export default function MinimalHUD({
  capturedCount,
  totalCats,
  timeLeft,
  isPaused,
  onHome,
  onPause
}) {
  const lowTime = typeof timeLeft === 'number' && timeLeft <= 10;
  return (
    <>
      {/* TOP-LEFT: timer + cats compact */}
      <div className="kw-min-hud-left" data-game-ui="true">
        <span className={`kw-min-pill ${lowTime ? 'kw-min-warn' : ''}`}>
          <TimeIcon className="kw-min-icon" /> {timeLeft}s
        </span>
        <span className="kw-min-pill kw-min-paws">
          <PawIcon className="kw-min-icon" /> {capturedCount}/{totalCats}
        </span>
      </div>

      {/* TOP-RIGHT: home button (también permite pausa con tap largo) */}
      <div className="kw-min-hud-right" data-game-ui="true">
        <button className="kw-circle-btn kw-min-pause" aria-label={isPaused ? 'Reanudar' : 'Pausar'} onClick={onPause}>
          {isPaused ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4c0 1 1.1 1.6 2 1.1l11.2-7.2c.8-.5.8-1.7 0-2.2L9 3.7c-.9-.5-2 .1-2 1.1z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.4" /><rect x="13.5" y="5" width="4" height="14" rx="1.4" /></svg>
          )}
        </button>
        <button className="kw-circle-btn" aria-label="Inicio" onClick={onHome}>
          <HomeIcon />
        </button>
      </div>
    </>
  );
}
