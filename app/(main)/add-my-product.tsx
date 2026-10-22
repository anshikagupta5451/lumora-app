import React, { useState, useEffect } from 'react'
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { useRouter, useFocusEffect } from 'expo-router'
import {
  ChevronLeft, Search, PackagePlus, Sparkles, Droplet,
  Sun as SunIcon, SprayCan, Layers, Wand2, Scissors, MoreHorizontal,
  Lock, Unlock, ScanLine,
} from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { Card } from '../../components/ui/Card'
import { StarRatingInput } from '../../components/StarRatingInput'
import { useTheme } from '../../src/theme/ThemeContext'
import { getProducts, Product } from '../../src/api/products'
import { addMyProduct } from '../../src/api/userProducts'
import { submitReview } from '../../src/api/reviews'
import { useScanStore } from '../../src/store/useScanStore'

const categoryOptions = [
  { label: 'Cleanser', icon: Droplet },
  { label: 'Serum', icon: Sparkles },
  { label: 'Moisturizer', icon: Layers },
  { label: 'Sunscreen', icon: SunIcon },
  { label: 'Toner', icon: SprayCan },
  { label: 'Mask', icon: Wand2 },
  { label: 'Haircare', icon: Scissors },
  { label: 'Other', icon: MoreHorizontal },
]

export default function AddMyProductScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()

  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog')

  // Catalog search state
  const [query, setQuery] = useState('')
  const [catalog, setCatalog] = useState<Product[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Custom product state
  const [category, setCategory] = useState('')
  const [customName, setCustomName] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [rating, setRating] = useState(0)

  // Shared fields
  const [quantityTotal, setQuantityTotal] = useState('')
  const [quantityUnit, setQuantityUnit] = useState<'ml' | 'g' | 'uses'>('ml')
  const [hasOpened, setHasOpened] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'catalog') {
      setLoadingCatalog(true)
      getProducts({ query: query || undefined })
        .then(setCatalog)
        .catch(() => setCatalog([]))
        .finally(() => setLoadingCatalog(false))
    }
  }, [mode, query])

  // Pick up a barcode scan result handed back by the scanner screen
  useFocusEffect(
    React.useCallback(() => {
      const scanned = useScanStore.getState().scannedProduct
      if (scanned) {
        setMode('catalog')
        setSelectedProduct(scanned)
        setQuery(scanned.name)
        useScanStore.getState().setScannedProduct(null)
      }
    }, []),
  )

  const canSubmit = mode === 'catalog' ? Boolean(selectedProduct) : Boolean(customName.trim())

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await addMyProduct({
        productId: mode === 'catalog' ? selectedProduct!.id : undefined,
        customName: mode === 'custom' ? customName.trim() : undefined,
        customBrand: mode === 'custom' ? customBrand.trim() || undefined : undefined,
        category: mode === 'custom' ? category.toLowerCase() || undefined : undefined,
        openedAt: hasOpened ? new Date().toISOString() : undefined,
        quantityTotal: quantityTotal ? Number(quantityTotal) : undefined,
        quantityUnit: quantityTotal ? quantityUnit : undefined,
      })

      if (rating > 0 && mode === 'catalog' && selectedProduct) {
        try {
          await submitReview({
            productId: selectedProduct.id,
            rating,
            comment: 'Added from my product shelf.',
            concerns: [],
            isAnonymous: isPrivate,
          })
        } catch {
          // non-critical
        }
      }

      Toast.show({ type: 'success', text1: 'Added to your shelf ✨' })
      router.back()
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Could not add product' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}>
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-4">
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>Back</Text>
        </Pressable>

        {/* Hero header */}
        <View className="items-center mb-6">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <PackagePlus size={30} color={theme.primary} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>Add a product</Text>
          <Text className="text-sm mt-1 text-center" style={{ color: theme.muted }}>
            Find it in our catalog, or add your own — it&apos;s free.
          </Text>
        </View>

        {/* Mode toggle */}
        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => setMode('catalog')}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3"
            style={{
              backgroundColor: mode === 'catalog' ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: mode === 'catalog' ? theme.primary : theme.border,
            }}
          >
            <Search size={15} color={mode === 'catalog' ? '#fff' : theme.muted} />
            <Text className="text-sm font-semibold" style={{ color: mode === 'catalog' ? '#fff' : theme.muted }}>
              Search catalog
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('custom')}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3"
            style={{
              backgroundColor: mode === 'custom' ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: mode === 'custom' ? theme.primary : theme.border,
            }}
          >
            <PackagePlus size={15} color={mode === 'custom' ? '#fff' : theme.muted} />
            <Text className="text-sm font-semibold" style={{ color: mode === 'custom' ? '#fff' : theme.muted }}>
              Add my own
            </Text>
          </Pressable>
        </View>

        {mode === 'catalog' ? (
          <>
            <Card className="p-4 mb-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <View className="flex-row items-center gap-2">
                <View
                  className="flex-1 flex-row items-center rounded-xl px-3.5 py-3"
                  style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background }}
                >
                  <Search size={16} color={theme.muted} />
                  <TextInput
                    className="flex-1 ml-2 text-sm"
                    style={{ color: theme.foreground }}
                    placeholder="Search by name or brand..."
                    placeholderTextColor={theme.muted}
                    value={query}
                    onChangeText={setQuery}
                  />
                </View>
                <Pressable
                  onPress={() => router.push('/(main)/scan-product?returnTo=add-my-product')}
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primary }}
                >
                  <ScanLine size={18} color={theme.primary} />
                </Pressable>
              </View>
            </Card>

            {/* Can't find it prompt */}
            <Pressable
              onPress={() => setMode('custom')}
              className="flex-row items-center gap-3 p-3.5 rounded-2xl mb-4"
              style={{ backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primary }}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <PackagePlus size={18} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold" style={{ color: theme.primary }}>Can&apos;t find this product?</Text>
                <Text className="text-xs" style={{ color: theme.muted }}>Tap here to add it yourself — free & easy</Text>
              </View>
            </Pressable>

            {loadingCatalog ? (
              <View className="items-center py-10">
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : catalog.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-sm" style={{ color: theme.muted }}>No matches — try adding it yourself above.</Text>
              </View>
            ) : (
              catalog.slice(0, 10).map((product) => {
                const isSelected = selectedProduct?.id === product.id
                return (
                  <Pressable
                    key={product.id}
                    onPress={() => setSelectedProduct(product)}
                    className="mb-2"
                  >
                    <Card
                      className="p-3 flex-row items-center"
                      style={{
                        backgroundColor: isSelected ? theme.primaryLight : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      }}
                    >
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: theme.background }}
                      >
                        <Droplet size={18} color={theme.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[14px] uppercase" style={{ color: theme.muted }}>{product.brand}</Text>
                        <Text className="text-sm font-medium" style={{ color: theme.foreground }}>{product.name}</Text>
                      </View>
                      {isSelected && (
                        <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary }}>
                          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                        </View>
                      )}
                    </Card>
                  </Pressable>
                )
              })
            )}
          </>
        ) : (
          <Card className="p-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.foreground }}>Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {categoryOptions.map(({ label, icon: Icon }) => {
                const active = category === label
                return (
                  <Pressable
                    key={label}
                    onPress={() => setCategory(label)}
                    className="flex-row items-center gap-1.5 px-3 py-2 rounded-full"
                    style={{
                      backgroundColor: active ? theme.primary : theme.background,
                      borderWidth: 1,
                      borderColor: active ? theme.primary : theme.border,
                    }}
                  >
                    <Icon size={13} color={active ? '#fff' : theme.muted} />
                    <Text className="text-xs font-medium" style={{ color: active ? '#fff' : theme.muted }}>
                      {label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <Text className="text-sm font-medium mb-1.5" style={{ color: theme.foreground }}>Brand</Text>
            <TextInput
              className="rounded-xl px-3.5 py-3 text-sm mb-3"
              style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, color: theme.foreground }}
              placeholder="e.g. Local brand name"
              placeholderTextColor={theme.muted}
              value={customBrand}
              onChangeText={setCustomBrand}
            />

            <Text className="text-sm font-medium mb-1.5" style={{ color: theme.foreground }}>Product name</Text>
            <TextInput
              className="rounded-xl px-3.5 py-3 text-sm mb-4"
              style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, color: theme.foreground }}
              placeholder="e.g. My local pharmacy moisturizer"
              placeholderTextColor={theme.muted}
              value={customName}
              onChangeText={setCustomName}
            />

            <Pressable
              onPress={() => setIsPrivate(!isPrivate)}
              className="flex-row items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }}
            >
              {isPrivate ? <Lock size={16} color={theme.primary} /> : <Unlock size={16} color={theme.muted} />}
              <View className="flex-1">
                <Text className="text-xs font-medium" style={{ color: theme.foreground }}>
                  {isPrivate ? 'Private — only you can see this' : 'Visible to you only (default)'}
                </Text>
              </View>
              <View
                className="w-11 h-6 rounded-full justify-center px-0.5"
                style={{ backgroundColor: isPrivate ? theme.primary : theme.border }}
              >
                <View className="w-5 h-5 rounded-full bg-white" style={{ marginLeft: isPrivate ? 20 : 0 }} />
              </View>
            </Pressable>

            <Text className="text-sm font-semibold mt-5 mb-2" style={{ color: theme.foreground }}>
              Already tried it? Rate it
            </Text>
            <StarRatingInput value={rating} onChange={setRating} />
          </Card>
        )}

        {/* Quantity */}
        <Card className="p-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <View className="flex-row items-center gap-2 mb-1">
            <Layers size={15} color={theme.primary} />
            <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
              Quantity
            </Text>
            <Text className="text-xs" style={{ color: theme.muted }}>(optional)</Text>
          </View>
          <Text className="text-xs mb-3" style={{ color: theme.muted }}>
            Helps us estimate when you&apos;ll run out.
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 rounded-xl px-3.5 py-3 text-sm"
              style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, color: theme.foreground }}
              placeholder="e.g. 50"
              placeholderTextColor={theme.muted}
              value={quantityTotal}
              onChangeText={setQuantityTotal}
              keyboardType="numeric"
            />
            <View className="flex-row gap-1.5">
              {(['ml', 'g', 'uses'] as const).map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => setQuantityUnit(unit)}
                  className="px-3 py-3 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: quantityUnit === unit ? theme.primaryLight : theme.background,
                    borderWidth: 1,
                    borderColor: quantityUnit === unit ? theme.primary : theme.border,
                  }}
                >
                  <Text className="text-xs font-medium" style={{ color: quantityUnit === unit ? theme.primary : theme.muted }}>
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        {/* Opened toggle */}
        <Card className="p-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-medium" style={{ color: theme.foreground }}>
                Already opened / in use?
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
                We&apos;ll track it from today.
              </Text>
            </View>
            <Pressable
              onPress={() => setHasOpened(!hasOpened)}
              className="w-12 h-7 rounded-full justify-center px-0.5"
              style={{ backgroundColor: hasOpened ? theme.primary : theme.border }}
            >
              <View className="w-6 h-6 rounded-full bg-white" style={{ marginLeft: hasOpened ? 20 : 0 }} />
            </Pressable>
          </View>
        </Card>
      </ScrollView>

      <View className="p-4" style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingBottom: insets.bottom + 16 }}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          className="flex-row items-center justify-center gap-2 rounded-xl py-3.5"
          style={{ backgroundColor: (!canSubmit || submitting) ? theme.primaryLight : theme.primary }}
        >
          {!submitting && <PackagePlus size={16} color="#fff" />}
          <Text className="text-white font-semibold">
            {submitting ? 'Adding...' : 'Add to my shelf'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}