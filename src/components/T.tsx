import { Text, TextProps } from 'react-native';
import { colors, f } from '@/theme';

/** Text with the app font + ink colour by default. Override via style. */
export function T({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ fontFamily: f.reg, color: colors.ink, fontSize: 14 }, style]} />;
}
