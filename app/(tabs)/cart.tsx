import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';
import { FoodPlate } from '@/components/FoodPlate';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QtyStepper } from '@/components/QtyStepper';
import { T } from '@/components/T';
import { getProduct } from '@/data/menu';
import { buildOrderItems, useAuth, useCart, useCartTotals, useOrders, useSelectedAddress } from '@/store';
import { colors, f, shadow, TAB_BAR_CLEARANCE } from '@/theme';
import { success } from '@/utils/haptics';
import { fmt } from '@/utils/money';
import { describeLine, FREE_DELIVERY_OVER, lineTotal, PROMOS } from '@/utils/pricing';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((a) => a.user);
  const { lines, promo, setQty, clear, applyPromo, removePromo } = useCart();
  const totals = useCartTotals();
  const address = useSelectedAddress();
  const placeOrder = useOrders((o) => o.place);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [placing, setPlacing] = useState(false);

  const apply = () => {
    if (!code.trim()) return;
    const ok = applyPromo(code);
    setCodeError(!ok);
    if (ok) setCode('');
  };

  const checkout = () => {
    if (!user) {
      Alert.alert('Log in to order', 'Create an account or log in to place your order. Your cart will be kept.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Log in', onPress: () => useAuth.getState().signOut() }, // tabs layout redirects to /login
      ]);
      return;
    }
    if (!address) {
      router.push('/address');
      return;
    }
    setPlacing(true);
    // Simulated network call. Replace with POST /orders on your API.
    setTimeout(() => {
      const id = placeOrder({ total: totals.total, address: `${address.label} · ${address.line}`, items: buildOrderItems(lines) });
      success();
      clear();
      setPlacing(false);
      router.replace(`/order-success?id=${id}`);
    }, 900);
  };

  const head = (
    <View style={s.head}>
      <T style={s.h1}>Your cart</T>
      {lines.length > 0 && (
        <Pressable
          hitSlop={10}
          onPress={() => Alert.alert('Clear cart?', 'This removes everything from your cart.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: clear }])}
        >
          <T style={{ color: colors.orange, fontFamily: f.bold }}>Clear</T>
        </Pressable>
      )}
    </View>
  );

  if (lines.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top + 16 }}>
        {head}
        <EmptyState icon="bag-handle-outline" title="Your cart is empty" text="Add a wrap or two and it will show up here." cta="Browse the menu" onCta={() => router.navigate('/(tabs)')} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.white }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 24 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {head}

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {lines.map((l) => {
          const p = getProduct(l.productId);
          if (!p) return null;
          return (
            <Animated.View key={l.key} layout={LinearTransition} entering={FadeInDown} style={[s.line, shadow(1)]}>
              <FoodPlate product={p} size={64} />
              <View style={{ flex: 1 }}>
                <T numberOfLines={1} style={{ fontFamily: f.bold, fontSize: 15 }}>{p.name}</T>
                <T numberOfLines={2} style={{ color: colors.mute, fontSize: 12, marginTop: 2 }}>{describeLine(l)}</T>
                {!!l.note && <T numberOfLines={1} style={{ color: colors.mute, fontSize: 11.5, fontStyle: 'italic', marginTop: 2 }}>“{l.note}”</T>}
                <View style={s.lineBottom}>
                  <T style={{ fontFamily: f.xbold, fontSize: 16, color: colors.orange }}>{fmt(lineTotal(l))}</T>
                  <QtyStepper compact value={l.qty} onChange={(n) => setQty(l.key, n)} />
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={s.section}>
        <T style={s.label}>Promo code</T>
        {promo ? (
          <View style={s.applied}>
            <Ionicons name="pricetag" size={16} color={colors.success} />
            <T style={{ flex: 1, fontFamily: f.bold, color: colors.success }}>{promo} · {PROMOS[promo]}% off</T>
            <Pressable onPress={removePromo} hitSlop={10} accessibilityLabel="Remove promo code">
              <Ionicons name="close" size={18} color={colors.mute} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.promoRow}>
              <TextInput
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setCodeError(false);
                }}
                placeholder="Enter code"
                placeholderTextColor={colors.mute}
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={apply}
                style={s.promoInput}
              />
              <Pressable onPress={apply} style={s.apply}>
                <T style={{ color: '#fff', fontFamily: f.bold }}>Apply</T>
              </Pressable>
            </View>
            {codeError && <T style={{ color: colors.danger, fontSize: 12, marginTop: 6, marginLeft: 6 }}>That code isn’t valid.</T>}
          </>
        )}
      </View>

      <Pressable style={[s.section, s.addrRow]} onPress={() => router.push('/address')} accessibilityRole="button">
        <View style={s.addrIcon}>
          <Ionicons name="location" size={18} color={colors.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <T style={{ color: colors.mute, fontSize: 11 }}>Deliver to</T>
          <T numberOfLines={1} style={{ fontFamily: f.bold }}>{address ? `${address.label} · ${address.line}` : 'Add a delivery address'}</T>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mute} />
      </Pressable>

      <View style={s.section}>
        <Row label="Subtotal" value={fmt(totals.subtotal)} />
        {totals.discount > 0 && <Row label="Promo" value={`-${fmt(totals.discount)}`} accent />}
        <Row label="Delivery" value={totals.delivery === 0 ? 'Free' : fmt(totals.delivery)} />
        {totals.delivery > 0 && <T style={{ color: colors.mute, fontSize: 11.5, marginTop: -2, marginBottom: 6 }}>Free delivery on orders over {fmt(FREE_DELIVERY_OVER)}</T>}
        <View style={s.hr} />
        <Row label="Total" value={fmt(totals.total)} big />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <PrimaryButton title={user ? `Place order · ${fmt(totals.total)}` : 'Log in to order'} onPress={checkout} loading={placing} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <View style={s.row}>
      <T style={{ color: big ? colors.ink : colors.mute, fontFamily: big ? f.bold : f.med, fontSize: big ? 17 : 14 }}>{label}</T>
      <T style={{ fontFamily: big ? f.xbold : f.semi, fontSize: big ? 19 : 14, color: accent ? colors.success : colors.ink }}>{value}</T>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  h1: { fontFamily: f.xbold, fontSize: 28, letterSpacing: -0.5 },
  line: { flexDirection: 'row', gap: 14, backgroundColor: colors.white, borderRadius: 22, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  lineBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  section: { marginHorizontal: 16, marginTop: 20 },
  label: { fontFamily: f.bold, marginBottom: 8 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: { flex: 1, height: 48, borderRadius: 24, backgroundColor: colors.surface, paddingHorizontal: 18, fontFamily: f.semi, fontSize: 14, color: colors.ink },
  apply: { height: 48, borderRadius: 24, backgroundColor: colors.dark, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  applied: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 24, backgroundColor: '#E6F6EE', paddingHorizontal: 16 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 14 },
  addrIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  hr: { height: 1, backgroundColor: colors.line, marginVertical: 6 },
});
