import { ComponentProps, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Tabs } from 'expo-router';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { useCartCount } from '@/store';
import { colors, f, shadow } from '@/theme';
import { tap } from '@/utils/haptics';
import { T } from './T';

type IconName = ComponentProps<typeof Ionicons>['name'];
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
const TABS: Record<string, { on: IconName; off: IconName; label: string }> = {
  index: { on: 'home', off: 'home-outline', label: 'Home' },
  chat: { on: 'chatbubble-ellipses', off: 'chatbubble-ellipses-outline', label: 'Support chat' },
  cart: { on: 'bag-handle', off: 'bag-handle-outline', label: 'Cart' },
  saved: { on: 'bookmark', off: 'bookmark-outline', label: 'Saved' },
  profile: { on: 'person', off: 'person-outline', label: 'Profile' },
};

function Badge({ count }: { count: number }) {
  const sc = useSharedValue(1);
  useEffect(() => {
    if (count > 0) sc.value = withSequence(withTiming(1.4, { duration: 110 }), withSpring(1, { damping: 8 }));
  }, [count, sc]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  if (count === 0) return null;
  return (
    <Animated.View style={[s.badge, st]}>
      <T style={s.badgeTxt}>{count > 9 ? '9+' : count}</T>
    </Animated.View>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();
  const count = useCartCount();
  if (keyboard) return null;

  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: Math.max(insets.bottom, 10) }]}>
      <View style={[s.bar, shadow(3)]}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const press = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              tap();
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={press}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={route.name === 'cart' && count > 0 ? `Cart, ${count} items` : tab.label}
              style={[s.item, focused && s.itemOn]}
            >
              <Ionicons name={focused ? tab.on : tab.off} size={21} color={focused ? '#fff' : '#B9B9C2'} />
              {route.name === 'cart' && <Badge count={count} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dark, borderRadius: 34, padding: 9 },
  item: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  itemOn: { backgroundColor: colors.orange },
  badge: { position: 'absolute', top: 1, right: 0, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: colors.dark },
  badgeTxt: { fontFamily: f.xbold, fontSize: 9.5, color: colors.orange, lineHeight: 12 },
});
