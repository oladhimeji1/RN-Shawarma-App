import { Redirect } from 'expo-router';

/** Entry gate: route to onboarding for editing and preview */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
