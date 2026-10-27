import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthShell } from '@/components/AuthShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { T } from '@/components/T';
import { TextField } from '@/components/TextField';
import { requestPasswordReset } from '@/services/auth';
import { colors, f } from '@/theme';
import { isEmailOrPhone } from '@/utils/validation';

export default function ForgotPassword() {
  const router = useRouter();
  const [idf, setIdf] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!isEmailOrPhone(idf)) return setError('Enter the email or phone you signed up with.');
    setError(undefined);
    setLoading(true);
    await requestPasswordReset(idf);
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell compact back>
      {sent ? (
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <View style={s.badge}>
            <Ionicons name="mail-open-outline" size={32} color={colors.orange} />
          </View>
          <T style={s.h1}>Check your inbox</T>
          <T style={s.sub}>If an account exists for {idf.trim()}, we’ve sent a link to reset your password.</T>
          <PrimaryButton title="Back to log in" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: 8 }} />
          <PrimaryButton title="Send again" variant="outline" onPress={send} loading={loading} style={{ alignSelf: 'stretch', marginTop: 12 }} />
        </Animated.View>
      ) : (
        <>
          <T style={[s.h1, { textAlign: 'left' }]}>Reset your password</T>
          <T style={[s.sub, { textAlign: 'left' }]}>Enter your email or phone and we’ll send you a reset link.</T>
          <TextField icon="mail-outline" placeholder="Email or phone" value={idf} onChangeText={setIdf} error={error} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" returnKeyType="go" onSubmitEditing={send} />
          <PrimaryButton title="Send reset link" onPress={send} loading={loading} style={{ marginTop: 6 }} />
        </>
      )}
    </AuthShell>
  );
}

const s = StyleSheet.create({
  badge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  h1: { fontFamily: f.xbold, fontSize: 24, textAlign: 'center' },
  sub: { color: colors.mute, marginTop: 6, marginBottom: 22, lineHeight: 20, textAlign: 'center' },
});
