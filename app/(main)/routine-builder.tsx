import { useRouter } from "expo-router";
import { ChevronLeft, Moon, Plus, Sun, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { getProducts, Product } from "../../src/api/products";
import { getMyProducts } from "../../src/api/userProducts";
import { createRoutine } from "../../src/api/routines";
import { useTheme } from "../../src/theme/ThemeContext";

export default function RoutineBuilderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "evening">("morning");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSource, setPickerSource] = useState<"mine" | "catalog">("mine");
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!pickerOpen) return;
    setLoadingProducts(true);
    if (pickerSource === "mine") {
      getMyProducts()
        .then((mine) =>
          setMyProducts(
            mine
              .filter((up) => up.product)
              .map((up) => ({
                id: up.product!.id,
                name: up.product!.name,
                brand: up.product!.brand,
                category: up.product!.category,
                ingredients: [],
                price: 0,
                imageUrl: null,
              })),
          ),
        )
        .catch(() => setMyProducts([]))
        .finally(() => setLoadingProducts(false));
    } else {
      getProducts()
        .then(setProducts)
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false));
    }
  }, [pickerOpen, pickerSource]);

  const pickerItems = pickerSource === "mine" ? myProducts : products;

  const addProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts((prev) => [...prev, product]);
    }
    setPickerOpen(false);
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedProducts.length === 0) {
      Toast.show({
        type: "error",
        text1: "Add a name and at least one product",
      });
      return;
    }
    setSubmitting(true);
    try {
      await createRoutine({
        name: name.trim(),
        timeOfDay,
        productIds: selectedProducts.map((p) => p.id),
      });
      Toast.show({ type: "success", text1: "Routine created!" });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Could not create routine",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      <ScrollView contentContainerClassName="p-4 pb-6">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 mb-4"
        >
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>
            Back
          </Text>
        </Pressable>

        <Text
          className="text-2xl font-bold mb-1"
          style={{ color: theme.foreground }}
        >
          Create a routine
        </Text>
        <Text className="text-sm mb-5" style={{ color: theme.muted }}>
          Pick the products you use, in the order you apply them.
        </Text>

        {/* Name */}
        <Text
          className="text-sm font-medium mb-1.5"
          style={{ color: theme.foreground }}
        >
          Routine name
        </Text>
        <TextInput
          className="rounded-xl px-3.5 py-3 text-[15px] mb-4"
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.card,
            color: theme.foreground,
          }}
          placeholder="e.g. My morning routine"
          placeholderTextColor={theme.muted}
          value={name}
          onChangeText={setName}
        />

        {/* Time of day toggle */}
        <Text
          className="text-sm font-medium mb-1.5"
          style={{ color: theme.foreground }}
        >
          Time of day
        </Text>
        <View className="flex-row gap-2 mb-5">
          <Pressable
            onPress={() => setTimeOfDay("morning")}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3"
            style={{
              backgroundColor:
                timeOfDay === "morning" ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor:
                timeOfDay === "morning" ? theme.primary : theme.border,
            }}
          >
            <Sun
              size={16}
              color={timeOfDay === "morning" ? "#fff" : theme.muted}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: timeOfDay === "morning" ? "#fff" : theme.muted }}
            >
              Morning
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTimeOfDay("evening")}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3"
            style={{
              backgroundColor:
                timeOfDay === "evening" ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor:
                timeOfDay === "evening" ? theme.primary : theme.border,
            }}
          >
            <Moon
              size={16}
              color={timeOfDay === "evening" ? "#fff" : theme.muted}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: timeOfDay === "evening" ? "#fff" : theme.muted }}
            >
              Evening
            </Text>
          </Pressable>
        </View>

        {/* Steps */}
        <Text
          className="text-sm font-medium mb-1.5"
          style={{ color: theme.foreground }}
        >
          Steps {selectedProducts.length > 0 && `(${selectedProducts.length})`}
        </Text>

        {selectedProducts.length === 0 ? (
          <Card
            className="p-5 items-center mb-3"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Text
              className="text-sm text-center"
              style={{ color: theme.muted }}
            >
              No products added yet.
            </Text>
          </Card>
        ) : (
          <View className="mb-3">
            {selectedProducts.map((product, index) => (
              <Card
                key={product.id}
                className="p-3 flex-row items-center mb-2"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.primary }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[14px] uppercase"
                    style={{ color: theme.muted }}
                  >
                    {product.brand}
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: theme.foreground }}
                  >
                    {product.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeProduct(product.id)}
                  className="p-1"
                >
                  <X size={16} color={theme.muted} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => setPickerOpen(true)}
          className="flex-row items-center justify-center gap-1.5 rounded-xl py-3"
          style={{
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: theme.primary,
          }}
        >
          <Plus size={16} color={theme.primary} />
          <Text
            className="text-sm font-medium"
            style={{ color: theme.primary }}
          >
            Add product
          </Text>
        </Pressable>
      </ScrollView>

      {/* Submit bar */}
      <View
        className="p-4"
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className="rounded-xl py-3.5 items-center"
          style={{
            backgroundColor: submitting ? theme.primaryLight : theme.primary,
          }}
        >
          <Text className="text-white font-semibold">
            {submitting ? "Saving..." : "Save routine"}
          </Text>
        </Pressable>
      </View>

      {/* Product picker modal */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View
            className="rounded-t-3xl p-5"
            style={{
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + 16,
              minHeight: 320,
              maxHeight: "75%",
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base font-semibold"
                style={{ color: theme.foreground }}
              >
                Choose a product
              </Text>
              <Pressable onPress={() => setPickerOpen(false)}>
                <X size={20} color={theme.muted} />
              </Pressable>
            </View>

            <View className="flex-row gap-2 mb-4">
              <Pressable
                onPress={() => setPickerSource("mine")}
                className="flex-1 rounded-xl py-2.5 items-center"
                style={{
                  backgroundColor:
                    pickerSource === "mine" ? theme.primary : theme.card,
                  borderWidth: 1,
                  borderColor:
                    pickerSource === "mine" ? theme.primary : theme.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: pickerSource === "mine" ? "#fff" : theme.muted,
                  }}
                >
                  My products
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPickerSource("catalog")}
                className="flex-1 rounded-xl py-2.5 items-center"
                style={{
                  backgroundColor:
                    pickerSource === "catalog" ? theme.primary : theme.card,
                  borderWidth: 1,
                  borderColor:
                    pickerSource === "catalog" ? theme.primary : theme.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: pickerSource === "catalog" ? "#fff" : theme.muted,
                  }}
                >
                  All products
                </Text>
              </Pressable>
            </View>

            {loadingProducts ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 60,
                }}
              >
                <ActivityIndicator color={theme.primary} size="large" />
                <Text className="text-sm mt-3" style={{ color: theme.muted }}>
                  Loading products...
                </Text>
              </View>
            ) : pickerItems.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <Text
                  className="text-sm text-center"
                  style={{ color: theme.muted }}
                >
                  {pickerSource === "mine"
                    ? "You haven't added any products to your shelf yet."
                    : "No products found."}
                </Text>
                {pickerSource === "mine" && (
                  <Pressable
                    onPress={() => setPickerSource("catalog")}
                    className="mt-3"
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: theme.primary }}
                    >
                      Browse the full catalog instead
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <ScrollView>
                {pickerItems.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => addProduct(product)}
                    className="flex-row items-center justify-between py-3"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    }}
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-[14px] uppercase"
                        style={{ color: theme.muted }}
                      >
                        {product.brand}
                      </Text>
                      <Text
                        className="text-sm font-medium"
                        style={{ color: theme.foreground }}
                      >
                        {product.name}
                      </Text>
                      <Text
                        className="text-xs capitalize mt-0.5"
                        style={{ color: theme.muted }}
                      >
                        {product.category}
                      </Text>
                    </View>
                    <Plus size={16} color={theme.primary} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
