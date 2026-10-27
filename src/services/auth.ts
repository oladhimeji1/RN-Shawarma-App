/**
 * MOCK auth service. Everything here runs on-device so the app works with no backend.
 * Swap each function body for a fetch() to your Express API and keep the signatures:
 *   POST /auth/signin, /auth/signup, /auth/forgot, /auth/social
 * Never keep real passwords on the device, and hash them server-side.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = { id: string; name: string; email?: string; phone?: string; provider: 'password' | 'google' | 'apple' };
type Stored = User & { password: string };

export class AuthError extends Error {}

const KEY = 'mock_users_v1';
const wait = (ms = 900) => new Promise((r) => setTimeout(r, ms));
const norm = (s?: string) => (s ?? '').trim().toLowerCase().replace(/[\s-]+/g, '');
const strip = ({ password: _p, ...u }: Stored): User => u;
const isEmailLike = (v: string) => v.includes('@');

async function readUsers(): Promise<Stored[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) return JSON.parse(raw) as Stored[];
  const seed: Stored[] = [
    { id: 'demo', name: 'Demo User', email: 'demo@shawarma.app', password: 'demo1234', provider: 'password' },
  ];
  await AsyncStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}
const findBy = (users: Stored[], idf: string) =>
  users.find((u) => norm(u.email) === norm(idf) || (u.phone && norm(u.phone) === norm(idf)));

export async function signIn(identifier: string, password: string): Promise<User> {
  await wait();
  const user = findBy(await readUsers(), identifier);
  if (!user) throw new AuthError('No account found with those details. Sign up to create one.');
  if (user.password !== password) throw new AuthError('Wrong password. Try again or reset it.');
  return strip(user);
}

export async function signUp(input: { name: string; identifier: string; password: string }): Promise<User> {
  await wait();
  const users = await readUsers();
  if (findBy(users, input.identifier)) throw new AuthError('An account with these details already exists. Log in instead.');
  const user: Stored = {
    id: `u_${Date.now()}`,
    name: input.name.trim(),
    password: input.password,
    provider: 'password',
    ...(isEmailLike(input.identifier) ? { email: input.identifier.trim() } : { phone: input.identifier.trim() }),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([...users, user]));
  return strip(user);
}

/** Resolves the same way whether or not the account exists, so it can't be used to probe for users. */
export async function requestPasswordReset(_identifier: string): Promise<void> {
  await wait(1000);
}

/**
 * Stub for Google / Apple. To make it real:
 *  - Google: expo-auth-session (or @react-native-google-signin/google-signin) -> send the ID token to your API
 *  - Apple:  expo-apple-authentication (iOS only) -> send the identity token to your API
 */
export async function socialSignIn(provider: 'google' | 'apple'): Promise<User> {
  await wait(800);
  return {
    id: `${provider}_demo`,
    name: provider === 'google' ? 'Google User' : 'Apple User',
    email: `${provider}.user@example.com`,
    provider,
  };
}
