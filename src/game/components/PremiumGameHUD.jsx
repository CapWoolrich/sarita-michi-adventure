import { PawIcon, StarIcon, TimeIcon, PauseIcon, PlayIcon, HomeIcon, VolumeIcon, MuteIcon, MapIcon } from '../../components/Icons.jsx';

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
  onOpenWorlds
}) {
  const lowTime = typeof timeLeft === 'number' && timeLeft <= 10;
  return (
    <header data-game-ui="true" className="premium-hud-wrap">
      <div className="premium-hud">
        <div className="premium-hud-left">
          <span className="kw-chip kw-chip-paw">
            <PawIcon className="kw-chip-icon" />
            {capturedCount}/{totalCats}
          </span>
          <span className="kw-chip kw-chip-star">
            <StarIcon className="kw-chip-icon" />
            {score}
          </span>
          <span className={`kw-chip kw-chip-time ${lowTime ? 'kw-low' : ''}`}>
            <TimeIcon className="kw-chip-icon" />
            {timeLeft}s
          </span>
        </div>
        <div className="premium-hud-center">
          <div className="kw-world-badge">Mundo {worldIndex} de 10</div>
          <div className="kw-world-title">{worldName}</div>
          <div className="kw-world-sub">{levelName}</div>
        </div>
        <div className="premium-hud-right">
          <button data-game-ui="true" className="kw-icon-btn" aria-label="Mapa de mundos" onClick={onOpenWorlds}>
            <MapIcon />
          </button>
          <button data-game-ui="true" className="kw-icon-btn" aria-label={isMuted ? 'Activar audio' : 'Silenciar'} onClick={onAudio}>
            {isMuted ? <MuteIcon /> : <VolumeIcon />}
          </button>
          <button data-game-ui="true" className="kw-icon-btn" aria-label={isPaused ? 'Reanudar' : 'Pausar'} onClick={onPause}>
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
          <button data-game-ui="true" className="kw-icon-btn" aria-label="Inicio" onClick={onHome}>
            <HomeIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
