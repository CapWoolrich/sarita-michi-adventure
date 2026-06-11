import { getShopItems, isOutfitPurchased, isOwnedByProgress, canAfford } from '../shop/shopCatalog';
import { getUnlockLevel } from '../outfits/outfits';

/**
 * Tienda de outfits con monedas locales.
 * Sin pagos reales: las monedas se ganan jugando (niveles + cofres).
 */
export default function ShopPanel({ isOpen, settings, completedLevels = 0, currentOutfitId = 'auto', onBuy, onEquip, onClose }) {
  if (!isOpen) return null;
  const coins = settings?.coins ?? 0;
  const items = getShopItems();

  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-collection-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <div>
            <h2>Tienda Kawaii</h2>
            <small>Compra outfits con tus monedas · también se ganan jugando</small>
          </div>
          <div className="kw-shop-balance"><span aria-hidden>🪙</span> {coins}</div>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-collection-body">
          <div className="kw-wardrobe-grid">
            {items.map((item) => {
              const purchased = isOutfitPurchased(settings, item.outfitId);
              const byProgress = isOwnedByProgress(item, completedLevels);
              const owned = purchased || byProgress;
              const affordable = canAfford(settings, item.price);
              const equipped = currentOutfitId === item.outfitId;
              return (
                <div key={item.outfitId} className={`kw-wardrobe-card kw-shop-card ${owned ? '' : 'kw-shop-locked'}`}>
                  {item.tag && <span className="kw-shop-tag">{item.tag}</span>}
                  <div
                    className="kw-wardrobe-preview"
                    style={{ background: `linear-gradient(135deg, ${item.outfit.dressColor}, ${item.outfit.hatColor})` }}
                  >
                    {item.outfit.icon}
                  </div>
                  <strong>{item.outfit.name}</strong>
                  {owned ? (
                    <>
                      <small>{byProgress ? `Ganado por progreso (nivel ${getUnlockLevel(item.outfit)})` : 'Comprado'}</small>
                      <button
                        className={`kw-shop-buy ${equipped ? 'kw-shop-equipped' : ''}`}
                        onClick={() => !equipped && onEquip?.(item.outfitId)}
                        disabled={equipped}
                      >
                        {equipped ? '✓ Equipado' : 'Equipar'}
                      </button>
                    </>
                  ) : (
                    <>
                      <small>O gratis al completar {getUnlockLevel(item.outfit)} niveles</small>
                      <button
                        className="kw-shop-buy"
                        onClick={() => affordable && onBuy?.(item)}
                        disabled={!affordable}
                      >
                        🪙 {item.price}{!affordable ? ' · Te faltan monedas' : ''}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="kw-shop-hint">
            💡 Gana monedas completando niveles y abriendo cofres escondidos en los mundos.
          </div>
        </div>
      </div>
    </div>
  );
}
