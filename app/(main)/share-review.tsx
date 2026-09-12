import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { ChevronLeft, Sparkles, Heart, ScanLine } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../components/ui/Card";
import { FilterChip } from "../../components/FilterChip";
import { StarRatingInput } from "../../components/StarRatingInput";
import { getProducts, Product } from "../../src/api/products";
import { submitReview } from "../../src/api/reviews";
import { useTheme } from "../../src/theme/ThemeContext";
import { useScanStore } from "../../src/store/useScanStore";

const skinOptions = ["Oily", "Dry", "Normal", "Combo", "Sensitive"];
const concernOptions = [
  "Acne",
  "Dullness",
  "Anti-Aging",
  "Redness",
  "Scars",
  "Hydration",
  "Pigmentation",
  "Texture",
];

export default function ShareReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { productId: preselectedId } = useLocalSearchParams<{
    productId?: string;
  }>();

  const [source, setSource] = useState<"existing" | "new">("existing");

  // Existing product search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // New product fields
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("skincare");

  // Review fields
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [skinType, setSkinType] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If arriving from a barcode scan or product detail page with a productId already known
  useEffect(() => {
    if (preselectedId) {
      getProducts()
        .then((all) => {
          const match = all.find((p) => p.id === preselectedId);
          if (match) {
            setSelectedProduct(match);
            setSource("existing");
            setQuery(match.name);
          }
        })
        .catch(() => {});
    }
  }, [preselectedId]);

  // Pick up a barcode scan result handed back by the scanner screen
  useFocusEffect(
    React.useCallback(() => {
      const scanned = useScanStore.getState().scannedProduct;
      if (scanned) {
        setSelectedProduct(scanned);
        setSource("existing");
        setQuery(scanned.name);
        useScanStore.getState().setScannedProduct(null);
      }
    }, []),
  );

  useEffect(() => {
    if (source !== "existing" || !query.trim() || selectedProduct) {
      if (!query.trim()) setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      getProducts({ query })
        .then(setResults)
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, source]);

  const toggleConcern = (c: string) => {
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const hasValidProduct =
    source === "existing"
      ? Boolean(selectedProduct)
      : Boolean(newName.trim() && newBrand.trim());

  const selectedLabel =
    source === "existing" && selectedProduct
      ? `${selectedProduct.name} • ${selectedProduct.brand}`
      : source === "new" && newName.trim()
        ? `${newName}${newBrand ? ` • ${newBrand}` : ""}`
        : "";

  const handleSubmit = async () => {
    if (!hasValidProduct || rating === 0 || !comment.trim()) {
      Toast.show({
        type: "error",
        text1: "Select a product, rating, and comment",
      });
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        productId: source === "existing" ? selectedProduct!.id : undefined,
        newProduct:
          source === "new"
            ? {
                name: newName.trim(),
                brand: newBrand.trim(),
                category: newCategory,
              }
            : undefined,
        rating,
        comment: comment.trim(),
        skinType: skinType || undefined,
        concerns,
        isAnonymous,
      });
      Toast.show({ type: "success", text1: "Review published! 🔥" });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Failed to submit review",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 mb-4"
        >
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>
            Back
          </Text>
        </Pressable>

        <View className="items-center mb-6">
          <View
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1 mb-3"
            style={{
              backgroundColor: theme.primaryLight,
              borderWidth: 1,
              borderColor: theme.primary,
            }}
          >
            <Sparkles size={12} color={theme.primary} />
            <Text
              className="text-[13px] font-bold uppercase tracking-widest"
              style={{ color: theme.primary }}
            >
              Step into the spotlight
            </Text>
          </View>
          <Text
            className="text-2xl font-black text-center"
            style={{ color: theme.foreground }}
          >
            Drop Your <Text style={{ color: theme.primary }}>Truth Bomb</Text>
          </Text>
          <Text
            className="text-sm text-center mt-1"
            style={{ color: theme.muted }}
          >
            Community-powered reviews. No fluff, just results.{" "}
            <Heart size={12} color={theme.primary} />
          </Text>
        </View>

        {/* Product source toggle */}
        <Card
          className="p-4 mb-4"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: theme.foreground }}
          >
            Which product?
          </Text>
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => {
                setSource("existing");
                setSelectedProduct(null);
                setQuery("");
              }}
              className="flex-1 rounded-xl py-2.5 items-center"
              style={{
                backgroundColor:
                  source === "existing" ? theme.primary : theme.background,
                borderWidth: 1,
                borderColor:
                  source === "existing" ? theme.primary : theme.border,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: source === "existing" ? "#fff" : theme.muted }}
              >
                Existing product
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setSource("new");
                setSelectedProduct(null);
              }}
              className="flex-1 rounded-xl py-2.5 items-center"
              style={{
                backgroundColor:
                  source === "new" ? theme.primary : theme.background,
                borderWidth: 1,
                borderColor: source === "new" ? theme.primary : theme.border,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: source === "new" ? "#fff" : theme.muted }}
              >
                Add new product
              </Text>
            </Pressable>
          </View>

          {source === "existing" ? (
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <TextInput
                  className="flex-1 rounded-xl px-3.5 py-3 text-sm"
                  style={{
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    color: theme.foreground,
                  }}
                  placeholder="Search products..."
                  placeholderTextColor={theme.muted}
                  value={query}
                  onChangeText={(text) => {
                    setQuery(text);
                    setSelectedProduct(null);
                  }}
                />
                <Pressable
                  onPress={() =>
                    router.push("/(main)/scan-product?returnTo=share-review")
                  }
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: theme.primaryLight,
                    borderWidth: 1,
                    borderColor: theme.primary,
                  }}
                >
                  <ScanLine size={18} color={theme.primary} />
                </Pressable>
              </View>
              {!selectedProduct &&
                results.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setSelectedProduct(p);
                      setResults([]);
                      setQuery(p.name);
                    }}
                    className="py-2.5"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: theme.foreground }}
                    >
                      {p.name}
                    </Text>
                    <Text className="text-xs" style={{ color: theme.muted }}>
                      {p.brand}
                    </Text>
                  </Pressable>
                ))}
            </View>
          ) : (
            <View className="gap-2">
              <TextInput
                className="rounded-xl px-3.5 py-3 text-sm"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.foreground,
                }}
                placeholder="Product name"
                placeholderTextColor={theme.muted}
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                className="rounded-xl px-3.5 py-3 text-sm"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.foreground,
                }}
                placeholder="Brand"
                placeholderTextColor={theme.muted}
                value={newBrand}
                onChangeText={setNewBrand}
              />

              <Text
                className="text-sm font-medium mb-1.5 mt-2"
                style={{ color: theme.foreground }}
              >
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {["skincare", "haircare", "makeup"].map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    className="px-3 py-2 rounded-full"
                    style={{
                      backgroundColor:
                        newCategory === cat ? theme.primary : theme.background,
                      borderWidth: 1,
                      borderColor:
                        newCategory === cat ? theme.primary : theme.border,
                    }}
                  >
                    <Text
                      className="text-xs font-medium capitalize"
                      style={{
                        color: newCategory === cat ? "#fff" : theme.muted,
                      }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {selectedLabel ? (
            <View
              className="mt-3 rounded-xl px-3 py-2"
              style={{
                backgroundColor: theme.primaryLight,
                borderWidth: 1,
                borderColor: theme.primary,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: theme.primary }}
              >
                Reviewing: {selectedLabel}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Review form */}
        <Card
          className="p-4 mb-4"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: theme.foreground }}
          >
            Your rating
          </Text>
          <StarRatingInput value={rating} onChange={setRating} />

          <Text
            className="text-sm font-semibold mt-5 mb-2"
            style={{ color: theme.foreground }}
          >
            Your review
          </Text>
          <TextInput
            className="rounded-xl px-3.5 py-3 text-sm"
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.background,
              color: theme.foreground,
              textAlignVertical: "top",
              minHeight: 90,
            }}
            placeholder="Share your honest experience..."
            placeholderTextColor={theme.muted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          <Text
            className="text-sm font-semibold mt-5 mb-2"
            style={{ color: theme.foreground }}
          >
            Your skin type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {skinOptions.map((s) => (
              <FilterChip
                key={s}
                label={s}
                active={skinType === s}
                onPress={() => setSkinType(skinType === s ? null : s)}
              />
            ))}
          </View>

          <Text
            className="text-sm font-semibold mt-5 mb-2"
            style={{ color: theme.foreground }}
          >
            Concerns addressed
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {concernOptions.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={concerns.includes(c)}
                onPress={() => toggleConcern(c)}
              />
            ))}
          </View>

          <View
            className="flex-row items-center justify-between mt-5 pt-4"
            style={{ borderTopWidth: 1, borderTopColor: theme.border }}
          >
            <View className="flex-1 pr-3">
              <Text
                className="text-sm font-medium"
                style={{ color: theme.foreground }}
              >
                Post anonymously
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
                Your name won&apos;t be shown
              </Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ true: theme.primary }}
            />
          </View>
        </Card>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className="rounded-xl py-3.5 items-center"
          style={{
            backgroundColor: submitting ? theme.primaryLight : theme.primary,
          }}
        >
          <Text className="text-white font-semibold">
            {submitting ? "Publishing..." : "Publish Review"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
