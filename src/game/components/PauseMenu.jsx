import { HomeIcon, PlayIcon, VolumeIcon, MuteIcon } from '../../components/Icons.jsx';

export default function PauseMenu({
  isOpen,
  onResume,
  onRestart,
  onHome,
  onSettings,
  audioEnabled,
  hapticsEnabled,
  onToggleAudio,
  onToggleHaptics
}) {
  if (!isOpen) return null;
  return (
    <div className="kw-pause-overlay" data-game-ui="true">
      <div className="kw-pause-card">
        <div className="kw-pause-title">Pausa</div>
        <button className="kw-pause-primary" onClick={onResume}>
          <PlayIcon /> Reanudar
        </button>
        <div className="kw-pause-row">
          <button className="kw-pause-btn" onClick={onRestart}>
            <span aria-hidden>🔄</span> Reiniciar
          </button>
          <button className="kw-pause-btn" onClick={onHome}>
            <HomeIcon /> Inicio
          </button>
        </div>
        <div className="kw-pause-row">
          <button className="kw-pause-btn kw-pause-toggle" onClick={onToggleAudio}>
            {audioEnabled ? <VolumeIcon /> : <MuteIcon />}
            Audio: {audioEnabled ? 'ON' : 'OFF'}
          </button>
          <button className="kw-pause-btn kw-pause-toggle" onClick={onToggleHaptics}>
            <span aria-hidden>📳</span>
            Vibrar: {hapticsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <button className="kw-pause-btn kw-pause-settings" onClick={onSettings}>
          <span aria-hidden>⚙️</span> Configuración
        </button>
      </div>
    </div>
  );
}
