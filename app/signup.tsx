import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthShell } from '@/components/AuthShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SocialButtons } from '@/components/SocialButtons';
import { T } from '@/components/T';
import { TextField } from '@/components/TextField';
import { signUp } from '@/services/auth';
import { useAuth } from '@/store';
import { colors, f } from '@/theme';
import { isEmailOrPhone } from '@/utils/validation';

export default function SignUp() {
  const router = useRouter();
  const setUser = useAuth((a) => a.setUser);
  const [name, setName] = useState('');
  const [idf, setIdf] = useState('');
  const [pw, setPw] = useState('');
  const [errors, setErrors] = useState<{ name?: string; idf?: string; pw?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = 'Enter your name.';
    if (!isEmailOrPhone(idf)) next.idf = 'Enter a valid email or phone number.';
    if (pw.length < 8) next.pw = 'Use at least 8 characters.';
    setErrors(next);
    if (next.name || next.idf || next.pw) return;
    setLoading(true);
    try {
      setUser(await signUp({ name, identifier: idf, password: pw }));
      router.replace('/(tabs)');
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : 'Something went wrong. Try again.' });
      setLoading(false);
    }
  };

  return (
    <AuthShell compact back>
      <T style={s.h1}>Create your account</T>
      <T style={s.sub}>Save your addresses and reorder in two taps.</T>

      {!!errors.form && (
        <View style={s.banner} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <T style={{ flex: 1, color: colors.danger, fontFamily: f.med, fontSize: 13 }}>{errors.form}</T>
        </View>
      )}

      <TextField icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" textContentType="name" returnKeyType="next" />
      <TextField icon="mail-outline" placeholder="Email or phone" value={idf} onChangeText={setIdf} error={errors.idf} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="username" returnKeyType="next" />
      <TextField icon="lock-closed-outline" placeholder="Password (8+ characters)" value={pw} onChangeText={setPw} error={errors.pw} secure textContentType="newPassword" returnKeyType="go" onSubmitEditing={submit} />

      <PrimaryButton title="Sign up" onPress={submit} loading={loading} style={{ marginTop: 6 }} />
      <T style={s.terms}>By signing up you agree to our Terms and Privacy Policy.</T>

      <View style={s.divider}>
        <View style={s.line} />
        <T style={{ color: colors.mute, fontSize: 12 }}>Or sign up with</T>
        <View style={s.line} />
      </View>
      <SocialButtons />

      <View style={s.foot}>
        <T style={{ color: colors.mute }}>Already have an account? </T>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <T style={{ fontFamily: f.bold }}>Log in</T>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const s = StyleSheet.create({
  h1: { fontFamily: f.xbold, fontSize: 24 },
  sub: { color: colors.mute, marginTop: 4, marginBottom: 20 },
  banner: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FDECEC', borderRadius: 14, padding: 12, marginBottom: 14 },
  terms: { color: colors.mute, fontSize: 11.5, textAlign: 'center', marginTop: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
  foot: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
});
