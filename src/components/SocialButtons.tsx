import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { socialSignIn } from '@/services/auth';
import { useAuth } from '@/store';
import { colors, f } from '@/theme';
import { T } from './T';

export function SocialButtons() {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  const go = async (provider: 'google' | 'apple') => {
    if (busy) return;
    setBusy(provider);
    try {
      setUser(await socialSignIn(provider));
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Couldn’t sign you in', 'Try again, or use your email and password.');
      setBusy(null);
    }
  };

  return (
    <View style={s.row}>
      <Pressable style={[s.btn, busy === 'google' && { opacity: 0.5 }]} onPress={() => go('google')} accessibilityLabel="Continue with Google">
        <Ionicons name="logo-google" size={18} color="#DB4437" />
        <T style={s.txt}>Google</T>
      </Pressable>
      <Pressable style={[s.btn, busy === 'apple' && { opacity: 0.5 }]} onPress={() => go('apple')} accessibilityLabel="Continue with Apple">
        <Ionicons name="logo-apple" size={20} color={colors.ink} />
        <T style={s.txt}>Apple</T>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.white },
  txt: { fontFamily: f.semi, fontSize: 14 },
});
