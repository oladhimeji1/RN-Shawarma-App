import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';
import { FoodPlate } from '@/components/FoodPlate';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QtyStepper } from '@/components/QtyStepper';
import { T } from '@/components/T';
import { EXTRAS, getProduct, Product, SIZES, SizeId } from '@/data/menu';
import { buildOrderItems, useAuth, useCart, useCartTotals, useOrders, useSelectedAddress } from '@/store';
import { colors, f, shadow, TAB_BAR_CLEARANCE } from '@/theme';
import { success, tap } from '@/utils/haptics';
import { fmt } from '@/utils/money';
import {
  describeLine,
  FREE_DELIVERY_OVER,
  Line,
  lineTotal,
  PROMOS,
  unitPrice,
} from '@/utils/pricing';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((a) => a.user);
  const { lines, promo, setQty, updateLine, removeLine, clear, applyPromo, removePromo } = useCart();
  const totals = useCartTotals();
  const address = useSelectedAddress();
  const placeOrder = useOrders((o) => o.place);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);

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
        { text: 'Log in', onPress: () => useAuth.getState().signOut() },
      ]);
      return;
    }
    if (!address) {
      router.push('/address');
      return;
    }
    setPlacing(true);
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
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.white }}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {head}

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {lines.map((l) => {
            const p = getProduct(l.productId);
            if (!p) return null;
            return (
              <Animated.View key={l.key} layout={LinearTransition} entering={FadeInDown} style={[s.line, shadow(1)]}>
                <Pressable
                  onPress={() => setEditingLine(l)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${p.name}`}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <FoodPlate product={p} size={68} width={68} />
                </Pressable>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <T numberOfLines={1} style={{ fontFamily: f.bold, fontSize: 15.5, flex: 1 }}>{p.name}</T>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setEditingLine(l)}
                      style={s.editChip}
                      accessibilityLabel="Customize"
                    >
                      <Ionicons name="pencil" size={11} color={colors.orange} />
                      <T style={{ color: colors.orange, fontSize: 11, fontFamily: f.bold }}>Edit</T>
                    </Pressable>
                  </View>
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

      {/* Edit item modal */}
      {!!editingLine && (
        <EditCartItemModal
          line={editingLine}
          onClose={() => setEditingLine(null)}
          onSave={(updated) => {
            updateLine(editingLine.key, updated);
            setEditingLine(null);
            success();
          }}
          onRemove={() => {
            removeLine(editingLine.key);
            setEditingLine(null);
          }}
        />
      )}
    </View>
  );
}

function EditCartItemModal({
  line,
  onClose,
  onSave,
  onRemove,
}: {
  line: Line;
  onClose: () => void;
  onSave: (updated: { size: SizeId; extras: string[]; qty: number; note?: string }) => void;
  onRemove: () => void;
}) {
  const p = getProduct(line.productId);
  const [size, setSize] = useState<SizeId>(line.size);
  const [extras, setExtras] = useState<string[]>(line.extras);
  const [qty, setQty] = useState(line.qty);
  const [note, setNote] = useState(line.note ?? '');

  if (!p) return null;

  const toggleExtra = (eid: string) => {
    tap();
    setExtras((e) => (e.includes(eid) ? e.filter((x) => x !== eid) : [...e, eid]));
  };

  const currentUnitPrice = unitPrice(p, size, extras);
  const currentTotal = Math.round(currentUnitPrice * qty * 100) / 100;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Pressable style={s.modalBackdrop} onPress={onClose} />
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <FoodPlate product={p} size={54} width={54} />
              <View style={{ flex: 1 }}>
                <T numberOfLines={1} style={{ fontFamily: f.bold, fontSize: 17 }}>Edit {p.name}</T>
                <T style={{ color: colors.orange, fontFamily: f.bold, fontSize: 14 }}>{fmt(currentTotal)}</T>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={s.modalClose}>
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }} keyboardShouldPersistTaps="handled">
            <T style={s.modalSection}>Choose size</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SIZES.map((sz) => {
                const on = size === sz.id;
                return (
                  <Pressable
                    key={sz.id}
                    onPress={() => {
                      tap();
                      setSize(sz.id);
                    }}
                    style={[s.modalSize, on && s.modalSizeOn]}
                  >
                    <T style={{ fontFamily: f.bold, fontSize: 13, color: on ? colors.orange : colors.ink }}>{sz.label}</T>
                    <T style={{ fontSize: 11, fontFamily: f.semi, color: colors.mute, marginTop: 2 }}>
                      {sz.delta === 0 ? 'Standard' : `+${fmt(sz.delta)}`}
                    </T>
                  </Pressable>
                );
              })}
            </View>

            <T style={s.modalSection}>Extras</T>
            {EXTRAS.map((ex) => {
              const on = extras.includes(ex.id);
              return (
                <Pressable key={ex.id} onPress={() => toggleExtra(ex.id)} style={s.modalExtra}>
                  <View style={[s.modalCheck, on && { backgroundColor: colors.orange, borderColor: colors.orange }]}>
                    {on && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <T style={{ flex: 1, fontFamily: f.med, fontSize: 13.5 }}>{ex.label}</T>
                  <T style={{ color: colors.mute, fontFamily: f.semi, fontSize: 12.5 }}>
                    {ex.price === 0 ? 'Free' : `+${fmt(ex.price)}`}
                  </T>
                </Pressable>
              );
            })}

            <T style={s.modalSection}>Note for kitchen</T>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. no pickles, extra sauce"
              placeholderTextColor={colors.mute}
              maxLength={120}
              style={s.modalInput}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 }}>
              <T style={{ fontFamily: f.bold, fontSize: 15 }}>Quantity</T>
              <QtyStepper value={qty} min={1} max={20} onChange={setQty} />
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Pressable onPress={onRemove} style={s.removeBtn} accessibilityLabel="Remove item">
              <Ionicons name="trash-outline" size={19} color={colors.danger} />
            </Pressable>
            <PrimaryButton
              title={`Save · ${fmt(currentTotal)}`}
              onPress={() => onSave({ size, extras, qty, note: note.trim() || undefined })}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
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
  editChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.orangeSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
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
  // Modal styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalCard: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  modalClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  modalSection: { fontFamily: f.bold, fontSize: 14, marginTop: 14, marginBottom: 8 },
  modalSize: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: colors.line, padding: 10, alignItems: 'center' },
  modalSizeOn: { borderColor: colors.orange, backgroundColor: colors.orangeSoft },
  modalExtra: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  modalCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  modalInput: { height: 44, borderRadius: 14, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: f.med, fontSize: 13.5, color: colors.ink },
  removeBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFEBEB', alignItems: 'center', justifyContent: 'center' },
});
