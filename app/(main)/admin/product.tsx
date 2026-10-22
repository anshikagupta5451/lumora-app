import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Switch,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Globe,
  ScanLine,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Text, TextInput } from "../../../components/ui/Text";
import { Card } from "../../../components/ui/Card";
import { useTheme } from "../../../src/theme/ThemeContext";
import { iconColors } from "../../../src/theme/iconColors";
import {
  ProductDraft,
  createProduct,
  deleteProduct,
  getAdminCategories,
  getAdminProducts,
  lookupProductBarcode,
  searchProductsOnline,
  updateProduct,
} from "../../../src/api/admin";

interface FormState {
  name: string;
  brand: string;
  category: string;
  price: string;
  ingredients: string; // comma-separated while editing
  imageUrl: string;
  barcode: string;
  isPromoted: boolean;
}

const EMPTY: FormState = {
  name: "",
  brand: "",
  category: "",
  price: "",
  ingredients: "",
  imageUrl: "",
  barcode: "",
  isPromoted: false,
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold mb-1.5" style={{ color: theme.foreground }}>
        {label}
      </Text>
      {children}
      {hint ? (
        <Text className="text-[11px] mt-1" style={{ color: theme.muted }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export default function AdminProductFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ProductDraft[] | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    color: theme.foreground,
  };

  useEffect(() => {
    getAdminCategories().then(setCategories).catch(() => {});
    if (!id) return;
    // The admin list endpoint is the only one that returns barcode and
    // isPromoted, so find the product there.
    getAdminProducts()
      .then((all) => {
        const p = all.find((x) => x.id === id);
        if (!p) throw new Error("Product not found");
        setForm({
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price ? String(p.price) : "",
          ingredients: p.ingredients.join(", "),
          imageUrl: p.imageUrl ?? "",
          barcode: p.barcode ?? "",
          isPromoted: p.isPromoted,
        });
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: err.message || "Could not load product" });
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  // Fill only what the lookup actually has; keep anything already typed
  // (especially price, which Open Beauty Facts never provides).
  const applyDraft = (d: ProductDraft) => {
    if (d.existingProductId && d.existingProductId !== id) {
      Alert.alert(
        "Already in your catalog",
        `${d.name} is already a product. Open it instead?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open",
            onPress: () => router.replace(`/(main)/admin/product?id=${d.existingProductId}`),
          },
        ],
      );
      return;
    }
    setForm((f) => ({
      ...f,
      name: d.name || f.name,
      brand: d.brand || f.brand,
      category: d.category && categories.includes(d.category) ? d.category : f.category,
      ingredients: d.ingredients.length ? d.ingredients.join(", ") : f.ingredients,
      imageUrl: d.imageUrl || f.imageUrl,
      barcode: d.barcode || f.barcode,
    }));
    setResults(null);
    Toast.show({
      type: "success",
      text1: "Filled from Open Beauty Facts",
      text2: "Check the details and add a price.",
    });
  };

  const runSearch = async () => {
    const q = searchText.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      // All digits → treat as a barcode.
      if (/^\d{6,14}$/.test(q)) {
        applyDraft(await lookupProductBarcode(q));
      } else {
        const found = await searchProductsOnline(q);
        setResults(found);
        if (!found.length) Toast.show({ type: "info", text1: "Nothing found — fill it in manually" });
      }
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.message || "Lookup failed" });
    } finally {
      setSearching(false);
    }
  };

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scannerOpen) return;
    setScannerOpen(false);
    set("barcode", data);
    setSearching(true);
    try {
      applyDraft(await lookupProductBarcode(data));
    } catch (err: any) {
      Toast.show({ type: "info", text1: err.message || "Not found — fill it in manually" });
    } finally {
      setSearching(false);
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setScannerOpen(true);
  };

  const save = async () => {
    const input = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      price: Number(form.price),
      ingredients: form.ingredients.split(",").map((i) => i.trim()).filter(Boolean),
      imageUrl: form.imageUrl.trim() || null,
      barcode: form.barcode.trim() || null,
      isPromoted: form.isPromoted,
    };
    setSaving(true);
    try {
      if (id) await updateProduct(id, input);
      else await createProduct(input);
      Toast.show({ type: "success", text1: editing ? "Product updated" : "Product added" });
      router.back();
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.message || "Could not save" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert("Delete product?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id);
            Toast.show({ type: "success", text1: "Product deleted" });
            router.back();
          } catch (err: any) {
            Toast.show({ type: "error", text1: err.message || "Could not delete" });
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }} className="items-center justify-center">
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4" style={{ paddingTop: insets.top + 12 }}>
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-4">
            <ChevronLeft size={18} color={theme.muted} />
            <Text className="text-sm" style={{ color: theme.muted }}>
              Back
            </Text>
          </Pressable>

          <Text className="text-2xl font-bold mb-4" style={{ color: theme.foreground }}>
            {editing ? "Edit product" : "Add product"}
          </Text>

          {/* Fill from the internet */}
          <Card className="p-4 mb-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <View className="flex-row items-center gap-2 mb-1">
              <Globe size={15} color={iconColors.blue} />
              <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                Fill from the internet
              </Text>
            </View>
            <Text className="text-xs mb-3" style={{ color: theme.muted }}>
              Search Open Beauty Facts by name or barcode, or scan the product. You&apos;ll still
              need to add the price.
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 rounded-xl px-3.5 py-3 text-sm"
                style={inputStyle}
                placeholder="e.g. Plum niacinamide toner"
                placeholderTextColor={theme.muted}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={runSearch}
                returnKeyType="search"
              />
              <Pressable
                onPress={runSearch}
                disabled={searching}
                className="w-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                {searching ? <ActivityIndicator color="#fff" /> : <Search size={18} color="#fff" />}
              </Pressable>
              <Pressable
                onPress={openScanner}
                className="w-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <ScanLine size={18} color={theme.primary} />
              </Pressable>
            </View>

            {results && results.length > 0 && (
              <View className="mt-3">
                {results.map((d, i) => (
                  <Pressable
                    key={`${d.barcode ?? d.name}-${i}`}
                    onPress={() => applyDraft(d)}
                    className="flex-row items-center gap-3 py-2.5"
                    style={{ borderTopWidth: i ? 1 : 0, borderColor: theme.border }}
                  >
                    {d.imageUrl ? (
                      <Image source={{ uri: d.imageUrl }} style={{ width: 40, height: 40, borderRadius: 8 }} />
                    ) : (
                      <View className="w-10 h-10 rounded-lg" style={{ backgroundColor: theme.primaryLight }} />
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-medium" style={{ color: theme.foreground }} numberOfLines={1}>
                        {d.name}
                      </Text>
                      <Text className="text-[11px]" style={{ color: theme.muted }} numberOfLines={1}>
                        {[d.brand, d.quantity, d.ingredients.length ? `${d.ingredients.length} ingredients` : "no ingredients listed"]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    </View>
                    {d.existingProductId && (
                      <Text className="text-[10px] font-semibold" style={{ color: iconColors.teal }}>
                        IN CATALOG
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </Card>

          {form.imageUrl ? (
            <Image
              source={{ uri: form.imageUrl }}
              style={{ width: 96, height: 96, borderRadius: 16, marginBottom: 16, alignSelf: "center" }}
              contentFit="cover"
            />
          ) : null}

          <Field label="Name">
            <TextInput
              className="rounded-xl px-3.5 py-3 text-sm"
              style={inputStyle}
              placeholder="Niacinamide 10% + Zinc 1%"
              placeholderTextColor={theme.muted}
              value={form.name}
              onChangeText={(v) => set("name", v)}
            />
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Brand">
                <TextInput
                  className="rounded-xl px-3.5 py-3 text-sm"
                  style={inputStyle}
                  placeholder="The Ordinary"
                  placeholderTextColor={theme.muted}
                  value={form.brand}
                  onChangeText={(v) => set("brand", v)}
                />
              </Field>
            </View>
            <View style={{ width: 110 }}>
              <Field label="Price (₹)">
                <TextInput
                  className="rounded-xl px-3.5 py-3 text-sm"
                  style={inputStyle}
                  placeholder="599"
                  placeholderTextColor={theme.muted}
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(v) => set("price", v.replace(/[^\d.]/g, ""))}
                />
              </Field>
            </View>
          </View>

          <Field label="Category">
            <View className="flex-row flex-wrap gap-2">
              {categories.map((c) => {
                const active = form.category === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => set("category", c)}
                    className="rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: active ? theme.primary : theme.card,
                      borderWidth: 1,
                      borderColor: active ? theme.primary : theme.border,
                    }}
                  >
                    <Text
                      className="text-xs font-medium capitalize"
                      style={{ color: active ? "#fff" : theme.foreground }}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field
            label="Ingredients"
            hint="Comma-separated. These drive matching — e.g. niacinamide, salicylic acid, ceramides."
          >
            <TextInput
              className="rounded-xl px-3.5 py-3 text-sm"
              style={[inputStyle, { minHeight: 90, textAlignVertical: "top" }]}
              placeholder="niacinamide, zinc pca, glycerin"
              placeholderTextColor={theme.muted}
              multiline
              value={form.ingredients}
              onChangeText={(v) => set("ingredients", v)}
            />
          </Field>

          <Field label="Barcode" hint="Lets users find this product by scanning it.">
            <TextInput
              className="rounded-xl px-3.5 py-3 text-sm"
              style={inputStyle}
              placeholder="8906118414215"
              placeholderTextColor={theme.muted}
              keyboardType="number-pad"
              value={form.barcode}
              onChangeText={(v) => set("barcode", v.replace(/\D/g, ""))}
            />
          </Field>

          <Field label="Image URL">
            <TextInput
              className="rounded-xl px-3.5 py-3 text-sm"
              style={inputStyle}
              placeholder="https://…"
              placeholderTextColor={theme.muted}
              autoCapitalize="none"
              keyboardType="url"
              value={form.imageUrl}
              onChangeText={(v) => set("imageUrl", v)}
            />
          </Field>

          <Card
            className="p-4 mb-5 flex-row items-center justify-between"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-2 flex-1 pr-3">
              <Star size={16} color={iconColors.amber} />
              <View className="flex-1">
                <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                  Featured
                </Text>
                <Text className="text-[11px] mt-0.5" style={{ color: theme.muted }}>
                  Shown first, with a Featured label, in scan suggestions.
                </Text>
              </View>
            </View>
            <Switch
              value={form.isPromoted}
              onValueChange={(v) => set("isPromoted", v)}
              trackColor={{ true: iconColors.amber }}
            />
          </Card>

          <Pressable
            onPress={save}
            disabled={saving}
            className="rounded-xl py-3.5 items-center"
            style={{ backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }}
          >
            <Text className="text-white font-semibold">
              {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
            </Text>
          </Pressable>

          {editing && (
            <Pressable
              onPress={confirmDelete}
              className="flex-row items-center justify-center gap-1.5 rounded-xl py-3 mt-3"
            >
              <Trash2 size={15} color={iconColors.morning} />
              <Text className="text-sm font-medium" style={{ color: iconColors.morning }}>
                Delete product
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"] }}
            onBarcodeScanned={scannerOpen ? onBarcodeScanned : undefined}
          />
          <Pressable
            onPress={() => setScannerOpen(false)}
            className="absolute right-5 w-10 h-10 rounded-full items-center justify-center"
            style={{ top: insets.top + 12, backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <X size={20} color="#fff" />
          </Pressable>
          <View className="absolute left-0 right-0 items-center" style={{ bottom: insets.bottom + 40 }}>
            <Text className="text-white text-sm">Point the camera at the barcode</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
