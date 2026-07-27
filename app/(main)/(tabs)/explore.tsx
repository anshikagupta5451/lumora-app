import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react-native";
import { getReviews, Review } from "../../../src/api/reviews";
import { ReviewCard } from "../../../components/ReviewCard";
import { FilterChip } from "../../../components/FilterChip";
import { Card } from "../../../components/ui/Card";

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
  const [reviews, setReviews] = useState<Review[]>([]);
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
      .then((data) => {
        console.log("Fetched reviews:", JSON.stringify(data, null, 2)); // TEMP debug — remove once confirmed
        setReviews(data);
      })
      .catch((e) => setFetchError(e.message || "Failed to load reviews"))
      .finally(() => setLoading(false));
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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-1.5 self-start bg-primary/10 border border-primary/25 rounded-full px-3 py-1 mb-2">
          <Sparkles size={12} color="#C97B63" />
          <Text className="text-[10px] font-semibold text-primary uppercase tracking-wide">
            Community Reviews
          </Text>
        </View>
        <Text className="text-2xl font-bold text-foreground">
          View <Text className="text-primary">Reviews</Text>
        </Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Real skincare experiences from the community.
        </Text>

        {/* Single, meaningful stat — dropped the mixed-product avg rating */}
        <Card className="items-center py-3 mt-4">
          <Text className="text-[10px] text-muted-foreground uppercase">
            Total Reviews
          </Text>
          <Text className="text-lg font-semibold text-foreground mt-0.5">
            {filtered.length}
          </Text>
        </Card>
      </View>

      {/* Search + filter button */}
      <View className="px-4 flex-row gap-2 mb-2">
        <View className="flex-1 flex-row items-center bg-card border border-border rounded-xl px-3 py-2.5">
          <Search size={16} color="#8A7A72" />
          <TextInput
            className="flex-1 ml-2 text-sm text-foreground"
            placeholder="Search products or reviews"
            placeholderTextColor="#8A7A72"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          className="flex-row items-center gap-1.5 bg-card border border-border rounded-xl px-3.5"
        >
          <SlidersHorizontal size={16} color="#C97B63" />
          {activeFilterCount > 0 && (
            <View className="bg-primary rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-[9px] font-bold">
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Sort row */}
      <View style={{ height: 44 }}>
        <ScrollView
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
          <ActivityIndicator color="#C97B63" />
        </View>
      ) : fetchError ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-foreground font-semibold">
            Failed to load reviews
          </Text>
          <Text className="text-muted-foreground text-sm mt-1 text-center">
            {fetchError}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-foreground font-semibold">
            No reviews found
          </Text>
          <Text className="text-muted-foreground text-sm mt-1 text-center">
            Try changing your filters or search term.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        >
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
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-background rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-foreground">
                Filters
              </Text>
              <Pressable onPress={() => setFiltersOpen(false)}>
                <X size={20} color="#8A7A72" />
              </Pressable>
            </View>

            <ScrollView>
              <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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

              <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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

              <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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
                className="border border-border rounded-xl py-3 items-center mb-2"
              >
                <Text className="text-foreground font-medium text-sm">
                  Reset Filters
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFiltersOpen(false)}
                className="bg-primary rounded-xl py-3 items-center"
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
