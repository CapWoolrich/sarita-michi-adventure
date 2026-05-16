import { useState } from 'react';

const MISSION_ICONS = {
  rescue: '🐾',
  golden: '✨',
  time_attack: '⏱️',
  exploration: '🔔',
  careful: '❤️',
  fog: '🌫️',
  slow_zone: '💧',
  city_hide: '🏙️',
  mountain_jump: '⛰️',
  escape: '🧟',
  finale: '👑'
};

export default function WorldMapPanel({
  isOpen,
  worlds,
  currentWorldId,
  unlockedWorldIds,
  progress,
  onSelectWorld,
  onSelectLevel,
  onClose,
  onLockedWorld
}) {
  const [expandedWorldId, setExpandedWorldId] = useState(null);
  if (!isOpen) return null;

  const expandedWorld = worlds.find((w) => w.id === expandedWorldId);

  const handleWorldClick = (world) => {
    const unlocked = unlockedWorldIds.includes(world.id);
    if (!unlocked) {
      onLockedWorld?.();
      return;
    }
    // Si tiene múltiples niveles, abrir selector. Si solo uno, ir directo
    if (world.levels.length > 1) {
      setExpandedWorldId(world.id);
    } else {
      onSelectWorld(world.id);
      onClose?.();
    }
  };

  const handleLevelClick = (worldId, levelId, levelIndex) => {
    // Solo permitir si el nivel anterior está completo (o es el primero)
    if (levelIndex > 0) {
      const prevLevel = expandedWorld.levels[levelIndex - 1];
      const prevDone = progress.levels?.[`${worldId}:${prevLevel.id}`]?.completed;
      if (!prevDone) {
        onLockedWorld?.();
        return;
      }
    }
    if (onSelectLevel) {
      onSelectLevel(worldId, levelId);
    } else {
      onSelectWorld(worldId);
    }
    onClose?.();
  };

  return (
    <div data-game-ui="true" className="world-map-overlay" onClick={onClose}>
      <section className="world-map-panel" onClick={(e) => e.stopPropagation()}>
        {!expandedWorld && (
          <>
            <header className="world-map-header">
              <h3>Elige tu mundo</h3>
              <button data-game-ui="true" className="hud-icon-btn" onClick={onClose}>✕</button>
            </header>
            <div className="world-map-grid">
              {worlds.map((w) => {
                const unlocked = unlockedWorldIds.includes(w.id);
                const completed = w.levels.filter((l) => progress.levels?.[`${w.id}:${l.id}`]?.completed).length;
                return (
                  <button
                    key={w.id}
                    data-game-ui="true"
                    className={`world-card ${w.id === currentWorldId ? 'world-card-active' : ''} ${!unlocked ? 'world-card-locked' : ''}`}
                    onClick={() => handleWorldClick(w)}
                  >
                    <div className="world-card-preview" style={{ background: w.thumbnail }} />
                    <div className="world-card-meta">
                      <strong>{w.order}. {w.name}</strong>
                      <small>{completed}/{w.levels.length} niveles</small>
                    </div>
                    <span>{unlocked ? '✨' : '🔒'}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {expandedWorld && (
          <>
            <header className="world-map-header">
              <button data-game-ui="true" className="hud-icon-btn" onClick={() => setExpandedWorldId(null)} aria-label="Atrás">←</button>
              <h3 style={{ flex: 1, textAlign: 'center' }}>{expandedWorld.order}. {expandedWorld.name}</h3>
              <button data-game-ui="true" className="hud-icon-btn" onClick={onClose}>✕</button>
            </header>
            <div className="world-map-levels">
              {expandedWorld.levels.map((lvl, i) => {
                const levelDone = progress.levels?.[`${expandedWorld.id}:${lvl.id}`]?.completed;
                const prevDone = i === 0 || progress.levels?.[`${expandedWorld.id}:${expandedWorld.levels[i - 1].id}`]?.completed;
                const locked = !prevDone;
                const score = progress.levels?.[`${expandedWorld.id}:${lvl.id}`]?.score ?? 0;
                const stars = progress.levels?.[`${expandedWorld.id}:${lvl.id}`]?.stars ?? 0;
                const icon = MISSION_ICONS[lvl.missionType] ?? '🐾';
                return (
                  <button
                    key={lvl.id}
                    data-game-ui="true"
                    className={`world-level-card ${levelDone ? 'world-level-done' : ''} ${locked ? 'world-level-locked' : ''}`}
                    onClick={() => handleLevelClick(expandedWorld.id, lvl.id, i)}
                    disabled={locked}
                  >
                    <div className="world-level-number">{i + 1}</div>
                    <div className="world-level-info">
                      <strong>{icon} {lvl.missionTitle ?? `Nivel ${i + 1}`}</strong>
                      <small>{lvl.missionDescription ?? 'Atrapa todos los michis'}</small>
                      <div className="world-level-meta">
                        <span>🐾 {lvl.catCount ?? 0}</span>
                        <span>⏱ {lvl.timeLimit ?? 90}s</span>
                        {score > 0 && <span>⭐ {score}</span>}
                      </div>
                    </div>
                    <div className="world-level-stars">
                      {locked ? '🔒' : (
                        <>
                          <span className={stars >= 1 ? 'on' : 'off'}>★</span>
                          <span className={stars >= 2 ? 'on' : 'off'}>★</span>
                          <span className={stars >= 3 ? 'on' : 'off'}>★</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
