import { useEffect } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES, CategoryId } from "@/data/menu";
import { colors, f, shadow } from "@/theme";
import { tap } from "@/utils/haptics";
import { T } from "./T";

// Chips sit on an arc: the middle one is highest, the outer ones drop away.
const DROP = [40, 15, 10, 15, 40];
export const ARC_HEIGHT = 160;

function Chip({
  chip,
  active,
  drop,
  onPress,
}: {
  chip: (typeof CATEGORIES)[number];
  active: boolean;
  drop: number;
  onPress: () => void;
}) {
  const p = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    p.value = withSpring(active ? 1 : 0, { damping: 13, stiffness: 190 });
  }, [active, p]);
  const circle = useAnimatedStyle(() => ({
    transform: [{ translateY: -9 * p.value }, { scale: 1 + 0.2 * p.value }],
  }));
  const bar = useAnimatedStyle(() => ({
    width: 18 * p.value,
    opacity: p.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={chip.label}
      style={[s.chip, { marginTop: drop }]}
    >
      <Animated.View style={[s.circle, shadow(active ? 2 : 1), circle]}>
        {chip.emoji ? (
          <T style={{ fontSize: 26 }}>{chip.emoji}</T>
        ) : (
          <Ionicons name="grid" size={22} color={colors.ink} />
        )}
      </Animated.View>
      <T style={[s.label, active && { fontFamily: f.bold, color: colors.ink }]}>
        {chip.label}
      </T>
      <Animated.View style={[s.bar, bar]} />
    </Pressable>
  );
}

export function CategoryArc({
  value,
  onChange,
}: {
  value: CategoryId;
  onChange: (c: CategoryId) => void;
}) {
  const { width } = useWindowDimensions();
  const R = width * 0.75;
  return (
    <View
      style={{
        height: ARC_HEIGHT,
        overflow: "hidden",
        backgroundColor: colors.white,
      }}
    >
      {/* big grey circle: its top edge is the arc */}
      <View
        style={{
          position: "absolute",
          top: 18,
          left: -width * 0.25,
          width: R * 2,
          height: R * 2,
          borderRadius: R,
          backgroundColor: colors.arc,
        }}
      />
      <View style={s.row}>
        {CATEGORIES.map((c, i) => (
          <Chip
            key={c.id}
            chip={c}
            drop={DROP[i]}
            active={value === c.id}
            onPress={() => {
              if (value !== c.id) tap();
              onChange(c.id);
            }}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    paddingTop: 26,
  },
  chip: { width: 66, alignItems: "center" },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11.5,
    color: colors.mute,
    marginTop: 9,
    fontFamily: f.med,
  },
  bar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.ink,
    marginTop: 4,
  },
});
