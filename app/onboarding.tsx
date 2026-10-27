import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '@/components/PrimaryButton';
import { T } from '@/components/T';
import { useAuth } from '@/store';
import { colors, f } from '@/theme';

const SLIDES = [
  { emoji: '🌯', bg: '#FFE3D2', title: 'Carved fresh, every order', text: 'Real spit-roasted shawarma, wrapped warm in saj bread the moment you order.' },
  { emoji: '🧄', bg: '#FFF0C9', title: 'Build it your way', text: 'Pick your size, add extra toum or cheese, and leave a note for the kitchen.' },
  { emoji: '🛵', bg: '#DDF0E4', title: 'Hot at your door', text: 'Save your addresses, check out in a few taps and follow your order from the kitchen to you.' },
];

function Dot({ i, x, w }: { i: number; x: { value: number }; w: number }) {
  const st = useAnimatedStyle(() => ({
    width: interpolate(x.value, [(i - 1) * w, i * w, (i + 1) * w], [8, 26, 8], Extrapolation.CLAMP),
    opacity: interpolate(x.value, [(i - 1) * w, i * w, (i + 1) * w], [0.3, 1, 0.3], Extrapolation.CLAMP),
  }));
  return <Animated.View style={[s.dot, st]} />;
}

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const finish = useAuth((a) => a.finishOnboarding);
  const list = useRef<FlatList>(null);
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });
  const done = () => {
    finish();
    router.replace('/login');
  };

  return (
    <View style={[s.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={s.top}>
        {!last && (
          <Pressable onPress={done} hitSlop={12} accessibilityRole="button">
            <T style={{ fontFamily: f.semi, color: colors.mute }}>Skip</T>
          </Pressable>
        )}
      </View>

      <Animated.FlatList
        ref={list as never}
        data={SLIDES}
        keyExtractor={(i) => i.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' }}>
            <View style={[s.hero, { backgroundColor: item.bg }]}>
              <T style={{ fontSize: 120 }}>{item.emoji}</T>
            </View>
            <T style={s.title}>{item.title}</T>
            <T style={s.text}>{item.text}</T>
          </View>
        )}
      />

      <View style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <Dot key={i} i={i} x={x} w={width} />
          ))}
        </View>
        <PrimaryButton
          title={last ? 'Get started' : 'Next'}
          onPress={() => (last ? done() : list.current?.scrollToIndex({ index: index + 1, animated: true }))}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: { height: 40, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 24 },
  hero: { width: 260, height: 260, borderRadius: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
  title: { fontFamily: f.xbold, fontSize: 27, textAlign: 'center', lineHeight: 33 },
  text: { color: colors.mute, textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 320 },
  footer: { paddingHorizontal: 24, gap: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.orange },
});
