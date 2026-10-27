import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { T } from '@/components/T';
import { TextField } from '@/components/TextField';
import { Address, useAddresses } from '@/store';
import { colors, f } from '@/theme';
import { tap } from '@/utils/haptics';

const LABELS: Address['label'][] = ['Home', 'Work', 'Other'];
const ICON = { Home: 'home-outline', Work: 'briefcase-outline', Other: 'location-outline' } as const;

export default function AddressPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, selectedId, add, remove, select } = useAddresses();
  const [adding, setAdding] = useState(items.length === 0);
  const [label, setLabel] = useState<Address['label']>('Home');
  const [line, setLine] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();

  const save = () => {
    if (line.trim().length < 5) return setError('Enter the full street address.');
    add({ label, line: line.trim(), note: note.trim() || undefined });
    router.back();
  };
  const confirmDelete = (a: Address) =>
    Alert.alert('Remove address?', `${a.label} · ${a.line}`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => remove(a.id) }]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.head}>
        <T style={s.h1}>Delivery address</T>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 16) + 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {items.map((a) => {
          const on = a.id === selectedId;
          return (
            <Pressable
              key={a.id}
              onPress={() => {
                tap();
                select(a.id);
                router.back();
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[s.card, on && s.cardOn]}
            >
              <View style={[s.icon, on && { backgroundColor: colors.orange }]}>
                <Ionicons name={ICON[a.label]} size={18} color={on ? '#fff' : colors.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <T style={{ fontFamily: f.bold }}>{a.label}</T>
                <T style={{ color: colors.mute, marginTop: 2 }}>{a.line}</T>
                {!!a.note && <T style={{ color: colors.mute, fontSize: 12, marginTop: 2, fontStyle: 'italic' }}>{a.note}</T>}
              </View>
              {items.length > 1 && (
                <Pressable onPress={() => confirmDelete(a)} hitSlop={10} accessibilityLabel={`Remove ${a.label} address`}>
                  <Ionicons name="trash-outline" size={19} color={colors.mute} />
                </Pressable>
              )}
              {on && <Ionicons name="checkmark-circle" size={22} color={colors.orange} />}
            </Pressable>
          );
        })}

        {adding ? (
          <View style={{ marginTop: 18 }}>
            <T style={{ fontFamily: f.bold, fontSize: 16, marginBottom: 12 }}>New address</T>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {LABELS.map((l) => (
                <Pressable key={l} onPress={() => setLabel(l)} accessibilityRole="radio" accessibilityState={{ selected: label === l }} style={[s.pill, label === l && s.pillOn]}>
                  <T style={{ fontFamily: f.semi, color: label === l ? '#fff' : colors.ink }}>{l}</T>
                </Pressable>
              ))}
            </View>
            <TextField icon="location-outline" placeholder="Street address" value={line} onChangeText={(t) => { setLine(t); setError(undefined); }} error={error} autoCapitalize="words" returnKeyType="next" />
            <TextField icon="information-circle-outline" placeholder="Gate code, landmark (optional)" value={note} onChangeText={setNote} returnKeyType="done" onSubmitEditing={save} />
            <PrimaryButton title="Save address" onPress={save} style={{ marginTop: 4 }} />
          </View>
        ) : (
          <PrimaryButton title="Add a new address" variant="outline" onPress={() => setAdding(true)} style={{ marginTop: 14 }} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20 },
  h1: { fontFamily: f.xbold, fontSize: 22 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, borderWidth: 1.5, borderColor: colors.line, padding: 14, marginBottom: 10 },
  cardOn: { borderColor: colors.orange, backgroundColor: colors.orangeSoft },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.surface },
  pillOn: { backgroundColor: colors.dark },
});
