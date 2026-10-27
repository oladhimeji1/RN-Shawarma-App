import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CategoryArc } from "@/components/CategoryArc";
import { EmptyState } from "@/components/EmptyState";
import { IconButton } from "@/components/IconButton";
import { ProductGrid } from "@/components/ProductGrid";
import { T } from "@/components/T";
import { CategoryId, MENU } from "@/data/menu";
import { useAuth, useSelectedAddress } from "@/store";
import { colors, f, TAB_BAR_CLEARANCE } from "@/theme";

const avatarImage = require("../../assets/images/avatar.png");

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((a) => a.user);
  const address = useSelectedAddress();
  const [cat, setCat] = useState<CategoryId>("all");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    return MENU.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!term ||
          `${p.name} ${p.blurb} ${p.category}`.toLowerCase().includes(term)),
    );
  }, [cat, q]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.white }}
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={s.header}>
        <Pressable
          onPress={() => router.navigate("/(tabs)/profile")}
          style={s.avatar}
          accessibilityLabel="Profile"
        >
          <Image source={avatarImage} style={s.avatarImg} />
        </Pressable>
        <Pressable
          style={s.addr}
          onPress={() => router.push("/address")}
          accessibilityRole="button"
          accessibilityLabel="Change delivery address"
        >
          <T style={{ color: colors.mute, fontSize: 11 }}>Delivery to</T>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <T
              numberOfLines={1}
              style={{ fontFamily: f.bold, fontSize: 13.5, flexShrink: 1 }}
            >
              {address ? address.line : "Add an address"}
            </T>
            <Ionicons name="chevron-down" size={14} color={colors.ink} />
          </View>
        </Pressable>
        <IconButton
          icon="notifications-outline"
          label="Notifications"
          dot={!!user}
          onPress={() => router.push("/notifications")}
        />
      </View>

      <T style={s.h1}>
        Craving? <T style={[s.h1, { color: "#B5B5BD" }]}>Wrap & Eat.</T>
      </T>

      <View style={s.search}>
        <Ionicons name="search" size={18} color={colors.mute} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search for shawarma"
          placeholderTextColor={colors.mute}
          returnKeyType="search"
          style={s.input}
          accessibilityLabel="Search the menu"
        />
        {q.length > 0 && (
          <Pressable
            onPress={() => setQ("")}
            hitSlop={10}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={colors.mute} />
          </Pressable>
        )}
      </View>

      <CategoryArc value={cat} onChange={setCat} />

      <View
        style={{
          backgroundColor: colors.arc,
          minHeight: 520,
          paddingBottom: TAB_BAR_CLEARANCE + 16,
        }}
      >
        {items.length > 0 ? (
          <ProductGrid
            items={items}
            animKey={`${cat}:${q.trim().toLowerCase()}`}
          />
        ) : (
          <EmptyState
            icon="search-outline"
            title="No matches"
            text={
              q
                ? `Nothing on the menu matches “${q.trim()}”.`
                : "Nothing here yet."
            }
            cta="Clear search"
            onCta={() => {
              setQ("");
              setCat("all");
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  addr: { flex: 1 },
  h1: {
    fontFamily: f.xbold,
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.6,
    paddingHorizontal: 16,
    marginTop: 22,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
    borderRadius: 25,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: f.med,
    fontSize: 14.5,
    color: colors.ink,
    height: "100%",
  },
});
