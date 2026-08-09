import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Check,
  Trash2,
  PackageOpen,
  PackageCheck,
  Droplet,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../src/theme/ThemeContext";
import {
  getMyProducts,
  updateMyProduct,
  removeMyProduct,
  UserProduct,
} from "../../src/api/userProducts";

function daysAgo(dateStr: string) {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function MyProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [items, setItems] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyProducts();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleFinished = async (item: UserProduct) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isFinished: !i.isFinished } : i,
      ),
    );
    try {
      await updateMyProduct(item.id, { isFinished: !item.isFinished });
    } catch {
      Toast.show({ type: "error", text1: "Could not update" });
      load();
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMyProduct(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      Toast.show({ type: "success", text1: "Removed" });
    } catch {
      Toast.show({ type: "error", text1: "Could not remove" });
    }
  };

  const activeItems = items.filter((i) => !i.isFinished);
  const finishedItems = items.filter((i) => i.isFinished);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(main)/add-my-product")}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>

      <View className="px-4 pb-2">
        <View className="flex-row items-center gap-2 mb-1">
          <View
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <PackageOpen size={18} color={theme.primary} />
          </View>
          <Text
            className="text-2xl font-bold"
            style={{ color: theme.foreground }}
          >
            My Products
          </Text>
        </View>
        <Text className="text-sm mt-1" style={{ color: theme.muted }}>
          Track what&apos;s currently in your routine.
        </Text>

        <View className="flex-row gap-3 mt-4 mb-2">
          <Card
            className="flex-1 items-center py-3"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-1.5 mb-1">
              <PackageOpen size={14} color={theme.primary} />
              <Text
                className="text-lg font-bold"
                style={{ color: theme.foreground }}
              >
                {activeItems.length}
              </Text>
            </View>
            <Text
              className="text-[10px] uppercase"
              style={{ color: theme.muted }}
            >
              In use
            </Text>
          </Card>
          <Card
            className="flex-1 items-center py-3"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-1.5 mb-1">
              <PackageCheck size={14} color={theme.muted} />
              <Text
                className="text-lg font-bold"
                style={{ color: theme.foreground }}
              >
                {finishedItems.length}
              </Text>
            </View>
            <Text
              className="text-[10px] uppercase"
              style={{ color: theme.muted }}
            >
              Finished
            </Text>
          </Card>
        </View>
      </View>

      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : items.length === 0 ? (
        <View className="px-4">
          <Card
            className="p-6 items-center"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <PackageOpen size={28} color={theme.primary} />
            </View>
            <Text
              className="text-sm font-semibold text-center mb-1"
              style={{ color: theme.foreground }}
            >
              Your shelf is empty
            </Text>
            <Text
              className="text-sm text-center mb-4"
              style={{ color: theme.muted }}
            >
              Add the products you&apos;re currently using to start tracking them.
            </Text>
            <Pressable
              onPress={() => router.push("/(main)/add-my-product")}
              className="flex-row items-center gap-2 rounded-xl py-3 px-5"
              style={{ backgroundColor: theme.primary }}
            >
              <Plus size={16} color="#fff" />
              <Text className="text-white font-medium text-sm">
                Add a product
              </Text>
            </Pressable>
          </Card>
        </View>
      ) : (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {activeItems.length > 0 && (
            <>
              <Text
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: theme.primary }}
              >
                In Use
              </Text>
              {activeItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-3 mb-2 flex-row items-center"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Droplet size={16} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[11px] uppercase"
                      style={{ color: theme.muted }}
                    >
                      {item.product?.brand || item.customBrand || "Custom"}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: theme.foreground }}
                    >
                      {item.product?.name || item.customName}
                    </Text>
                    {item.openedAt && (
                      <Text
                        className="text-xs mt-0.5"
                        style={{ color: theme.muted }}
                      >
                        Opened {daysAgo(item.openedAt)}
                        {item.quantityTotal
                          ? ` · ${item.quantityTotal}${item.quantityUnit}`
                          : ""}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => toggleFinished(item)}
                    className="w-8 h-8 rounded-full items-center justify-center mr-1"
                    style={{ borderWidth: 1, borderColor: theme.border }}
                  >
                    <Check size={14} color={theme.muted} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemove(item.id)}
                    className="p-1"
                  >
                    <Trash2 size={16} color={theme.muted} />
                  </Pressable>
                </Card>
              ))}
            </>
          )}

          {finishedItems.length > 0 && (
            <>
              <Text
                className="text-xs font-bold uppercase tracking-wide mb-2 mt-4"
                style={{ color: theme.muted }}
              >
                Finished
              </Text>
              {finishedItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-3 mb-2 flex-row items-center"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    opacity: 0.6,
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Droplet size={16} color={theme.muted} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[11px] uppercase"
                      style={{ color: theme.muted }}
                    >
                      {item.product?.brand || item.customBrand || "Custom"}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme.muted,
                        textDecorationLine: "line-through",
                      }}
                    >
                      {item.product?.name || item.customName}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => toggleFinished(item)}
                    className="w-8 h-8 rounded-full items-center justify-center mr-1"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Check size={14} color="#fff" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemove(item.id)}
                    className="p-1"
                  >
                    <Trash2 size={16} color={theme.muted} />
                  </Pressable>
                </Card>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
