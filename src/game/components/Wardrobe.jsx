import { OUTFITS, getUnlockLevel, isOutfitUnlocked } from '../outfits/outfits';

export default function Wardrobe({ isOpen, currentOutfitId, achievements, totalCats = 0, completedLevels = 0, purchasedOutfitIds = [], onSelect, onClose }) {
  if (!isOpen) return null;
  const unlockedCount = OUTFITS.filter((o) => isOutfitUnlocked(o, achievements, totalCats, completedLevels, purchasedOutfitIds)).length;

  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-collection-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <div>
            <h2>Vestidor</h2>
            <small>{unlockedCount}/{OUTFITS.length} outfits · desbloquea 1 cada 3 niveles</small>
          </div>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-collection-body">
          <div className="kw-wardrobe-auto">
            <button
              className={`kw-wardrobe-card ${currentOutfitId === 'auto' ? 'kw-wardrobe-current' : ''}`}
              onClick={() => onSelect('auto')}
            >
              <div className="kw-wardrobe-preview" style={{ background: 'linear-gradient(135deg, #c084fc, #ec4899, #ffd066)' }}>
                ✨
              </div>
              <strong>Auto por mundo</strong>
              <small>Cambia según bioma y outfits desbloqueados</small>
              {currentOutfitId === 'auto' && <span className="kw-wardrobe-badge">Activo</span>}
            </button>
          </div>
          <div className="kw-wardrobe-grid">
            {OUTFITS.map((o) => {
              const unlocked = isOutfitUnlocked(o, achievements, totalCats, completedLevels, purchasedOutfitIds);
              const purchased = purchasedOutfitIds.includes(o.id);
              const active = currentOutfitId === o.id;
              const needed = getUnlockLevel(o);
              return (
                <button
                  key={o.id}
                  className={`kw-wardrobe-card ${unlocked ? '' : 'kw-wardrobe-locked'} ${active ? 'kw-wardrobe-current' : ''}`}
                  onClick={() => unlocked && onSelect(o.id)}
                  disabled={!unlocked}
                >
                  <div
                    className="kw-wardrobe-preview"
                    style={{ background: `linear-gradient(135deg, ${o.dressColor}, ${o.hatColor})` }}
                  >
                    {unlocked ? o.icon : '🔒'}
                  </div>
                  <strong>{o.name}</strong>
                  {!unlocked && <small>Completa {needed} niveles o cómpralo en la Tienda</small>}
                  {unlocked && purchased && <small>Comprado en la Tienda</small>}
                  {unlocked && !purchased && needed > 0 && <small>Ganado en nivel {needed}</small>}
                  {active && unlocked && <span className="kw-wardrobe-badge">Actual</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
