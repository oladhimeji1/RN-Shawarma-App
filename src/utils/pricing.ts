import { EXTRAS, getProduct, Product, SIZES, SizeId } from '@/data/menu';

const round2 = (n: number) => Math.round(n * 100) / 100;

export const sizeDelta = (id: SizeId) => SIZES.find((s) => s.id === id)?.delta ?? 0;

export const extrasTotal = (extras: string[]) =>
  extras.reduce((s, id) => s + (EXTRAS.find((e) => e.id === id)?.price ?? 0), 0);

/** Price before the product's own discount (what the strike-through shows). */
export const listPrice = (p: Product, size: SizeId, extras: string[]) =>
  round2(p.price + sizeDelta(size) + extrasTotal(extras));

/** Discount applies to the meal itself, not to add-ons. */
export const unitPrice = (p: Product, size: SizeId, extras: string[]) =>
  round2((p.price + sizeDelta(size)) * (1 - (p.discount ?? 0) / 100) + extrasTotal(extras));

export type Line = { key: string; productId: string; size: SizeId; extras: string[]; qty: number; note?: string };

export const lineTotal = (l: Line) => {
  const p = getProduct(l.productId);
  return p ? round2(unitPrice(p, l.size, l.extras) * l.qty) : 0;
};

export const PROMOS: Record<string, number> = { SHAWARMA10: 10, FIRSTWRAP: 15 };
export const DELIVERY_FEE = 2;
export const FREE_DELIVERY_OVER = 25;

export function computeTotals(lines: Line[], promo: string | null) {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = round2(lines.reduce((s, l) => s + lineTotal(l), 0));
  const discount = promo && PROMOS[promo] ? round2((subtotal * PROMOS[promo]) / 100) : 0;
  const delivery = subtotal === 0 ? 0 : subtotal - discount >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  return { count, subtotal, discount, delivery, total: round2(subtotal - discount + delivery) };
}

export function describeLine(l: Line) {
  const size = SIZES.find((s) => s.id === l.size)?.label ?? '';
  const extras = l.extras.map((id) => EXTRAS.find((e) => e.id === id)?.label).filter(Boolean);
  return [size, ...extras].join(' · ');
}
