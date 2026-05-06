import { useMemo } from 'react';

/**
 * Galería de michis capturados — agrupados por mundo.
 * Lee progress.levels para detectar qué niveles se completaron.
 * Por cada nivel completado, muestra los gatitos atrapados (de la paleta del mundo).
 */
export default function CatCollection({ isOpen, worlds, progress, onClose }) {
  const collection = useMemo(() => {
    if (!progress?.levels) return [];
    return worlds.map((w) => {
      const completedLevels = w.levels.filter((l) => progress.levels[`${w.id}:${l.id}`]?.completed);
      const totalCats = completedLevels.reduce((sum, l) => sum + (l.catCount ?? 0), 0);
      const cats = [];
      let id = 0;
      completedLevels.forEach((l) => {
        for (let i = 0; i < l.catCount; i++) {
          cats.push({
            id: `${w.id}-${l.id}-${id++}`,
            color: w.palette[i % w.palette.length],
            world: w.name,
            level: l.id
          });
        }
      });
      return { world: w, cats, totalCats };
    });
  }, [worlds, progress]);

  const totalCaught = collection.reduce((s, w) => s + w.cats.length, 0);

  if (!isOpen) return null;
  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-collection-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <div>
            <h2>Colección de Michis</h2>
            <small>{totalCaught} gatitos rescatados</small>
          </div>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-collection-body">
          {collection.map(({ world, cats }) => (
            <div key={world.id} className="kw-collection-world">
              <div className="kw-collection-world-head">
                <span className="kw-collection-thumb" style={{ background: world.thumbnail }} />
                <strong>{world.name}</strong>
                <span className="kw-collection-count">{cats.length}</span>
              </div>
              {cats.length === 0 ? (
                <div className="kw-collection-empty">Aún no has rescatado michis aquí</div>
              ) : (
                <div className="kw-collection-cats">
                  {cats.map((c) => <CatChip key={c.id} color={c.color} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Tarjeta circular con gatito SVG kawaii */
function CatChip({ color }) {
  return (
    <div className="kw-cat-chip" title="Michi rescatado">
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* Body */}
        <ellipse cx="50" cy="68" rx="22" ry="18" fill={color} />
        {/* Head */}
        <circle cx="50" cy="46" r="26" fill={color} />
        {/* Ears */}
        <path d="M 32 30 L 26 12 L 42 24 Z" fill={color} />
        <path d="M 68 30 L 74 12 L 58 24 Z" fill={color} />
        <path d="M 34 28 L 32 18 L 40 26 Z" fill="#ffb6d9" />
        <path d="M 66 28 L 68 18 L 60 26 Z" fill="#ffb6d9" />
        {/* Cheek blush */}
        <ellipse cx="34" cy="55" rx="6" ry="4" fill="#ff8fb8" opacity="0.55" />
        <ellipse cx="66" cy="55" rx="6" ry="4" fill="#ff8fb8" opacity="0.55" />
        {/* Eyes */}
        <circle cx="42" cy="46" r="3.5" fill="#1a1a2e" />
        <circle cx="58" cy="46" r="3.5" fill="#1a1a2e" />
        <circle cx="43.5" cy="44.5" r="1.2" fill="#fff" />
        <circle cx="59.5" cy="44.5" r="1.2" fill="#fff" />
        {/* Nose + mouth */}
        <ellipse cx="50" cy="52" rx="1.5" ry="1" fill="#ff6ba6" />
        <path d="M 50 54 q -3 4 -6 4" stroke="#965672" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 50 54 q 3 4 6 4" stroke="#965672" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
