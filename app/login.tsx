import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { AuthShell } from "@/components/AuthShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SocialButtons } from "@/components/SocialButtons";
import { T } from "@/components/T";
import { TextField } from "@/components/TextField";
import { signIn } from "@/services/auth";
import { useAuth } from "@/store";
import { colors, f } from "@/theme";
import { isEmailOrPhone } from "@/utils/validation";

export default function Login() {
  const router = useRouter();
  const { setUser, continueAsGuest } = useAuth();
  const [idf, setIdf] = useState("");
  const [pw, setPw] = useState("");
  const [keep, setKeep] = useState(true);
  const [errors, setErrors] = useState<{
    idf?: string;
    pw?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (!isEmailOrPhone(idf)) next.idf = "Enter a valid email or phone number.";
    if (pw.length < 6) next.pw = "Password must be at least 6 characters.";
    setErrors(next);
    if (next.idf || next.pw) return;
    setLoading(true);
    try {
      setUser(await signIn(idf, pw), keep);
      router.replace("/(tabs)");
    } catch (e) {
      setErrors({
        form:
          e instanceof Error ? e.message : "Something went wrong. Try again.",
      });
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <T style={s.h1}>Welcome back</T>
      <T style={s.sub}>Sign in and pick up where you left off.</T>

      {!!errors.form && (
        <View style={s.banner} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <T
            style={{
              flex: 1,
              color: colors.danger,
              fontFamily: f.med,
              fontSize: 13,
            }}
          >
            {errors.form}
          </T>
        </View>
      )}

      <TextField
        icon="mail-outline"
        placeholder="Email or phone"
        value={idf}
        onChangeText={setIdf}
        error={errors.idf}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        returnKeyType="next"
      />
      <TextField
        icon="lock-closed-outline"
        placeholder="Password"
        value={pw}
        onChangeText={setPw}
        error={errors.pw}
        secure
        textContentType="password"
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <View style={s.row}>
        <Pressable
          style={s.keep}
          onPress={() => setKeep((k) => !k)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: keep }}
        >
          <View
            style={[
              s.box,
              keep && {
                backgroundColor: colors.orange,
                borderColor: colors.orange,
              },
            ]}
          >
            {keep && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <T style={{ fontSize: 13, fontFamily: f.med }}>Keep me signed in</T>
        </Pressable>
        <Link href="/forgot-password" asChild>
          <Pressable hitSlop={8}>
            <T
              style={{ color: colors.orange, fontFamily: f.bold, fontSize: 13 }}
            >
              Forgot password?
            </T>
          </Pressable>
        </Link>
      </View>

      <PrimaryButton title="Log in" onPress={submit} loading={loading} />

      <View style={s.divider}>
        <View style={s.line} />
        <T style={{ color: colors.mute, fontSize: 12 }}>Or continue with</T>
        <View style={s.line} />
      </View>
      <SocialButtons />

      <View style={s.foot}>
        <T style={{ color: colors.mute }}>Don’t have an account? </T>
        <Link href="/signup" asChild>
          <Pressable hitSlop={8}>
            <T style={{ fontFamily: f.bold }}>Sign up</T>
          </Pressable>
        </Link>
      </View>
      <Pressable
        style={{ alignSelf: "center", marginTop: 14 }}
        hitSlop={8}
        onPress={() => {
          continueAsGuest();
          router.replace("/(tabs)");
        }}
      >
        <T style={{ color: colors.orange, fontFamily: f.bold, fontSize: 13 }}>
          Browse as guest
        </T>
      </Pressable>
    </AuthShell>
  );
}

const s = StyleSheet.create({
  h1: { fontFamily: f.xbold, fontSize: 24 },
  sub: { color: colors.mute, marginTop: 4, marginBottom: 20 },
  banner: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#FDECEC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    marginBottom: 18,
  },
  keep: { flexDirection: "row", alignItems: "center", gap: 8 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
  foot: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
});
