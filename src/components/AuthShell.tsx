import { ReactNode, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';
import { IconButton } from './IconButton';
import { T } from './T';

function Floaty({ emoji, style, delay, size = 34, rotate = 0 }: { emoji: string; style: object; delay: number; size?: number; rotate?: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-10, { duration: 1600 }), withTiming(0, { duration: 1600 })), -1));
  }, [delay, y]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { rotate: `${rotate}deg` }] }));
  return (
    <Animated.View style={[{ position: 'absolute' }, style, st]}>
      <T style={{ fontSize: size }}>{emoji}</T>
    </Animated.View>
  );
}

/** Peach hero + white bottom sheet used by login, sign up and forgot password. */
export function AuthShell({ children, compact, back }: { children: ReactNode; compact?: boolean; back?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const heroH = (compact ? 190 : 300) + insets.top;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.peach }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ height: heroH, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
          <T style={{ fontSize: compact ? 84 : 130 }}>🧑‍🍳</T>
          <Floaty emoji="🔪" delay={0} rotate={-25} style={{ left: 30, top: insets.top + 40 }} />
          <Floaty emoji="🧄" delay={400} style={{ right: 36, top: insets.top + 30 }} />
          <Floaty emoji="🌯" delay={800} size={40} rotate={12} style={{ left: 54, bottom: 60 }} />
          <Floaty emoji="🍅" delay={1200} size={30} style={{ right: 52, bottom: 70 }} />
          {back && (
            <View style={{ position: 'absolute', left: 16, top: insets.top + 8 }}>
              <IconButton icon="arrow-back" label="Go back" onPress={() => router.back()} />
            </View>
          )}
        </View>
        <Animated.View entering={SlideInDown.springify().damping(22)} style={s.sheet}>
          <View style={s.handle} />
          {children}
          <View style={{ height: Math.max(insets.bottom, 12) }} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  sheet: { flexGrow: 1, marginTop: -30, backgroundColor: colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: 18 },
});
