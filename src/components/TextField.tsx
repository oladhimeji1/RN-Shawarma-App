import { ComponentProps, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, f } from '@/theme';
import { T } from './T';

type Props = TextInputProps & { icon: ComponentProps<typeof Ionicons>['name']; error?: string; secure?: boolean };

export function TextField({ icon, error, secure, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  const tint = error ? colors.danger : focused ? colors.orange : colors.mute;
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={[s.box, focused && s.focus, !!error && s.err]}>
        <Ionicons name={icon} size={19} color={tint} />
        <TextInput
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={colors.mute}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[s.input, style]}
        />
        {secure && (
          <Pressable hitSlop={10} onPress={() => setHidden((h) => !h)} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.mute} />
          </Pressable>
        )}
      </View>
      {!!error && <T style={s.errText}>{error}</T>}
    </View>
  );
}
const s = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, borderRadius: 16, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: 'transparent' },
  focus: { borderColor: colors.orange, backgroundColor: colors.white },
  err: { borderColor: colors.danger, backgroundColor: colors.white },
  input: { flex: 1, fontFamily: f.med, fontSize: 15, color: colors.ink, height: '100%' },
  errText: { color: colors.danger, fontSize: 12, marginTop: 5, marginLeft: 6, fontFamily: f.med },
});
