import { Redirect, Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { useAuth } from '@/store';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { user, guest } = useAuth();
  // Signing out (or a guest choosing "Log in") lands here and gets sent to the login screen.
  if (!user && !guest) return <Redirect href="/login" />;
  return (
    <Tabs tabBar={(p) => <FloatingTabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
