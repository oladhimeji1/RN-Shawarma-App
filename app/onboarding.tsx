import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { T } from "@/components/T";
import { useAuth } from "@/store";
import { colors, f } from "@/theme";

const img1 = require("../assets/images/garlic.jpeg");
const img3 = require("../assets/images/sharwama.jpeg");
const img2 = require("../assets/images/peri_peri.jpg");

const SLIDES = [
  {
    image: img1,
    title: "Carved fresh, every order",
    text: "Real spit-roasted shawarma, wrapped warm in saj bread the moment you order.",
  },
  {
    image: img2,
    title: "Build it your way",
    text: "Pick your size, add extra toum or cheese, and leave a note for the kitchen.",
  },
  {
    image: img3,
    title: "Hot at your door",
    text: "Save your addresses, check out in a few taps and follow your order from the kitchen to you.",
  },
];

function Dot({ i, x, w }: { i: number; x: { value: number }; w: number }) {
  const st = useAnimatedStyle(() => ({
    width: interpolate(
      x.value,
      [(i - 1) * w, i * w, (i + 1) * w],
      [8, 24, 8],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(
      x.value,
      [(i - 1) * w, i * w, (i + 1) * w],
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    ),
  }));
  return <Animated.View style={[s.dot, st]} />;
}

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const finish = useAuth((a) => a.finishOnboarding);
  const list = useRef<FlatList>(null);
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  const done = () => {
    finish();
    router.replace("/login");
  };

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* Skip Button */}
      {!last && (
        <View style={[s.topBar, { top: insets.top + 8 }]}>
          <Pressable
            onPress={done}
            hitSlop={12}
            style={s.skipBtn}
            accessibilityRole="button"
          >
            <T style={s.skipText}>Skip</T>
          </Pressable>
        </View>
      )}

      {/* Fullscreen Slider */}
      <Animated.FlatList
        ref={list as never}
        data={SLIDES}
        keyExtractor={(i) => i.title}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={{ width, height, position: "relative" }}>
            <Image
              source={item.image}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />

            {/* Dark Faded Bottom Gradient */}
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.35)",
                "rgba(0,0,0,0.05)",
                "rgba(0,0,0,0.45)",
                "rgba(0,0,0,0.85)",
                "rgba(10,10,12,0.98)",
              ]}
              locations={[0, 0.35, 0.55, 0.65, 0.8]}
              style={StyleSheet.absoluteFill}
            />

            {/* Slide Text Content */}
            <View
              style={[
                s.slideContent,
                { paddingBottom: 155 + Math.max(insets.bottom, 20) },
              ]}
            >
              <T style={s.title}>{item.title}</T>
              <T style={s.text}>{item.text}</T>
            </View>
          </View>
        )}
      />

      {/* Docked Bottom Controls */}
      <View
        style={[s.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
        pointerEvents="box-none"
      >
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <Dot key={i} i={i} x={x} w={width} />
          ))}
        </View>
        <PrimaryButton
          title={last ? "Get started" : "Next"}
          onPress={() =>
            last
              ? done()
              : list.current?.scrollToIndex({
                  index: index + 1,
                  animated: true,
                })
          }
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  topBar: {
    position: "absolute",
    right: 20,
    zIndex: 20,
  },
  skipBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  skipText: {
    fontFamily: f.semi,
    color: "#FFFFFF",
    fontSize: 13,
  },
  slideContent: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: f.xbold,
    fontSize: 33,
    textAlign: "center",
    lineHeight: 36,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  text: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 320,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 20,
    zIndex: 10,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.orange,
  },
});
