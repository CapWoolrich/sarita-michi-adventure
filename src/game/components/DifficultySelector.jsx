const LEVELS = [
  { id: 'easy', icon: '🌸', title: 'Fácil', desc: '5 corazones · más tiempo · sin enemigos', tier: 'mint' },
  { id: 'medium', icon: '🌟', title: 'Medio', desc: '3 corazones · 1 enemigo por mundo', tier: 'gold' },
  { id: 'hard', icon: '🔥', title: 'Difícil', desc: '2 corazones · 2 enemigos · menos tiempo', tier: 'red' }
];

export default function DifficultySelector({ isOpen, current, onSelect, onClose, allCompleted = false }) {
  if (!isOpen) return null;
  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-difficulty-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-difficulty-header">
          {allCompleted && <div className="kw-difficulty-trophy">🏆</div>}
          <h2>{allCompleted ? '¡Completaste todos los mundos!' : 'Elige tu desafío'}</h2>
          <small>{allCompleted ? 'Sube la dificultad y juega de nuevo con un reto mayor' : 'Cambia el nivel de desafío en cualquier momento'}</small>
        </div>
        <div className="kw-difficulty-options">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={`kw-difficulty-card kw-diff-${l.tier} ${current === l.id ? 'kw-diff-current' : ''}`}
              onClick={() => onSelect(l.id)}
            >
              <span className="kw-difficulty-icon">{l.icon}</span>
              <span className="kw-difficulty-title">{l.title}</span>
              <span className="kw-difficulty-desc">{l.desc}</span>
              {current === l.id && <span className="kw-difficulty-badge">Actual</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
