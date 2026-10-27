import { View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Product } from '@/data/menu';
import { ProductCard } from './ProductCard';

const PAD = 16;
const GAP = 12;

/** Two-column grid. Change `animKey` to replay the staggered entrance (e.g. on category change). */
export function ProductGrid({ items, animKey }: { items: Product[]; animKey: string }) {
  const { width } = useWindowDimensions();
  const cardW = (width - PAD * 2 - GAP) / 2;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: PAD }}>
      {items.map((p, i) => (
        <Animated.View
          key={`${animKey}:${p.id}`}
          entering={FadeInDown.delay(Math.min(i, 8) * 55).springify().damping(18)}
          style={{ width: cardW }}
        >
          <ProductCard product={p} />
        </Animated.View>
      ))}
    </View>
  );
}
