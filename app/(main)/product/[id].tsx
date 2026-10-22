import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "../../../components/ui/Text";
import { Card } from "../../../components/ui/Card";
import { ProductVerdict } from "../../../components/ProductVerdict";
import { getProduct, getProductVerdict, Product, Verdict } from "../../../src/api/products";
import { useTheme } from "../../../src/theme/ThemeContext";


export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    // The verdict is extra: if it fails, the page still shows the product.
    getProductVerdict(id)
      .then((res) => setVerdict(res.verdict))
      .catch(() => setVerdict(null));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#E8896F" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-muted-foreground">Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 pb-10"
       style={{ backgroundColor: theme.background }}
    >
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center gap-1 mb-4"
      >
        <ChevronLeft size={18} color="#8A7A72" />
        <Text className="text-sm text-muted-foreground">Back</Text>
      </Pressable>

      <Text className="text-[14px] text-muted-foreground uppercase">
        {product.brand}
      </Text>
      <Text className="text-2xl font-bold text-foreground mt-1">
        {product.name}
      </Text>
      <Text className="text-sm text-muted-foreground mt-1 capitalize">
        {product.category}
      </Text>
      <Text className="text-xl font-semibold text-primary mt-3">
        ₹{product.price}
      </Text>

      {verdict ? (
        <View className="mt-5">
          <ProductVerdict verdict={verdict} />
        </View>
      ) : null}

      <Card className="p-4 mt-5">
        <Text className="text-sm font-semibold text-foreground mb-2">
          Key Ingredients
        </Text>
        <View className="flex-row flex-wrap">
          {product.ingredients.map((ing) => (
            <View
              key={ing}
              className="bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 mr-2 mb-2"
            >
              <Text className="text-xs text-primary font-medium capitalize">
                {ing}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}
