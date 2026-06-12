/**
 * Tienda ligera de cosméticos.
 * - Solo monedas locales (settings.coins). Sin pagos reales, sin economía online.
 * - Comprar un outfit es un atajo: los outfits siguen desbloqueándose gratis
 *   por progreso (cada 3 niveles); la compra lo adelanta.
 * - Persistencia: settings.purchasedOutfitIds.
 */
import { getOutfitById, getUnlockLevel } from '../outfits/outfits';

export const SHOP_ITEMS = [
  { outfitId: 'sakura', price: 150, tag: 'Popular' },
  { outfitId: 'beach', price: 200 },
  { outfitId: 'forest', price: 250 },
  { outfitId: 'lunar', price: 300 },
  { outfitId: 'aurora', price: 350 },
  { outfitId: 'kitty', price: 400, tag: 'Kawaii' },
  { outfitId: 'shadow', price: 550, tag: 'Mundos oscuros' },
  { outfitId: 'royal', price: 600 },
  { outfitId: 'neon', price: 800, tag: 'Premium' }
];

export const getShopItems = () =>
  SHOP_ITEMS.map((item) => ({ ...item, outfit: getOutfitById(item.outfitId) })).filter((i) => i.outfit);

export const isOutfitPurchased = (settings, outfitId) =>
  (settings?.purchasedOutfitIds ?? []).includes(outfitId);

export const isOwnedByProgress = (item, completedLevels = 0) =>
  getUnlockLevel(item.outfit) <= completedLevels;

export const canAfford = (settings, price) => (settings?.coins ?? 0) >= price;

/** Devuelve nuevos settings tras la compra, o null si no procede. */
export function purchaseOutfit(settings, item) {
  if (!item || isOutfitPurchased(settings, item.outfitId) || !canAfford(settings, item.price)) return null;
  return {
    ...settings,
    coins: (settings.coins ?? 0) - item.price,
    purchasedOutfitIds: [...(settings.purchasedOutfitIds ?? []), item.outfitId]
  };
}

/* ===== Accesorios (auras visibles en el juego, también en multiplayer) ===== */

export const ACCESSORIES = [
  { id: 'aura-sakura', name: 'Aura Sakura', icon: '🌸', color: '#ff9bc8', price: 120, description: 'Anillo rosa de pétalos' },
  { id: 'aura-dorada', name: 'Aura Dorada', icon: '⭐', color: '#ffd066', price: 250, description: 'Brillo de michi dorado' },
  { id: 'aura-neon', name: 'Aura Neón', icon: '💠', color: '#00d4ff', price: 350, description: 'Energía de la ciudad neón' }
];

export const getAccessoryById = (id) => ACCESSORIES.find((a) => a.id === id) ?? null;

export const isAccessoryPurchased = (settings, accessoryId) =>
  (settings?.purchasedAccessoryIds ?? []).includes(accessoryId);

export function purchaseAccessory(settings, accessory) {
  if (!accessory || isAccessoryPurchased(settings, accessory.id) || !canAfford(settings, accessory.price)) return null;
  return {
    ...settings,
    coins: (settings.coins ?? 0) - accessory.price,
    purchasedAccessoryIds: [...(settings.purchasedAccessoryIds ?? []), accessory.id]
  };
}

/* ===== Personajes (compra como atajo al desbloqueo por niveles) ===== */

export const isCharacterPurchased = (settings, characterId) =>
  (settings?.purchasedCharacterIds ?? []).includes(characterId);

export function purchaseCharacter(settings, character) {
  if (!character?.price || isCharacterPurchased(settings, character.id) || !canAfford(settings, character.price)) return null;
  return {
    ...settings,
    coins: (settings.coins ?? 0) - character.price,
    purchasedCharacterIds: [...(settings.purchasedCharacterIds ?? []), character.id]
  };
}
