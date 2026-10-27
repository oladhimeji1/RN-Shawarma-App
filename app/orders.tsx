import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { T } from '@/components/T';
import { MENU } from '@/data/menu';
import { Order, orderStatus, useCart, useOrders } from '@/store';
import { colors, f, shadow } from '@/theme';
import { success, tap } from '@/utils/haptics';
import { fmt } from '@/utils/money';

const STATUS_COLOR = {
  Preparing: '#B7791F',
  'On the way': colors.orange,
  Delivered: colors.success,
} as const;

const STATUS_STEPS = ['Order placed', 'Preparing', 'On the way', 'Delivered'] as const;

export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const orders = useOrders((o) => o.orders);
  const addToCart = useCart((s) => s.add);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    tap();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reorder = (order: Order) => {
    tap();
    order.items.forEach((it) => {
      // Find matching product in menu by name
      const p = MENU.find((m) => m.name.toLowerCase() === it.name.toLowerCase());
      if (p) {
        addToCart({
          productId: p.id,
          size: 'wrap',
          extras: [],
          qty: it.qty,
        });
      }
    });
    success();
    router.navigate('/(tabs)/cart');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScreenHeader title="Order history" />
      {orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No orders yet"
          text="Your orders will show up here once you place one."
          cta="Browse the menu"
          onCta={() => router.navigate('/(tabs)')}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
          {orders.map((o) => {
            const status = orderStatus(o.createdAt);
            const isExpanded = !!expandedIds[o.id];
            const itemCount = o.items.reduce((acc, it) => acc + it.qty, 0);

            // Step index for progress (0 = Placed, 1 = Preparing, 2 = On the way, 3 = Delivered)
            const activeStep = status === 'Preparing' ? 1 : status === 'On the way' ? 2 : 3;

            return (
              <Animated.View key={o.id} layout={LinearTransition} style={[s.card, shadow(1)]}>
                {/* Header row - clickable to expand / collapse */}
                <Pressable
                  onPress={() => toggle(o.id)}
                  style={s.top}
                  accessibilityRole="button"
                  accessibilityLabel={`Order ${o.id}, ${status}. Tap to ${isExpanded ? 'collapse' : 'expand'}`}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <T style={{ fontFamily: f.xbold, fontSize: 16 }}>{o.id}</T>
                      <View style={[s.status, { backgroundColor: `${STATUS_COLOR[status]}1A` }]}>
                        <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[status] }]} />
                        <T style={{ color: STATUS_COLOR[status], fontFamily: f.bold, fontSize: 11 }}>{status}</T>
                      </View>
                    </View>
                    <T style={{ color: colors.mute, fontSize: 12, marginTop: 4 }}>
                      {new Date(o.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </T>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <T style={{ fontFamily: f.xbold, fontSize: 16 }}>{fmt(o.total)}</T>
                    <View style={s.chevronCircle}>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.ink}
                      />
                    </View>
                  </View>
                </Pressable>

                {/* Collapsed preview line */}
                {!isExpanded && (
                  <Pressable onPress={() => toggle(o.id)} style={s.previewRow}>
                    <T numberOfLines={1} style={{ color: colors.mute, fontSize: 13, flex: 1 }}>
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} · {o.items.map((i) => i.name).join(', ')}
                    </T>
                    <T style={{ color: colors.orange, fontFamily: f.bold, fontSize: 12 }}>Details</T>
                  </Pressable>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <Animated.View entering={FadeIn.duration(200)} style={s.expandedBody}>
                    <View style={s.divider} />

                    {/* Status Tracker */}
                    <T style={s.sectionTitle}>Order status</T>
                    <View style={s.tracker}>
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= activeStep;
                        const isCurrent = idx === activeStep;
                        return (
                          <View key={step} style={s.trackerStep}>
                            <View style={s.trackerDotContainer}>
                              <View
                                style={[
                                  s.trackerDot,
                                  isDone && { backgroundColor: colors.orange },
                                  isCurrent && { borderWidth: 3, borderColor: colors.orangeSoft },
                                ]}
                              />
                              {idx < STATUS_STEPS.length - 1 && (
                                <View style={[s.trackerLine, idx < activeStep && { backgroundColor: colors.orange }]} />
                              )}
                            </View>
                            <T style={[s.trackerLabel, isDone && { color: colors.ink, fontFamily: f.bold }]}>
                              {step}
                            </T>
                          </View>
                        );
                      })}
                    </View>

                    {/* Order items */}
                    <T style={s.sectionTitle}>Items ({itemCount})</T>
                    <View style={{ gap: 10 }}>
                      {o.items.map((it, i) => (
                        <View key={i} style={s.itemRow}>
                          <View style={s.qtyTag}>
                            <T style={{ fontFamily: f.bold, fontSize: 12, color: colors.orange }}>{it.qty}×</T>
                          </View>
                          <View style={{ flex: 1 }}>
                            <T style={{ fontFamily: f.bold, fontSize: 14 }}>{it.name}</T>
                            {!!it.detail && (
                              <T style={{ color: colors.mute, fontSize: 12, marginTop: 2 }}>
                                {it.detail}
                              </T>
                            )}
                          </View>
                          <T style={{ fontFamily: f.semi, fontSize: 14 }}>{fmt(it.price)}</T>
                        </View>
                      ))}
                    </View>

                    {/* Delivery Address */}
                    <T style={s.sectionTitle}>Delivery location</T>
                    <View style={s.addressBox}>
                      <Ionicons name="location-outline" size={18} color={colors.orange} />
                      <T style={{ flex: 1, fontSize: 13, fontFamily: f.med, color: colors.ink }}>
                        {o.address}
                      </T>
                    </View>

                    {/* Actions */}
                    <View style={s.actionsRow}>
                      <PrimaryButton
                        title="Reorder items"
                        onPress={() => reorder(o)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 16,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  expandedBody: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: f.bold,
    fontSize: 13,
    color: colors.mute,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  tracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  trackerStep: {
    alignItems: 'center',
    flex: 1,
  },
  trackerDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: 6,
  },
  trackerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.line,
    zIndex: 2,
  },
  trackerLine: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.line,
    top: 5,
    zIndex: 1,
  },
  trackerLabel: {
    fontSize: 10.5,
    color: colors.mute,
    textAlign: 'center',
    fontFamily: f.med,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 14,
  },
  qtyTag: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 14,
  },
  actionsRow: {
    marginTop: 16,
  },
});
