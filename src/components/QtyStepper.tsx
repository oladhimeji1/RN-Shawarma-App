import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, f } from '@/theme';
import { tap } from '@/utils/haptics';
import { T } from './T';

type Props = { value: number; onChange: (n: number) => void; min?: number; max?: number; compact?: boolean };

export function QtyStepper({ value, onChange, min = 0, max = 20, compact }: Props) {
  const d = compact ? 30 : 38;
  const Btn = ({ icon, onPress, off, label }: { icon: 'add' | 'remove' | 'trash-outline'; onPress: () => void; off?: boolean; label: string }) => (
    <Pressable
      accessibilityLabel={label}
      disabled={off}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[s.btn, { width: d, height: d, borderRadius: d / 2 }, off && { opacity: 0.35 }]}
    >
      <Ionicons name={icon} size={compact ? 16 : 18} color={colors.ink} />
    </Pressable>
  );
  return (
    <View style={[s.wrap, { borderRadius: d / 2 + 4 }]}>
      <Btn
        icon={value <= 1 && min === 0 ? 'trash-outline' : 'remove'}
        label="Decrease quantity"
        off={value <= min}
        onPress={() => onChange(value - 1)}
      />
      <T style={{ fontFamily: f.bold, fontSize: 15, minWidth: 22, textAlign: 'center' }}>{value}</T>
      <Btn icon="add" label="Increase quantity" off={value >= max} onPress={() => onChange(value + 1)} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 3, gap: 2 },
  btn: { backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
