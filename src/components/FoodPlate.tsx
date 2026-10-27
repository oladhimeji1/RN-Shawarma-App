import { Image, StyleSheet, Text, View } from "react-native";
import { Product } from "@/data/menu";
import { shadow } from "@/theme";

/** Round plate with the dish on it. Uses product.image when you add real photos, emoji otherwise. */
export function FoodPlate({
  product,
  size = 110,
  width,
}: {
  product: Pick<Product, "emoji" | "tint" | "image">;
  size?: number;
  width?: number | `${number}%` | "auto";
}) {
  const inner = size * 0.8;
  const w = width ?? size;
  return (
    <View
      style={[
        s.outer,
        shadow(2),
        {
          width: "100%",
          height: size,
          borderRadius: 10,
          backgroundColor: product.tint,
          overflow: "hidden",
        },
      ]}
    >
      {product.image ? (
        <Image
          source={product.image}
          style={{ width: "100%", height: "100%", borderRadius: 10 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            s.inner,
            { width: inner, height: inner, borderRadius: inner / 2 },
          ]}
        >
          <Text style={{ fontSize: size * 0.44 }}>{product.emoji}</Text>
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  outer: { alignItems: "center", justifyContent: "center" },
  inner: {
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
