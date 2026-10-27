import {
  ChevronRight,
  ScanLine,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
  PenSquare,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text, TextInput } from "../../../components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FilterChip } from "../../../components/FilterChip";
import { ReviewCard } from "../../../components/ReviewCard";
import { Card } from "../../../components/ui/Card";
import { getReviews, Review } from "../../../src/api/reviews";
import {
  getPopularProducts,
  PopularProduct,
} from "../../../src/api/products";
import { useTheme } from "../../../src/theme/ThemeContext";

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
const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Highest Rated", value: "highest" },
  { label: "Lowest Rated", value: "lowest" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [popular, setPopular] = useState<PopularProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [sort, setSort] = useState<"latest" | "highest" | "lowest">("latest");

  useEffect(() => {
    getReviews()
      .then((data) => setReviews(data))
      .catch((e) => setFetchError(e.message || "Failed to load reviews"))
      .finally(() => setLoading(false));
    // Optional extra: if it fails, the row just doesn't show.
    getPopularProducts()
      .then(setPopular)
      .catch(() => setPopular([]));
  }, []);

  const toggle = (
    value: string,
    arr: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  };

  const filtered = useMemo(() => {
    let data = [...reviews];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.product?.toLowerCase().includes(q) ||
          r.brand?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.review?.toLowerCase().includes(q),
      );
    }
    if (selectedRating) data = data.filter((r) => r.rating === selectedRating);
    if (selectedSkin.length)
      data = data.filter((r) => selectedSkin.includes(r.skinType));
    if (selectedConcerns.length)
      data = data.filter((r) =>
        selectedConcerns.some((c) => r.concerns?.includes(c)),
      );

    if (sort === "highest") data.sort((a, b) => b.rating - a.rating);
    else if (sort === "lowest") data.sort((a, b) => a.rating - b.rating);
    else
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return data;
  }, [reviews, search, selectedRating, selectedSkin, selectedConcerns, sort]);

  const resetFilters = () => {
    setSearch("");
    setSelectedRating(null);
    setSelectedSkin([]);
    setSelectedConcerns([]);
    setSort("latest");
  };

  const activeFilterCount =
    (selectedRating ? 1 : 0) + selectedSkin.length + selectedConcerns.length;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <View
          className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1 mb-2"
          style={{
            backgroundColor: theme.primaryLight,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Sparkles size={12} color={theme.primary} />
          <Text
            className="text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: theme.primary }}
          >
            Community Reviews
          </Text>
        </View>
        <Text
          className="text-2xl font-bold"
          style={{ color: theme.foreground }}
        >
          View <Text style={{ color: theme.primary }}>Reviews</Text>
        </Text>
        <Text className="text-sm mt-1" style={{ color: theme.muted }}>
          Real skincare experiences from the community.
        </Text>

        <Pressable
          onPress={() => router.push("/(main)/glossary")}
          className="flex-row items-center gap-1.5 self-start mt-2"
        >
          <Text
            className="text-xs font-medium underline"
            style={{ color: theme.primary }}
          >
            📖 Ingredient Glossary
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(main)/product-scanner")}
          className="mt-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <LinearGradient
            colors={theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}
          >
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
            >
              <ScanLine size={24} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-white">Scan a product</Text>
              <Text className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.88)" }}>
                Snap the front of any product to see if it&apos;s right for your skin
              </Text>
            </View>
            <ChevronRight size={20} color="#fff" />
          </LinearGradient>
        </Pressable>

        {/* <Pressable
          onPress={() => router.push("/(main)/shared-routines")}
          className="flex-row items-center gap-1.5 self-start mt-2"
        >
          <Text
            className="text-xs font-medium underline"
            style={{ color: theme.primary }}
          >
            🔁 Shared Routines
          </Text>
        </Pressable> */}

        <Pressable
          onPress={() => router.push("/(main)/share-review")}
          className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2 self-start mt-3"
          style={{ backgroundColor: theme.primary }}
        >
          <PenSquare size={14} color="#fff" />
          <Text className="text-xs font-semibold text-white">
            Write a review
          </Text>
        </Pressable>

        {/* Single, meaningful stat */}
        <Card
          className="items-center py-3 mt-4"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Text
            className="text-[13px] uppercase"
            style={{ color: theme.muted }}
          >
            Total Reviews
          </Text>
          <Text
            className="text-lg font-semibold mt-0.5"
            style={{ color: theme.foreground }}
          >
            {filtered.length}
          </Text>
        </Card>
      </View>

      {/* Search + filter button */}
      <View className="px-4 flex-row gap-2 mb-2">
        <View
          className="flex-1 flex-row items-center rounded-xl px-3 py-2.5"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Search size={16} color={theme.muted} />
          <TextInput
            className="flex-1 ml-2 text-sm"
            style={{ color: theme.foreground }}
            placeholder="Search products or reviews"
            placeholderTextColor={theme.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          className="flex-row items-center gap-1.5 rounded-xl px-3.5"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <SlidersHorizontal size={16} color={theme.primary} />
          {activeFilterCount > 0 && (
            <View
              className="rounded-full w-4 h-4 items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-white text-[13px] font-bold">
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Sort row */}
      <View style={{ height: 44 }}>
        <ScrollView
          style={{ backgroundColor: theme.background }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          {sortOptions.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={sort === opt.value}
              onPress={() => setSort(opt.value as any)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : fetchError ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="font-semibold" style={{ color: theme.foreground }}>
            Failed to load reviews
          </Text>
          <Text
            className="text-sm mt-1 text-center"
            style={{ color: theme.muted }}
          >
            {fetchError}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="font-semibold" style={{ color: theme.foreground }}>
            No reviews found
          </Text>
          <Text
            className="text-sm mt-1 text-center"
            style={{ color: theme.muted }}
          >
            Try changing your filters or search term.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {popular.length > 0 && !search.trim() && activeFilterCount === 0 && (
            <View className="mb-3">
              <Text
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: theme.muted }}
              >
                Popular in the community
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {popular.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/(main)/product/${p.id}`)}
                    className="rounded-2xl p-3"
                    style={{
                      width: 160,
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      className="text-[11px] uppercase"
                      style={{ color: theme.muted }}
                      numberOfLines={1}
                    >
                      {p.brand}
                    </Text>
                    <Text
                      className="text-sm font-semibold mt-0.5"
                      style={{ color: theme.foreground }}
                      numberOfLines={2}
                    >
                      {p.name}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-2">
                      <Star size={12} color={theme.primary} fill={theme.primary} />
                      <Text className="text-xs" style={{ color: theme.foreground }}>
                        {p.avgRating ?? "–"}
                      </Text>
                      <Text className="text-xs" style={{ color: theme.muted }}>
                        · {p.reviewCount} {p.reviewCount === 1 ? "review" : "reviews"}
                      </Text>
                    </View>
                    {p.price != null && (
                      <Text className="text-xs mt-1" style={{ color: theme.muted }}>
                        ₹{p.price}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ScrollView>
      )}

      {/* Filter modal */}
      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View
            className="rounded-t-3xl p-5 max-h-[80%]"
            style={{
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base font-semibold"
                style={{ color: theme.foreground }}
              >
                Filters
              </Text>
              <Pressable onPress={() => setFiltersOpen(false)}>
                <X size={20} color={theme.muted} />
              </Pressable>
            </View>

            <ScrollView>
              <Text
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: theme.muted }}
              >
                Rating
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {[5, 4, 3, 2, 1].map((r) => (
                  <FilterChip
                    key={r}
                    label={`${r} Star`}
                    active={selectedRating === r}
                    onPress={() =>
                      setSelectedRating(selectedRating === r ? null : r)
                    }
                  />
                ))}
              </View>

              <Text
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: theme.muted }}
              >
                Skin Type
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {skinOptions.map((s) => (
                  <FilterChip
                    key={s}
                    label={s}
                    active={selectedSkin.includes(s)}
                    onPress={() => toggle(s, selectedSkin, setSelectedSkin)}
                  />
                ))}
              </View>

              <Text
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: theme.muted }}
              >
                Concerns
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {concernOptions.map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={selectedConcerns.includes(c)}
                    onPress={() =>
                      toggle(c, selectedConcerns, setSelectedConcerns)
                    }
                  />
                ))}
              </View>

              <Pressable
                onPress={resetFilters}
                className="rounded-xl py-3 items-center mb-2"
                style={{ borderWidth: 1, borderColor: theme.border }}
              >
                <Text
                  className="font-medium text-sm"
                  style={{ color: theme.foreground }}
                >
                  Reset Filters
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFiltersOpen(false)}
                className="rounded-xl py-3 items-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-white font-medium text-sm">
                  Show {filtered.length} Results
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
