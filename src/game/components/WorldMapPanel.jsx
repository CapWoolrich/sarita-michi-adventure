export default function WorldMapPanel({ isOpen, worlds, currentWorldId, unlockedWorldIds, progress, onSelectWorld, onClose, onLockedWorld }) {
  if (!isOpen) return null;
  return <div data-game-ui="true" className="world-map-overlay" onClick={onClose}>
    <section className="world-map-panel" onClick={(e) => e.stopPropagation()}>
      <header className="world-map-header"><h3>Elige tu mundo</h3><button data-game-ui="true" className="hud-icon-btn" onClick={onClose}>✕</button></header>
      <div className="world-map-grid">{worlds.map((w) => {
        const unlocked = unlockedWorldIds.includes(w.id);
        const completed = w.levels.filter((l) => progress.levels?.[`${w.id}:${l.id}`]?.completed).length;
        return <button key={w.id} data-game-ui="true" className={`world-card ${w.id === currentWorldId ? 'world-card-active' : ''} ${!unlocked ? 'world-card-locked' : ''}`} onClick={() => unlocked ? (onSelectWorld(w.id), onClose()) : onLockedWorld?.()}>
          <div className="world-card-preview" style={{ background: w.thumbnail }} /><div className="world-card-meta"><strong>{w.order}. {w.name}</strong><small>{completed}/{w.levels.length} niveles</small></div><span>{unlocked ? '✨' : '🔒'}</span>
        </button>;
      })}</div>
    </section>
  </div>;
}
