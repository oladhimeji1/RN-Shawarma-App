import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { f } from '@/theme';
import { IconButton } from './IconButton';
import { T } from './T';

export function ScreenHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[s.wrap, { paddingTop: insets.top + 8 }]}>
      <IconButton icon="arrow-back" label="Go back" onPress={() => router.back()} />
      <T style={s.title}>{title}</T>
      <View style={{ width: 42 }} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  title: { fontFamily: f.bold, fontSize: 17 },
});
