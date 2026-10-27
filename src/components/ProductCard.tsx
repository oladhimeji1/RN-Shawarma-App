import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '@/data/menu';
import { useCart, useFavs } from '@/store';
import { colors, f, shadow } from '@/theme';
import { tap } from '@/utils/haptics';
import { CURRENCY } from '@/utils/money';
import { unitPrice } from '@/utils/pricing';
import { FoodPlate } from './FoodPlate';
import { T } from './T';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const faved = useFavs((s) => s.ids.includes(product.id));
  const toggleFav = useFavs((s) => s.toggle);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const price = unitPrice(product, 'wrap', []);
  const quickAdd = () => {
    tap();
    add({ productId: product.id, size: 'wrap', extras: [], qty: 1 });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 900);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${CURRENCY}${price.toFixed(2)}`}
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [s.card, shadow(1), pressed && { transform: [{ scale: 0.985 }] }]}
    >
      <Pressable
        hitSlop={8}
        onPress={() => {
          tap();
          toggleFav(product.id);
        }}
        accessibilityLabel={faved ? 'Remove from saved' : 'Save'}
        style={s.save}
      >
        <Ionicons name={faved ? 'bookmark' : 'bookmark-outline'} size={18} color={faved ? colors.orange : colors.mute} />
      </Pressable>

      <View style={{ alignItems: 'center', marginTop: 6 }}>
        <FoodPlate product={product} size={104} />
      </View>

      <View style={s.pill}>
        {product.discount ? (
          <T style={s.pillTxt}>-{product.discount}%</T>
        ) : (
          <>
            <Ionicons name="star" size={10} color={colors.orange} />
            <T style={s.pillTxt}>{product.rating.toFixed(1)}</T>
          </>
        )}
      </View>

      <T numberOfLines={1} style={s.name}>{product.name}</T>
      <T numberOfLines={1} style={s.blurb}>{product.blurb}</T>

      <View style={s.bottom}>
        <T style={s.price}>
          <T style={s.cur}>{CURRENCY}</T>
          {price.toFixed(2)}
        </T>
        <Pressable
          onPress={quickAdd}
          accessibilityLabel={`Add ${product.name} to cart`}
          style={[s.plus, added && { backgroundColor: colors.success }]}
        >
          <Ionicons name={added ? 'checkmark' : 'add'} size={18} color={added ? '#fff' : colors.ink} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 12 },
  save: { position: 'absolute', top: 12, right: 12, zIndex: 2 },
  pill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.dark, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3, marginTop: 10 },
  pillTxt: { color: '#fff', fontFamily: f.bold, fontSize: 10.5 },
  name: { fontFamily: f.bold, fontSize: 14.5, textAlign: 'center', marginTop: 8 },
  blurb: { color: colors.mute, fontSize: 11, textAlign: 'center', marginTop: 2 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  price: { fontFamily: f.xbold, fontSize: 18 },
  cur: { fontFamily: f.bold, fontSize: 11, color: colors.orange },
  plus: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
