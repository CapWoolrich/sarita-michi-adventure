import { useState } from 'react';

export default function MultiplayerLobby({ isOpen, onCreateRoom, onJoinRoom, onClose, status, roomCode, playersCount }) {
  const [mode, setMode] = useState('menu'); // menu | host | join
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = async () => {
    setError('');
    setMode('host');
    try {
      await onCreateRoom();
    } catch (e) {
      setError('No se pudo crear la sala. Intenta de nuevo.');
      setMode('menu');
    }
  };

  const handleJoin = async () => {
    if (joinCode.length !== 4) {
      setError('Código inválido (4 letras/números)');
      return;
    }
    setError('');
    setMode('join');
    try {
      await onJoinRoom(joinCode.toUpperCase());
    } catch (e) {
      setError('No se pudo unir. Verifica el código.');
      setMode('menu');
    }
  };

  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-mp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <div>
            <h2>Multijugador</h2>
            <small>Juega con un amigo en otro dispositivo</small>
          </div>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>

        <div className="kw-mp-body">
          {mode === 'menu' && (
            <>
              <div className="kw-mp-buttons">
                <button className="kw-mp-action kw-mp-host" onClick={handleCreate}>
                  <span style={{ fontSize: 32 }}>🎮</span>
                  <strong>Crear sala</strong>
                  <small>Comparte el código con tu amigo</small>
                </button>
                <button className="kw-mp-action kw-mp-join" onClick={() => setMode('input')}>
                  <span style={{ fontSize: 32 }}>🔗</span>
                  <strong>Unirse a sala</strong>
                  <small>Ingresa el código del host</small>
                </button>
              </div>
              <div className="kw-mp-hint">
                💡 Ambos dispositivos deben tener el juego abierto y conexión a internet.
              </div>
            </>
          )}

          {mode === 'input' && (
            <div className="kw-mp-input-screen">
              <div className="kw-mp-input-label">Código de sala</div>
              <input
                className="kw-mp-input"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="ABC4"
                maxLength={4}
                autoFocus
              />
              <div className="kw-mp-input-buttons">
                <button className="kw-pause-btn" onClick={() => setMode('menu')}>← Atrás</button>
                <button className="kw-splash-primary" onClick={handleJoin} style={{ flex: 1, padding: '14px' }}>
                  Unirse
                </button>
              </div>
            </div>
          )}

          {(mode === 'host' || status === 'hosting') && roomCode && (
            <div className="kw-mp-room-screen">
              <div className="kw-mp-room-label">Tu código de sala</div>
              <div className="kw-mp-room-code">{roomCode}</div>
              <div className="kw-mp-room-hint">
                Comparte este código con tu amigo. Cuando se conecte, aparecerá aquí 👇
              </div>
              <div className="kw-mp-players">
                <div className="kw-mp-player kw-mp-player-self">
                  <span>👑</span>
                  <strong>Tú (Host)</strong>
                </div>
                {playersCount > 0 ? (
                  Array.from({ length: playersCount }).map((_, i) => (
                    <div key={i} className="kw-mp-player">
                      <span>🐾</span>
                      <strong>Jugador {i + 2}</strong>
                    </div>
                  ))
                ) : (
                  <div className="kw-mp-waiting">⏳ Esperando jugadores…</div>
                )}
              </div>
              <button className="kw-pause-btn" onClick={onClose}>Empezar a jugar</button>
            </div>
          )}

          {(mode === 'join' || status === 'connected') && (
            <div className="kw-mp-room-screen">
              <div className="kw-mp-room-label">Conectado a sala</div>
              <div className="kw-mp-room-code">{roomCode || joinCode}</div>
              <div className="kw-mp-room-hint">✨ ¡Listo! Disfruta del juego con tu amigo.</div>
              <button className="kw-pause-btn" onClick={onClose}>Continuar</button>
            </div>
          )}

          {error && <div className="kw-mp-error">⚠️ {error}</div>}
        </div>
      </div>
    </div>
  );
}
