import { ComponentProps } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { T } from '@/components/T';
import { orderStatus, useOrders } from '@/store';
import { colors, f } from '@/theme';
import { fmt } from '@/utils/money';
import { FREE_DELIVERY_OVER } from '@/utils/pricing';

type Item = { icon: ComponentProps<typeof Ionicons>['name']; title: string; text: string };

// Static demo content + the latest order's status. Feed this from push/inbox data in a real build.
export default function Notifications() {
  const latest = useOrders((o) => o.orders[0]);
  const items: Item[] = [
    ...(latest ? [{ icon: 'bag-check-outline', title: `Order ${latest.id}`, text: `Status: ${orderStatus(latest.createdAt)}.` } as Item] : []),
    { icon: 'pricetag-outline', title: 'Welcome offer', text: 'Use code SHAWARMA10 at checkout for 10% off.' },
    { icon: 'bicycle-outline', title: 'Free delivery', text: `Orders over ${fmt(FREE_DELIVERY_OVER)} ship free.` },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScreenHeader title="Notifications" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {items.map((n, i) => (
          <View key={i} style={s.row}>
            <View style={s.icon}>
              <Ionicons name={n.icon} size={19} color={colors.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: f.bold }}>{n.title}</T>
              <T style={{ color: colors.mute, marginTop: 2, lineHeight: 19 }}>{n.text}</T>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, padding: 14, borderRadius: 20, backgroundColor: colors.surface },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' },
});
