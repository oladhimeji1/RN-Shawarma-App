import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PrimaryButton } from '@/components/PrimaryButton';
import { T } from '@/components/T';
import { useSelectedAddress } from '@/store';
import { colors, f } from '@/theme';

export default function OrderSuccess() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const address = useSelectedAddress();
  return (
    <View style={[s.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={s.center}>
        <Animated.View entering={ZoomIn.springify().damping(11)} style={s.ring}>
          <Ionicons name="checkmark" size={56} color="#fff" />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(250)} style={{ alignItems: 'center' }}>
          <T style={s.h1}>Order placed</T>
          <T style={s.sub}>We’ve sent {id} to the kitchen. Estimated arrival: 25–35 min.</T>
          {!!address && <T style={[s.sub, { marginTop: 6 }]}>Delivering to {address.label}: {address.line}</T>}
        </Animated.View>
      </View>
      <View style={{ gap: 12, paddingHorizontal: 20 }}>
        <PrimaryButton title="View my orders" onPress={() => { router.replace('/(tabs)'); router.push('/orders'); }} />
        <PrimaryButton title="Back to menu" variant="outline" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  ring: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  h1: { fontFamily: f.xbold, fontSize: 28 },
  sub: { color: colors.mute, textAlign: 'center', lineHeight: 21, marginTop: 8 },
});
