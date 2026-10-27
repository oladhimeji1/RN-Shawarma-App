import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';
import { FoodPlate } from '@/components/FoodPlate';
import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QtyStepper } from '@/components/QtyStepper';
import { T } from '@/components/T';
import { EXTRAS, getProduct, SIZES, SizeId } from '@/data/menu';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { useCart, useFavs } from '@/store';
import { colors, f, shadow } from '@/theme';
import { success, tap } from '@/utils/haptics';
import { fmt } from '@/utils/money';
import { listPrice, unitPrice } from '@/utils/pricing';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(String(id));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();
  const add = useCart((c) => c.add);
  const faved = useFavs((s) => (product ? s.ids.includes(product.id) : false));
  const toggleFav = useFavs((s) => s.toggle);

  const [size, setSize] = useState<SizeId>('wrap');
  const [extras, setExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.white }}>
        <EmptyState icon="alert-circle-outline" title="Item not found" text="This item is no longer on the menu." cta="Back to menu" onCta={() => router.back()} />
      </View>
    );
  }

  const unit = unitPrice(product, size, extras);
  const was = listPrice(product, size, extras);
  const total = Math.round(unit * qty * 100) / 100;
  const toggleExtra = (eid: string) => {
    tap();
    setExtras((e) => (e.includes(eid) ? e.filter((x) => x !== eid) : [...e, eid]));
  };

  const addToCart = () => {
    if (added) return;
    add({ productId: product.id, size, extras, qty, note: note.trim() || undefined });
    success();
    setAdded(true);
    timer.current = setTimeout(() => router.back(), 650);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 150 }}>
        <LinearGradient colors={['#FFE1D0', '#FFF6F0']} style={{ height: 300 + insets.top, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
          <Animated.View entering={ZoomIn.springify().damping(14)}>
            <FoodPlate product={product} size={210} />
          </Animated.View>
        </LinearGradient>

        <View style={s.sheet}>
          <View style={s.titleRow}>
            <T style={s.name}>{product.name}</T>
            <View style={{ alignItems: 'flex-end' }}>
              <T style={s.price}>{fmt(unit)}</T>
              {!!product.discount && <T style={s.was}>{fmt(was)}</T>}
            </View>
          </View>
          {!!product.discount && (
            <View style={s.off}>
              <T style={{ color: '#fff', fontFamily: f.bold, fontSize: 11 }}>{product.discount}% off</T>
            </View>
          )}

          <View style={s.meta}>
            <Meta icon="star" tint={colors.orange} text={`${product.rating.toFixed(1)} (${product.reviews})`} />
            <Meta icon="time-outline" text={`${product.prepMin} min`} />
            <Meta icon="flame-outline" text={`${product.kcal} kcal`} />
          </View>

          <T style={s.desc}>{product.description}</T>

          <T style={s.section}>Choose size</T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {SIZES.map((sz) => {
              const on = size === sz.id;
              return (
                <Pressable key={sz.id} onPress={() => { tap(); setSize(sz.id); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.size, on && s.sizeOn]}>
                  <T style={{ fontFamily: f.bold, color: on ? colors.orange : colors.ink }}>{sz.label}</T>
                  <T style={{ fontSize: 11, color: colors.mute, marginTop: 2 }}>{sz.hint}</T>
                  <T style={{ fontSize: 12, fontFamily: f.semi, marginTop: 6 }}>{sz.delta === 0 ? 'Included' : `+${fmt(sz.delta)}`}</T>
                </Pressable>
              );
            })}
          </View>

          <T style={s.section}>Add extras</T>
          {EXTRAS.map((ex) => {
            const on = extras.includes(ex.id);
            return (
              <Pressable key={ex.id} onPress={() => toggleExtra(ex.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={s.extra}>
                <View style={[s.check, on && { backgroundColor: colors.orange, borderColor: colors.orange }]}>{on && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
                <T style={{ flex: 1, fontFamily: f.med }}>{ex.label}</T>
                <T style={{ color: colors.mute, fontFamily: f.semi }}>{ex.price === 0 ? 'Free' : `+${fmt(ex.price)}`}</T>
              </Pressable>
            );
          })}

          <T style={s.section}>Note for the kitchen</T>
          <TextInput value={note} onChangeText={setNote} placeholder="e.g. no pickles, extra crispy" placeholderTextColor={colors.mute} multiline maxLength={120} style={s.note} />
        </View>
      </ScrollView>

      <View style={[s.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <IconButton icon="arrow-back" label="Go back" floating onPress={() => router.back()} />
        <IconButton icon={faved ? 'bookmark' : 'bookmark-outline'} label={faved ? 'Remove from saved' : 'Save'} floating active={faved} onPress={() => { tap(); toggleFav(product.id); }} />
      </View>

      {!keyboard && (
        <Animated.View entering={FadeInDown.delay(150)} style={[s.bar, shadow(3), { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <QtyStepper value={qty} min={1} onChange={setQty} />
          <PrimaryButton style={{ flex: 1, backgroundColor: added ? colors.success : colors.orange }} title={added ? 'Added to cart' : `Add to cart · ${fmt(total)}`} onPress={addToCart} />
        </Animated.View>
      )}
    </View>
  );
}

function Meta({ icon, text, tint }: { icon: 'star' | 'time-outline' | 'flame-outline'; text: string; tint?: string }) {
  return (
    <View style={s.metaItem}>
      <Ionicons name={icon} size={14} color={tint ?? colors.mute} />
      <T style={{ fontSize: 12.5, fontFamily: f.semi }}>{text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  sheet: { marginTop: -28, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  name: { flex: 1, fontFamily: f.xbold, fontSize: 25, lineHeight: 30, letterSpacing: -0.4 },
  price: { fontFamily: f.xbold, fontSize: 22, color: colors.orange },
  was: { color: colors.mute, textDecorationLine: 'line-through', fontSize: 13 },
  off: { alignSelf: 'flex-start', backgroundColor: colors.dark, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3, marginTop: 4 },
  meta: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 7 },
  desc: { color: colors.mute, lineHeight: 22, marginTop: 16, fontSize: 14.5 },
  section: { fontFamily: f.bold, fontSize: 16, marginTop: 26, marginBottom: 12 },
  size: { flex: 1, borderRadius: 18, borderWidth: 1.5, borderColor: colors.line, padding: 12, alignItems: 'center' },
  sizeOn: { borderColor: colors.orange, backgroundColor: colors.orangeSoft },
  extra: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  note: { minHeight: 76, borderRadius: 18, backgroundColor: colors.surface, padding: 14, fontFamily: f.med, fontSize: 14, color: colors.ink, textAlignVertical: 'top' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 14, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
});
