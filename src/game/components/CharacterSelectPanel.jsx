import { CHARACTERS, getCharacterUnlockLevel, isCharacterUnlocked } from '../characters/characters';

/**
 * Selector de personajes jugables (variaciones ligeras del mismo modelo).
 */
export default function CharacterSelectPanel({ isOpen, currentCharacterId = 'sarita', completedLevels = 0, purchasedCharacterIds = [], onSelect, onClose }) {
  if (!isOpen) return null;
  const unlockedCount = CHARACTERS.filter((c) => isCharacterUnlocked(c, completedLevels, purchasedCharacterIds)).length;

  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-collection-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <div>
            <h2>Personajes</h2>
            <small>{unlockedCount}/{CHARACTERS.length} desbloqueados · se desbloquean jugando niveles</small>
          </div>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-collection-body">
          <div className="kw-wardrobe-grid">
            {CHARACTERS.map((c) => {
              const unlocked = isCharacterUnlocked(c, completedLevels, purchasedCharacterIds);
              const active = currentCharacterId === c.id;
              const needed = getCharacterUnlockLevel(c);
              const previewBg = c.dressColor
                ? `linear-gradient(135deg, ${c.dressColor}, ${c.hatColor})`
                : 'linear-gradient(135deg, #c084fc, #ec4899)';
              return (
                <button
                  key={c.id}
                  className={`kw-wardrobe-card ${unlocked ? '' : 'kw-wardrobe-locked'} ${active ? 'kw-wardrobe-current' : ''}`}
                  onClick={() => unlocked && onSelect?.(c.id)}
                  disabled={!unlocked}
                >
                  <div className="kw-wardrobe-preview" style={{ background: previewBg }}>
                    {unlocked ? c.icon : '🔒'}
                  </div>
                  <strong>{c.name}</strong>
                  <small>{unlocked ? c.description : `Completa ${needed} niveles o cómpralo en la Tienda`}</small>
                  {active && unlocked && <span className="kw-wardrobe-badge">Activo</span>}
                </button>
              );
            })}
          </div>
          <div className="kw-shop-hint">
            ✨ El personaje cambia colores y aura. Si eliges un outfit a mano en el Vestidor, ese outfit manda.
          </div>
        </div>
      </div>
    </div>
  );
}
