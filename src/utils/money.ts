// One place to change currency.
export const CURRENCY = '$';
export const fmt = (n: number) => `${CURRENCY}${n.toFixed(2)}`;
