import { useState } from 'react';
import { getShopItems, isOutfitPurchased, isOwnedByProgress, canAfford, ACCESSORIES, isAccessoryPurchased, isCharacterPurchased } from '../shop/shopCatalog';
import { getUnlockLevel } from '../outfits/outfits';
import { CHARACTERS, getCharacterUnlockLevel, isCharacterUnlocked } from '../characters/characters';

const TABS = [
  { id: 'outfits', label: '👗 Outfits' },
  { id: 'characters', label: '🦸 Personajes' },
  { id: 'accessories', label: '✨ Accesorios' }
];

/**
 * Tienda de cosméticos con monedas locales (sin pagos reales).
 * Tres categorías: outfits, personajes y accesorios (auras).
 */
export default function ShopPanel({
  isOpen,
  settings,
  completedLevels = 0,
  currentOutfitId = 'auto',
  currentCharacterId = 'sarita',
  onBuy,
  onEquip,
  onBuyCharacter,
  onEquipCharacter,
  onBuyAccessory,
  onEquipAccessory,
  onClose
}) {
  const [tab, setTab] = useState('outfits');
  if (!isOpen) return null;
  const coins = settings?.coins ?? 0;
  const items = getShopItems();
  const equippedAccessoryId = settings?.equippedAccessoryId ?? null;

  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-collection-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <div>
            <h2>Tienda Kawaii</h2>
            <small>Compra con monedas ganadas jugando y abriendo cofres</small>
          </div>
          <div className="kw-shop-balance"><span aria-hidden>🪙</span> {coins}</div>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-shop-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`kw-shop-tab ${tab === t.id ? 'kw-shop-tab-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="kw-collection-body">
          {tab === 'outfits' && (
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
                    <div className="kw-wardrobe-preview" style={{ background: `linear-gradient(135deg, ${item.outfit.dressColor}, ${item.outfit.hatColor})` }}>
                      {item.outfit.icon}
                    </div>
                    <strong>{item.outfit.name}</strong>
                    {owned ? (
                      <>
                        <small>{byProgress ? `Ganado por progreso (nivel ${getUnlockLevel(item.outfit)})` : 'Comprado'}</small>
                        <button className={`kw-shop-buy ${equipped ? 'kw-shop-equipped' : ''}`} onClick={() => !equipped && onEquip?.(item.outfitId)} disabled={equipped}>
                          {equipped ? '✓ Equipado' : 'Equipar'}
                        </button>
                      </>
                    ) : (
                      <>
                        <small>O gratis al completar {getUnlockLevel(item.outfit)} niveles</small>
                        <button className="kw-shop-buy" onClick={() => affordable && onBuy?.(item)} disabled={!affordable}>
                          🪙 {item.price}{!affordable ? ' · Te faltan monedas' : ''}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'characters' && (
            <div className="kw-wardrobe-grid">
              {CHARACTERS.map((c) => {
                const purchased = isCharacterPurchased(settings, c.id);
                const unlocked = isCharacterUnlocked(c, completedLevels, settings?.purchasedCharacterIds ?? []);
                const affordable = c.price ? canAfford(settings, c.price) : false;
                const equipped = currentCharacterId === c.id;
                const needed = getCharacterUnlockLevel(c);
                const previewBg = c.dressColor ? `linear-gradient(135deg, ${c.dressColor}, ${c.hatColor})` : 'linear-gradient(135deg, #c084fc, #ec4899)';
                return (
                  <div key={c.id} className={`kw-wardrobe-card kw-shop-card ${unlocked ? '' : 'kw-shop-locked'}`}>
                    <div className="kw-wardrobe-preview" style={{ background: previewBg }}>{unlocked ? c.icon : '🔒'}</div>
                    <strong>{c.name}</strong>
                    {unlocked ? (
                      <>
                        <small>{purchased ? 'Comprado' : needed > 0 ? `Ganado en nivel ${needed}` : c.description}</small>
                        <button className={`kw-shop-buy ${equipped ? 'kw-shop-equipped' : ''}`} onClick={() => !equipped && onEquipCharacter?.(c.id)} disabled={equipped}>
                          {equipped ? '✓ Activo' : 'Elegir'}
                        </button>
                      </>
                    ) : (
                      <>
                        <small>O gratis al completar {needed} niveles</small>
                        <button className="kw-shop-buy" onClick={() => affordable && onBuyCharacter?.(c)} disabled={!affordable}>
                          🪙 {c.price}{!affordable ? ' · Te faltan monedas' : ''}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'accessories' && (
            <div className="kw-wardrobe-grid">
              {ACCESSORIES.map((a) => {
                const purchased = isAccessoryPurchased(settings, a.id);
                const affordable = canAfford(settings, a.price);
                const equipped = equippedAccessoryId === a.id;
                return (
                  <div key={a.id} className={`kw-wardrobe-card kw-shop-card ${purchased ? '' : 'kw-shop-locked'}`}>
                    <div className="kw-wardrobe-preview" style={{ background: `radial-gradient(circle, ${a.color}, transparent 75%)` }}>{a.icon}</div>
                    <strong>{a.name}</strong>
                    <small>{a.description}</small>
                    {purchased ? (
                      <button className={`kw-shop-buy ${equipped ? 'kw-shop-equipped' : ''}`} onClick={() => onEquipAccessory?.(equipped ? null : a.id)}>
                        {equipped ? '✓ Equipada · Quitar' : 'Equipar'}
                      </button>
                    ) : (
                      <button className="kw-shop-buy" onClick={() => affordable && onBuyAccessory?.(a)} disabled={!affordable}>
                        🪙 {a.price}{!affordable ? ' · Te faltan monedas' : ''}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="kw-shop-hint">
            💡 Gana monedas completando niveles y abriendo los cofres escondidos en los mundos (¡también dentro de las casitas!).
          </div>
        </div>
      </div>
    </div>
  );
}
