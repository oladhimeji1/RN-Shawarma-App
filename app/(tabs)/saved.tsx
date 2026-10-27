import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';
import { ProductGrid } from '@/components/ProductGrid';
import { T } from '@/components/T';
import { MENU } from '@/data/menu';
import { useFavs } from '@/store';
import { colors, f, TAB_BAR_CLEARANCE } from '@/theme';

export default function Saved() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ids = useFavs((s) => s.ids);
  const items = MENU.filter((p) => ids.includes(p.id));
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.arc }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={s.head}>
        <T style={s.h1}>Saved</T>
        {items.length > 0 && <T style={{ color: colors.mute }}>{items.length} {items.length === 1 ? 'item' : 'items'}</T>}
      </View>
      {items.length === 0 ? (
        <EmptyState icon="bookmark-outline" title="Nothing saved yet" text="Tap the bookmark on any item and it will show up here for quick reordering." cta="Browse the menu" onCta={() => router.navigate('/(tabs)')} />
      ) : (
        <ProductGrid items={items} animKey="saved" />
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  h1: { fontFamily: f.xbold, fontSize: 28, letterSpacing: -0.5 },
});
