import { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '@/components/PrimaryButton';
import { T } from '@/components/T';
import { useAuth, useOrders, useSelectedAddress } from '@/store';
import { colors, f, TAB_BAR_CLEARANCE } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function Row({ icon, label, value, onPress }: { icon: IconName; label: string; value?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.surface }]}>
      <View style={s.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.orange} />
      </View>
      <T style={{ flex: 1, fontFamily: f.semi }}>{label}</T>
      {!!value && <T numberOfLines={1} style={{ color: colors.mute, maxWidth: 140, fontSize: 12.5 }}>{value}</T>}
      <Ionicons name="chevron-forward" size={17} color={colors.mute} />
    </Pressable>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const address = useSelectedAddress();
  const orderCount = useOrders((o) => o.orders.length);

  const logout = () =>
    Alert.alert('Log out?', 'You can log back in anytime.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: signOut }]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.white }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }} showsVerticalScrollIndicator={false}>
      <T style={s.h1}>Profile</T>

      <View style={s.card}>
        <View style={s.avatar}>
          {user ? <T style={{ fontFamily: f.xbold, color: '#fff', fontSize: 24 }}>{user.name.trim().charAt(0).toUpperCase()}</T> : <Ionicons name="person" size={26} color="#fff" />}
        </View>
        <View style={{ flex: 1 }}>
          <T style={{ fontFamily: f.bold, fontSize: 17 }}>{user ? user.name : 'Guest'}</T>
          <T numberOfLines={1} style={{ color: colors.mute, marginTop: 2 }}>{user ? (user.email ?? user.phone ?? '') : 'Log in to save addresses and place orders.'}</T>
        </View>
      </View>

      {!user && (
        <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 14 }}>
          <PrimaryButton title="Log in" onPress={() => signOut()} />
        </View>
      )}

      <View style={{ marginTop: 18 }}>
        <Row icon="location-outline" label="Delivery addresses" value={address?.label} onPress={() => router.push('/address')} />
        <Row icon="receipt-outline" label="Order history" value={orderCount ? `${orderCount}` : undefined} onPress={() => router.push('/orders')} />
        <Row icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
        <Row icon="chatbubble-ellipses-outline" label="Support chat" onPress={() => router.navigate('/(tabs)/chat')} />
      </View>

      {!!user && (
        <Pressable onPress={logout} style={s.logout} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={19} color={colors.danger} />
          <T style={{ color: colors.danger, fontFamily: f.bold }}>Log out</T>
        </Pressable>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  h1: { fontFamily: f.xbold, fontSize: 28, letterSpacing: -0.5, paddingHorizontal: 20, marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, padding: 16, borderRadius: 24, backgroundColor: colors.surface },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 15 },
  rowIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14 },
});
