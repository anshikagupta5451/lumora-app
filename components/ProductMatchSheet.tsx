import { Image } from "expo-image";
import {
  ChevronRight,
  Layers,
  PackagePlus,
  Search,
  SearchX,
  Star,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { ProductMatch } from "../src/api/products";
import { iconColors } from "../src/theme/iconColors";
import { useTheme } from "../src/theme/ThemeContext";
import { Text, TextInput } from "./ui/Text";

// How sure we are that a match is the product in the photo. Fixed colors,
// like the verdict, so they read the same in every theme.
function scoreColor(score: number) {
  if (score >= 70) return iconColors.green;
  if (score >= 50) return iconColors.amber;
  return "#94A3B8";
}

function MatchCard({
  match,
  onPress,
  compact,
}: {
  match: ProductMatch;
  onPress: () => void;
  compact?: boolean;
}) {
  const { theme } = useTheme();
  const color = scoreColor(match.score);
  const meta = [match.brand, match.category].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl p-3"
      style={({ pressed }) => ({
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        className="rounded-xl items-center justify-center overflow-hidden"
        style={{
          width: compact ? 48 : 60,
          height: compact ? 56 : 72,
          backgroundColor: theme.background,
        }}
      >
        {match.imageUrl ? (
          <Image
            source={{ uri: match.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        ) : (
          <Layers size={22} color={theme.muted} />
        )}
      </View>

      <View className="flex-1">
        {meta ? (
          <Text className="text-xs capitalize" numberOfLines={1} style={{ color: theme.muted }}>
            {meta}
          </Text>
        ) : null}
        <Text
          className={compact ? "text-sm font-semibold" : "text-base font-semibold"}
          numberOfLines={2}
          style={{ color: theme.foreground }}
        >
          {match.name}
        </Text>
        <View className="flex-row items-center gap-1 mt-1">
          {match.source === "catalog" ? (
            match.reviewCount ? (
              <>
                <Star size={12} color={iconColors.amber} fill={iconColors.amber} />
                <Text className="text-xs" style={{ color: theme.muted }}>
                  {match.avgRating?.toFixed(1)} ({match.reviewCount})
                  {match.price ? `  ·  ₹${match.price}` : ""}
                </Text>
              </>
            ) : (
              <Text className="text-xs" style={{ color: theme.muted }}>
                {match.price ? `₹${match.price} · ` : ""}No reviews yet
              </Text>
            )
          ) : (
            <Text className="text-xs" style={{ color: theme.muted }}>
              From Open Beauty Facts
            </Text>
          )}
        </View>
      </View>

      <View
        className="items-center justify-center rounded-xl px-2 py-1.5"
        style={{ backgroundColor: color + "1F", minWidth: 52 }}
      >
        <Text className="text-lg font-bold" style={{ color }}>
          {match.score}%
        </Text>
        <Text className="text-[10px] font-medium" style={{ color }}>
          match
        </Text>
      </View>
    </Pressable>
  );
}

function ActionTile({
  icon: Icon,
  title,
  sub,
  onPress,
  active,
}: {
  icon: typeof Search;
  title: string;
  sub: string;
  onPress: () => void;
  active?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2.5 rounded-2xl px-3.5 py-3"
      style={({ pressed }) => ({
        backgroundColor: active ? theme.primaryLight : theme.background,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon size={22} color={active ? theme.primary : theme.foreground} />
      <View>
        <Text
          className="text-sm font-semibold"
          style={{ color: active ? theme.primary : theme.foreground }}
        >
          {title}
        </Text>
        <Text className="text-xs" style={{ color: theme.muted }}>
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}

// The sheet that rises over the scanner with what the photo matched:
// the top match, the runners-up, and ways out when it's not there.
export function ProductMatchSheet({
  matches,
  searching,
  bottomInset,
  onSelect,
  onSearch,
  onAddMissing,
  onClose,
}: {
  matches: ProductMatch[];
  searching: boolean;
  bottomInset: number;
  onSelect: (match: ProductMatch) => void;
  onSearch: (query: string) => void;
  onAddMissing: () => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const [showSimilar, setShowSimilar] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [top, ...similar] = matches;

  const submitSearch = () => {
    if (!query.trim()) return;
    setShowSimilar(false);
    onSearch(query.trim());
  };

  return (
    <View
      className="absolute left-0 right-0 bottom-0 rounded-t-[28px] pt-5"
      style={{
        backgroundColor: theme.background,
        paddingBottom: bottomInset + 16,
        maxHeight: "78%",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 16,
      }}
    >
      <View className="px-5 flex-row items-start">
        <View className="flex-1 items-center pl-8">
          <Text className="text-xl font-bold" style={{ color: theme.foreground }}>
            {top ? "Top match found" : "No match found"}
          </Text>
          <Text className="text-sm mt-1 text-center" style={{ color: theme.muted }}>
            {top
              ? "Tap it to see if it's right for you"
              : "Try another photo with the name in view, or search for it"}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} className="w-8 h-8 items-center justify-center">
          <X size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView
        className="mt-4"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        {searchOpen ? (
          <View
            className="flex-row items-center rounded-2xl px-3"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.primary }}
          >
            <Search size={18} color={theme.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              placeholder="Brand and product name"
              placeholderTextColor={theme.muted}
              returnKeyType="search"
              autoFocus
              className="flex-1 py-3 px-2 text-sm"
              style={{ color: theme.foreground }}
            />
            {searching ? (
              <ActivityIndicator color={theme.primary} size="small" />
            ) : (
              <Pressable onPress={submitSearch} hitSlop={8}>
                <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                  Search
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {top ? (
          <MatchCard match={top} onPress={() => onSelect(top)} />
        ) : (
          <View className="items-center py-4">
            <SearchX size={36} color={theme.muted} />
          </View>
        )}

        {showSimilar
          ? similar.map((m) => (
              <MatchCard
                key={`${m.source}-${m.productId ?? m.barcode}`}
                match={m}
                onPress={() => onSelect(m)}
                compact
              />
            ))
          : null}
      </ScrollView>

      <Text className="text-sm text-center mt-5 mb-3" style={{ color: theme.muted }}>
        {top ? "Not the right product?" : "Can't find it?"}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        {similar.length ? (
          <ActionTile
            icon={Layers}
            title="Similar"
            sub={showSimilar ? "Hide matches" : `matches +${similar.length}`}
            active={showSimilar}
            onPress={() => setShowSimilar((s) => !s)}
          />
        ) : null}
        <ActionTile
          icon={Search}
          title="Manual"
          sub="search"
          active={searchOpen}
          onPress={() => setSearchOpen((s) => !s)}
        />
        <ActionTile icon={PackagePlus} title="Add missing" sub="product" onPress={onAddMissing} />
      </ScrollView>

      {top ? (
        <Pressable
          onPress={() => onSelect(top)}
          className="mx-4 mt-4 flex-row items-center justify-center gap-1 rounded-2xl py-3.5"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-white text-sm font-semibold">Is this right for me?</Text>
          <ChevronRight size={16} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );
}
