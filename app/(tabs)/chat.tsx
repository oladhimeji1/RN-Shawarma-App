import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, ScrollViewInstance, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '@/components/T';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { orderStatus, useChat, useOrders } from '@/store';
import { colors, f, TAB_BAR_CLEARANCE } from '@/theme';
import { tap } from '@/utils/haptics';

const QUICK = ['Where’s my order?', 'Change my address', 'Allergen info', 'Promo codes'];

// Scripted demo replies. Swap `reply()` for a call to your support backend or an LLM endpoint.
function reply(text: string, latest?: { id: string; createdAt: number }) {
  const t = text.toLowerCase();
  if (/order|track|status|where/.test(t))
    return latest ? `Your order ${latest.id} is currently: ${orderStatus(latest.createdAt).toLowerCase()}.` : 'You haven’t placed an order yet. Add something from the menu and it will show up here.';
  if (/address|deliver|location/.test(t)) return 'Tap the address at the top of Home, or go to Profile → Delivery addresses, to add or switch where we deliver.';
  if (/allerg|gluten|nut|sesame|halal|ingredient/.test(t)) return 'For allergies, please confirm ingredients with the restaurant before you order. We can’t guarantee any item is free of a specific allergen.';
  if (/promo|code|discount|coupon/.test(t)) return 'Enter a promo code in your cart under “Promo code”. SHAWARMA10 gives 10% off.';
  if (/human|agent|person|call/.test(t)) return 'A team member will reply here as soon as possible.';
  return 'I can help with orders, addresses, promo codes and allergens. Try one of the quick replies below.';
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();
  const { messages, push } = useChat();
  const latest = useOrders((o) => o.orders[0]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const scroller = useRef<ScrollViewInstance>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const send = (raw: string) => {
    const msg = raw.trim();
    if (!msg || typing) return;
    tap();
    push({ from: 'me', text: msg });
    setText('');
    setTyping(true);
    timer.current = setTimeout(() => {
      push({ from: 'bot', text: reply(msg, latest) });
      setTyping(false);
    }, 800);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.head, { paddingTop: insets.top + 12 }]}>
        <View style={s.avatar}>
          <T style={{ fontSize: 22 }}>🧑‍🍳</T>
        </View>
        <View>
          <T style={{ fontFamily: f.bold, fontSize: 16 }}>Shawarma support</T>
          <T style={{ color: colors.mute, fontSize: 12 }}>Demo assistant</T>
        </View>
      </View>

      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
        {messages.map((m) => (
          <View key={m.id} style={[s.bubble, m.from === 'me' ? s.me : s.bot]}>
            <T style={{ color: m.from === 'me' ? '#fff' : colors.ink, lineHeight: 20 }}>{m.text}</T>
          </View>
        ))}
        {typing && (
          <View style={[s.bubble, s.bot]}>
            <T style={{ color: colors.mute }}>typing…</T>
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }} keyboardShouldPersistTaps="handled">
        {QUICK.map((q) => (
          <Pressable key={q} style={s.chip} onPress={() => send(q)}>
            <T style={{ fontFamily: f.semi, fontSize: 12.5 }}>{q}</T>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[s.inputBar, { paddingBottom: keyboard ? 10 : TAB_BAR_CLEARANCE - 18 }]}>
        <TextInput value={text} onChangeText={setText} placeholder="Type a message" placeholderTextColor={colors.mute} style={s.input} onSubmitEditing={() => send(text)} returnKeyType="send" accessibilityLabel="Message" />
        <Pressable onPress={() => send(text)} style={[s.send, !text.trim() && { opacity: 0.4 }]} accessibilityLabel="Send message">
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '82%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.orange, borderBottomRightRadius: 6 },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  chip: { borderRadius: 18, borderWidth: 1.5, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.white },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 6 },
  input: { flex: 1, height: 48, borderRadius: 24, backgroundColor: colors.surface, paddingHorizontal: 18, fontFamily: f.med, fontSize: 14.5, color: colors.ink },
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
});
