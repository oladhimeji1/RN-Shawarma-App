import { Redirect } from 'expo-router';
import { useAuth } from '@/store';

/** Entry gate: onboarding once, then login (or guest), then the app. */
export default function Index() {
  const { seenOnboarding, user, guest } = useAuth();
  if (!seenOnboarding) return <Redirect href="/onboarding" />;
  if (!user && !guest) return <Redirect href="/login" />;
  return <Redirect href="/(tabs)" />;
}
