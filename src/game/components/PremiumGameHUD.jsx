import { PawIcon, StarIcon, TimeIcon, PauseIcon, PlayIcon, HomeIcon, VolumeIcon, MuteIcon, MapIcon } from '../../components/Icons.jsx';

/**
 * HUD v3 — layout estilo referencia kawaii:
 *   IZQUIERDA: 3 stats (Capturados / Puntos / Tiempo) con icono arriba y label abajo
 *   CENTRO:    Mundo X de N · Nombre del mundo · Nivel
 *   DERECHA:   Buscar (binoculares), Pausa, Home — botones circulares
 */
export default function PremiumGameHUD({
  capturedCount,
  totalCats,
  score,
  timeLeft,
  worldIndex,
  worldName,
  levelName,
  isPaused,
  isMuted,
  onPause,
  onHome,
  onAudio,
  onOpenWorlds,
  onLocateCat
}) {
  const lowTime = typeof timeLeft === 'number' && timeLeft <= 10;
  return (
    <header data-game-ui="true" className="kw-hud-v3-wrap">
      <div className="kw-hud-v3">
        <div className="kw-hud-v3-stats">
          <Stat icon={<PawIcon />} value={`${capturedCount}/${totalCats}`} label="Capturados" />
          <Stat icon={<StarIcon />} value={score} label="Puntos" />
          <Stat icon={<TimeIcon />} value={`${timeLeft}s`} label="Tiempo" warn={lowTime} />
        </div>
        <div className="kw-hud-v3-center">
          <div className="kw-hud-v3-world-num">Mundo {worldIndex} de 11</div>
          <div className="kw-hud-v3-world-name">{worldName}</div>
          <div className="kw-hud-v3-level-pill">{levelName}</div>
        </div>
        <div className="kw-hud-v3-buttons">
          <button data-game-ui="true" className="kw-circle-btn" aria-label="Localizar gato" onClick={onLocateCat ?? onOpenWorlds}>
            <BinocularsIcon />
          </button>
          <button data-game-ui="true" className="kw-circle-btn" aria-label={isPaused ? 'Reanudar' : 'Pausar'} onClick={onPause}>
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
          <button data-game-ui="true" className="kw-circle-btn" aria-label="Inicio" onClick={onHome}>
            <HomeIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, value, label, warn = false }) {
  return (
    <div className={`kw-hud-stat ${warn ? 'kw-hud-stat-warn' : ''}`}>
      <span className="kw-hud-stat-icon">{icon}</span>
      <span className="kw-hud-stat-value">{value}</span>
      <span className="kw-hud-stat-label">{label}</span>
    </div>
  );
}

function BinocularsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="6.5" cy="14" r="4" />
      <circle cx="17.5" cy="14" r="4" />
      <circle cx="6.5" cy="14" r="1.4" fill="rgba(255,255,255,0.85)" />
      <circle cx="17.5" cy="14" r="1.4" fill="rgba(255,255,255,0.85)" />
      <path d="M5 4l1.5 8h2.4L9.5 4h-4.5zm9.5 0L14 12h2.4L18 4h-3.5z" />
      <path d="M10 13h4v2h-4z" />
    </svg>
  );
}
