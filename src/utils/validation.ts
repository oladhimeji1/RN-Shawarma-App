export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^\+?[0-9\s-]{7,16}$/.test(v.trim());
export const isEmailOrPhone = (v: string) => isEmail(v) || isPhone(v);
