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
