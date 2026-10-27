import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, f } from '@/theme';
import { T } from './T';

type Props = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: 'solid' | 'outline' | 'dark'; style?: ViewStyle };

export function PrimaryButton({ title, onPress, loading, disabled, variant = 'solid', style }: Props) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        s.btn,
        variant === 'solid' && { backgroundColor: colors.orange },
        variant === 'dark' && { backgroundColor: colors.dark },
        variant === 'outline' && { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.ink : '#fff'} />
      ) : (
        <T style={{ fontFamily: f.bold, fontSize: 16, color: variant === 'outline' ? colors.ink : '#fff' }}>{title}</T>
      )}
    </Pressable>
  );
}
const s = StyleSheet.create({
  btn: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
});
