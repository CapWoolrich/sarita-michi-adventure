export default function PremiumGameHUD({ capturedCount, totalCats, score, timeLeft, worldIndex, worldName, levelName, isPaused, onPause, onHome, onAudio, onOpenWorlds }) {
  return <header data-game-ui="true" className="premium-hud-wrap">
    <div className="premium-hud">
      <div className="premium-hud-left">
        <span className="premium-hud-pill">🐾 {capturedCount}/{totalCats}</span>
        <span className="premium-hud-pill">⭐ {score}</span>
        <span className="premium-hud-pill">⏱ {timeLeft}s</span>
      </div>
      <div className="premium-hud-center">
        <small>Mundo {worldIndex} de 10</small>
        <strong>{worldName}</strong>
        <small>{levelName}</small>
      </div>
      <div className="premium-hud-right">
        <button data-game-ui="true" className="hud-icon-btn" onClick={onOpenWorlds}>Mundos</button>
        <button data-game-ui="true" className="hud-icon-btn" onClick={onAudio}>🔭</button>
        <button data-game-ui="true" className="hud-icon-btn" onClick={onPause}>{isPaused ? '▶' : '⏸'}</button>
        <button data-game-ui="true" className="hud-icon-btn" onClick={onHome}>🏠</button>
      </div>
    </div>
  </header>;
}
