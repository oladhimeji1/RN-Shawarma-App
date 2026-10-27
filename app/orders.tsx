import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { T } from '@/components/T';
import { orderStatus, useOrders } from '@/store';
import { colors, f } from '@/theme';
import { fmt } from '@/utils/money';

const STATUS_COLOR = { Preparing: '#B7791F', 'On the way': colors.orange, Delivered: colors.success } as const;

export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const orders = useOrders((o) => o.orders);
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScreenHeader title="Order history" />
      {orders.length === 0 ? (
        <EmptyState icon="receipt-outline" title="No orders yet" text="Your orders will show up here once you place one." cta="Browse the menu" onCta={() => router.navigate('/(tabs)')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
          {orders.map((o) => {
            const status = orderStatus(o.createdAt);
            return (
              <View key={o.id} style={s.card}>
                <View style={s.top}>
                  <T style={{ fontFamily: f.bold, fontSize: 15 }}>{o.id}</T>
                  <View style={[s.status, { backgroundColor: `${STATUS_COLOR[status]}1F` }]}>
                    <T style={{ color: STATUS_COLOR[status], fontFamily: f.bold, fontSize: 11.5 }}>{status}</T>
                  </View>
                </View>
                <T style={{ color: colors.mute, fontSize: 12, marginTop: 2 }}>{new Date(o.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</T>
                <View style={{ marginTop: 10, gap: 4 }}>
                  {o.items.map((it, i) => (
                    <T key={i} numberOfLines={1}>{it.qty} × {it.name}{it.detail ? <T style={{ color: colors.mute }}> · {it.detail}</T> : null}</T>
                  ))}
                </View>
                <View style={s.foot}>
                  <T numberOfLines={1} style={{ color: colors.mute, fontSize: 12, flex: 1 }}>{o.address}</T>
                  <T style={{ fontFamily: f.xbold, fontSize: 16 }}>{fmt(o.total)}</T>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 1, borderColor: colors.line, padding: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
});
