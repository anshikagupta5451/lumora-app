import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, PackagePlus, PackageSearch, ScanLine } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductVerdict } from "../../components/ProductVerdict";
import { Text } from "../../components/ui/Text";
import { BarcodeCheck, checkBarcode, identifyProduct } from "../../src/api/products";
import { useScanStore } from "../../src/store/useScanStore";
import { useTheme } from "../../src/theme/ThemeContext";

// Opened with `code` (a scanned barcode) or `q` (text read off a pack the
// photo scanner couldn't match, which the AI then identifies).
export default function ProductCheckScreen() {
  const { code, q } = useLocalSearchParams<{ code?: string; q?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [result, setResult] = useState<BarcodeCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (code ? checkBarcode(code) : identifyProduct(q ?? ""))
      .then(setResult)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [code, q]);

  const scanAgain = () => router.replace(code ? "/(main)/scan-product" : "/(main)/product-scanner");

  const backButton = (
    <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-4">
      <ChevronLeft size={18} color={theme.muted} />
      <Text className="text-sm" style={{ color: theme.muted }}>
        Back
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center gap-3"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator color={theme.primary} />
        <Text className="text-sm" style={{ color: theme.muted }}>
          {code ? "Checking this against your skin…" : "Identifying the product…"}
        </Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View
        className="flex-1 px-6"
        style={{ backgroundColor: theme.background, paddingTop: insets.top + 12 }}
      >
        {backButton}
        <View className="flex-1 items-center justify-center">
          <PackageSearch size={40} color={theme.primary} />
          <Text
            className="text-base font-semibold mt-4 text-center"
            style={{ color: theme.foreground }}
          >
            {error ?? "We couldn't find this product"}
          </Text>
          <Text className="text-sm text-center mt-2 mb-5" style={{ color: theme.muted }}>
            Try scanning again, or add it to your shelf yourself.
          </Text>
          <Pressable
            onPress={scanAgain}
            className="rounded-xl py-3 px-6 mb-3"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-medium text-sm">Scan again</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/(main)/add-my-product")}>
            <Text className="text-sm font-medium underline" style={{ color: theme.primary }}>
              Add it manually
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const { product, verdict } = result;

  // Catalog products go to Add product preselected, the same handoff the
  // scanner uses; Open Beauty Facts finds aren't in the catalog, so they
  // can only be added as a custom product.
  const addToShelf = () => {
    if (product.id) {
      useScanStore.getState().setScannedProduct({
        id: product.id,
        name: product.name,
        brand: product.brand ?? "",
        category: product.category ?? "",
        ingredients: product.ingredients,
        price: product.price ?? 0,
        imageUrl: product.imageUrl,
      });
    }
    router.push("/(main)/add-my-product");
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{
        padding: 16,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
    >
      {backButton}

      <View className="flex-row gap-3 items-center">
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: 64, height: 64, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : null}
        <View className="flex-1">
          {product.brand ? (
            <Text className="text-xs uppercase" style={{ color: theme.muted }}>
              {product.brand}
            </Text>
          ) : null}
          <Text className="text-lg font-bold" style={{ color: theme.foreground }}>
            {product.name}
          </Text>
          <Text className="text-sm capitalize" style={{ color: theme.muted }}>
            {[product.category, product.price ? `₹${product.price}` : null]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <ProductVerdict verdict={verdict} />
      </View>

      {result.source === "openbeautyfacts" ? (
        <Text className="text-xs mt-3" style={{ color: theme.muted }}>
          This product isn&apos;t in Lumora&apos;s catalog yet, so its details come from Open
          Beauty Facts and may be incomplete.
        </Text>
      ) : null}
      {result.source === "ai" ? (
        <Text className="text-xs mt-3" style={{ color: theme.muted }}>
          This product isn&apos;t in Lumora&apos;s catalog yet. AI identified it and found its
          ingredient list
          {result.sources?.length
            ? ` on ${result.sources.map((s) => s.title).filter(Boolean).slice(0, 2).join(" and ")}`
            : ""}
          ; the match above is worked out from that list by Lumora&apos;s rules. Check the label
          on the pack to confirm.
        </Text>
      ) : null}

      <View className="flex-row gap-3 mt-5">
        <Pressable
          onPress={scanAgain}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}
        >
          <ScanLine size={16} color={theme.foreground} />
          <Text className="text-sm font-medium" style={{ color: theme.foreground }}>
            Scan another
          </Text>
        </Pressable>
        <Pressable
          onPress={addToShelf}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ backgroundColor: theme.primary }}
        >
          <PackagePlus size={16} color="#fff" />
          <Text className="text-white text-sm font-medium">I bought it</Text>
        </Pressable>
      </View>

      {product.id ? (
        <View className="flex-row justify-center gap-6 mt-4">
          <Pressable onPress={() => router.push(`/(main)/product/${product.id}`)}>
            <Text className="text-sm font-medium underline" style={{ color: theme.primary }}>
              View details
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push(`/(main)/share-review?productId=${product.id}`)}>
            <Text className="text-sm font-medium underline" style={{ color: theme.primary }}>
              Write a review
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
