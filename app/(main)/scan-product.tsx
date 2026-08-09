import React, { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { ChevronLeft, ScanLine } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../src/theme/ThemeContext'
import { getProductByBarcode } from '../../src/api/products'

export default function ScanProductScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [looking, setLooking] = useState(false)

  if (!permission) return <View style={{ flex: 1, backgroundColor: theme.background }} />

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }} className="px-6 items-center justify-center">
        <ScanLine size={40} color={theme.primary} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: theme.foreground }}>
          Camera access needed
        </Text>
        <Text className="text-sm text-center mt-2 mb-5" style={{ color: theme.muted }}>
          We need camera permission to scan product barcodes.
        </Text>
        <Pressable onPress={requestPermission} className="rounded-xl py-3 px-6" style={{ backgroundColor: theme.primary }}>
          <Text className="text-white font-medium text-sm">Allow camera</Text>
        </Pressable>
      </View>
    )
  }

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned || looking) return
    setScanned(true)
    setLooking(true)
    try {
      const product = await getProductByBarcode(data)
      router.replace(`/(main)/share-review?productId=${product.id}`)
    } catch {
      Toast.show({ type: 'info', text1: "Product not found — you can add it manually" })
      router.replace('/(main)/add-my-product')
    } finally {
      setLooking(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      <View style={{ position: 'absolute', top: insets.top + 12, left: 16 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <ChevronLeft size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={{ position: 'absolute', bottom: insets.bottom + 40, left: 0, right: 0, alignItems: 'center' }}>
        {looking ? (
          <View className="flex-row items-center gap-2 px-4 py-2.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <ActivityIndicator color="#fff" size="small" />
            <Text className="text-white text-sm">Looking up product...</Text>
          </View>
        ) : (
          <View className="px-4 py-2.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <Text className="text-white text-sm">Point camera at a barcode</Text>
          </View>
        )}
      </View>
    </View>
  )
}