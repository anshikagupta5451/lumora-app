import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft, Plus, Search, Star, Package } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Text, TextInput } from "../../../components/ui/Text";
import { Card } from "../../../components/ui/Card";
import { useTheme } from "../../../src/theme/ThemeContext";
import { iconColors } from "../../../src/theme/iconColors";
import {
  AdminProduct,
  getAdminProducts,
  updateProduct,
} from "../../../src/api/admin";

export default function AdminProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q: string) => {
    try {
      setProducts(await getAdminProducts(q.trim() || undefined));
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.message || "Could not load products" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(query);
      // Reload on focus only (e.g. back from the form), not per keystroke.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  const toggleFeatured = async (p: AdminProduct, value: boolean) => {
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, isPromoted: value } : x)));
    try {
      await updateProduct(p.id, { isPromoted: value });
    } catch (err: any) {
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, isPromoted: !value } : x)));
      Toast.show({ type: "error", text1: err.message || "Could not update" });
    }
  };

  const featuredCount = products.filter((p) => p.isPromoted).length;
  const missingPrice = products.filter((p) => !p.price).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(query);
            }}
            tintColor={theme.primary}
          />
        }
      >
        <View className="px-4" style={{ paddingTop: insets.top + 12 }}>
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-4">
            <ChevronLeft size={18} color={theme.muted} />
            <Text className="text-sm" style={{ color: theme.muted }}>
              Back
            </Text>
          </Pressable>

          <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>
            Product catalog
          </Text>
          <Text className="text-sm mt-1 mb-4" style={{ color: theme.muted }}>
            {products.length} products · {featuredCount} featured
            {missingPrice ? ` · ${missingPrice} missing a price` : ""}
          </Text>

          <View
            className="flex-row items-center gap-2 rounded-xl px-3.5 mb-4"
            style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}
          >
            <Search size={16} color={theme.muted} />
            <TextInput
              className="flex-1 py-3 text-sm"
              style={{ color: theme.foreground }}
              placeholder="Search name, brand or barcode"
              placeholderTextColor={theme.muted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => load(query)}
              returnKeyType="search"
            />
          </View>

          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 32 }} />
          ) : products.length === 0 ? (
            <Card className="p-6 items-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <Package size={28} color={theme.muted} />
              <Text className="text-sm mt-2 text-center" style={{ color: theme.muted }}>
                No products match. Add one with the + button.
              </Text>
            </Card>
          ) : (
            products.map((p) => {
              const users = p._count.userProducts;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/(main)/admin/product?id=${p.id}`)}
                >
                  <Card
                    className="p-3 mb-2.5 flex-row items-center gap-3"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                  >
                    {p.imageUrl ? (
                      <Image
                        source={{ uri: p.imageUrl }}
                        style={{ width: 48, height: 48, borderRadius: 10 }}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        className="w-12 h-12 rounded-[10px] items-center justify-center"
                        style={{ backgroundColor: theme.primaryLight }}
                      >
                        <Package size={18} color={theme.primary} />
                      </View>
                    )}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        {p.isPromoted && <Star size={12} color={iconColors.amber} fill={iconColors.amber} />}
                        <Text
                          className="text-sm font-semibold shrink"
                          style={{ color: theme.foreground }}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                      </View>
                      <Text className="text-xs mt-0.5" style={{ color: theme.muted }} numberOfLines={1}>
                        {p.brand} · <Text className="capitalize">{p.category}</Text> ·{" "}
                        {p.price ? (
                          `₹${p.price}`
                        ) : (
                          <Text style={{ color: iconColors.morning }}>no price</Text>
                        )}
                      </Text>
                      <Text className="text-[11px] mt-0.5" style={{ color: theme.muted }}>
                        {users} {users === 1 ? "user owns" : "users own"} · {p._count.reviews} review
                        {p._count.reviews === 1 ? "" : "s"}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Switch
                        value={p.isPromoted}
                        onValueChange={(v) => toggleFeatured(p, v)}
                        trackColor={{ true: iconColors.amber }}
                      />
                      <Text className="text-[10px]" style={{ color: theme.muted }}>
                        Featured
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push("/(main)/admin/product")}
        className="absolute right-5 w-14 h-14 rounded-full items-center justify-center"
        style={{ bottom: insets.bottom + 24, backgroundColor: theme.primary, elevation: 4 }}
      >
        <Plus size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
