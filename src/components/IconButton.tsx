import { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '@/theme';

type Props = { icon: ComponentProps<typeof Ionicons>['name']; onPress: () => void; label: string; dot?: boolean; active?: boolean; floating?: boolean };

export function IconButton({ icon, onPress, label, dot, active, floating }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.btn, floating && shadow(2), pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={20} color={active ? colors.orange : colors.ink} />
      {dot && <View style={s.dot} />}
    </Pressable>
  );
}
const s = StyleSheet.create({
  btn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange, borderWidth: 1.5, borderColor: colors.white },
});
