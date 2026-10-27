import { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, f } from '@/theme';
import { PrimaryButton } from './PrimaryButton';
import { T } from './T';

type Props = { icon: ComponentProps<typeof Ionicons>['name']; title: string; text: string; cta?: string; onCta?: () => void };

export function EmptyState({ icon, title, text, cta, onCta }: Props) {
  return (
    <View style={s.wrap}>
      <View style={s.badge}>
        <Ionicons name={icon} size={30} color={colors.orange} />
      </View>
      <T style={{ fontFamily: f.bold, fontSize: 18, marginTop: 16 }}>{title}</T>
      <T style={{ color: colors.mute, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>{text}</T>
      {cta && onCta && <PrimaryButton title={cta} onPress={onCta} style={{ marginTop: 20, alignSelf: 'stretch' }} />}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 36, paddingVertical: 48 },
  badge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' },
});
