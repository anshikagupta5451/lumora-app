import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Barcode,
  CircleHelp,
  ImageIcon,
  Lock,
  ScanLine,
  X,
  Zap,
  ZapOff,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ProductMatchSheet } from "../../components/ProductMatchSheet";
import { ScannerHelpSheet } from "../../components/ScannerHelpSheet";
import { Text } from "../../components/ui/Text";
import { matchProducts, ProductMatch } from "../../src/api/products";
import { readProductText, supportsTextRecognition } from "../../src/lib/textRecognition";
import { useTheme } from "../../src/theme/ThemeContext";

// Photo scanner: snap the front of a product, read its text on the phone,
// and match it to our catalog and Open Beauty Facts. Picking a match leads
// to the same "Is this right for me?" verdict as a barcode scan.

const HELP_SEEN_KEY = "product-scanner-help-seen";
// Dark wash around the frame; the cut-out is the only undimmed area.
const MASK = "rgba(17, 12, 34, 0.86)";
const FRAME_RADIUS = 32;
// The mask is one huge border around the frame, so its inner edge is a
// rounded hole. That works over Android's camera surface, which can't be
// clipped to rounded corners itself.
const MASK_BORDER = 1200;

type Phase = "camera" | "reading" | "matching" | "results";

export default function ProductScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [phase, setPhase] = useState<Phase>("camera");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [matches, setMatches] = useState<ProductMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [torch, setTorch] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const scanLine = useRef(new Animated.Value(0)).current;
  const busy = phase === "reading" || phase === "matching";

  // Show the tips the first time someone opens the scanner.
  useEffect(() => {
    AsyncStorage.getItem(HELP_SEEN_KEY)
      .then((seen) => {
        if (!seen) {
          setHelpOpen(true);
          AsyncStorage.setItem(HELP_SEEN_KEY, "1").catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!busy) return;
    scanLine.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [busy, scanLine]);

  const frame = {
    left: 20,
    top: insets.top + 72,
    width: Math.max(0, size.width - 40),
    height: Math.max(0, size.height - (insets.top + 72) - (insets.bottom + 136)),
  };

  const reset = () => {
    setPhase("camera");
    setPhotoUri(null);
    setMatches([]);
  };

  const analyze = async (uri: string) => {
    setPhotoUri(uri);
    setTorch(false);
    setPhase("reading");
    try {
      const lines = await readProductText(uri);
      if (!lines.length) {
        setMatches([]);
        setPhase("results");
        return;
      }
      setPhase("matching");
      const res = await matchProducts({ lines });
      setMatches(res.matches);
      setPhase("results");
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      Toast.show({
        type: "error",
        text1: message.includes("linked")
          ? "Photo scanning needs an app update"
          : "Couldn't scan that photo",
        text2: message.includes("linked") ? "Rebuild the app to enable it." : message || "Please try again.",
      });
      reset();
    }
  };

  const capture = async () => {
    if (busy || !cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) await analyze(photo.uri);
    } catch {
      Toast.show({ type: "error", text1: "Couldn't take the photo" });
    }
  };

  const pickFromGallery = async () => {
    if (busy) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled && result.assets[0]) await analyze(result.assets[0].uri);
  };

  const search = async (query: string) => {
    setSearching(true);
    try {
      const res = await matchProducts({ query });
      setMatches(res.matches);
      setPhase("results");
    } catch (e) {
      Toast.show({ type: "error", text1: e instanceof Error ? e.message : "Search failed" });
    } finally {
      setSearching(false);
    }
  };

  const select = (match: ProductMatch) => {
    if (match.productId) router.push(`/(main)/product/${match.productId}`);
    else if (match.barcode) router.push(`/(main)/product-check?code=${encodeURIComponent(match.barcode)}`);
  };

  if (!supportsTextRecognition) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.background }}>
        <Text className="text-base font-semibold text-center" style={{ color: theme.foreground }}>
          Photo scanning works in the Lumora app on your phone.
        </Text>
      </View>
    );
  }

  if (!permission) return <View style={{ flex: 1, backgroundColor: "#000" }} />;

  if (!permission.granted) {
    return (
      <View
        className="flex-1 px-6 items-center justify-center"
        style={{ backgroundColor: theme.background, paddingTop: insets.top }}
      >
        <ScanLine size={40} color={theme.primary} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: theme.foreground }}>
          Camera access needed
        </Text>
        <Text className="text-sm text-center mt-2 mb-5" style={{ color: theme.muted }}>
          Allow the camera to photograph a product, or choose a photo you already have.
        </Text>
        <Pressable onPress={requestPermission} className="rounded-xl py-3 px-6 mb-3" style={{ backgroundColor: theme.primary }}>
          <Text className="text-white font-medium text-sm">Allow camera</Text>
        </Pressable>
        <Pressable onPress={pickFromGallery}>
          <Text className="text-sm font-medium underline" style={{ color: theme.primary }}>
            Choose from gallery
          </Text>
        </Pressable>
        {busy ? <ActivityIndicator color={theme.primary} className="mt-6" /> : null}
        {phase === "results" ? (
          <ProductMatchSheet
            matches={matches}
            searching={searching}
            bottomInset={insets.bottom}
            onSelect={select}
            onSearch={search}
            onAddMissing={() => router.push("/(main)/add-my-product")}
            onClose={reset}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#000" }}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ flex: 1 }} contentFit="cover" />
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} enableTorch={torch} />
      )}

      {size.width > 0 ? (
        <>
          {/* Dimmed surround with a rounded cut-out */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: frame.left - MASK_BORDER,
              top: frame.top - MASK_BORDER,
              width: frame.width + MASK_BORDER * 2,
              height: frame.height + MASK_BORDER * 2,
              borderWidth: MASK_BORDER,
              borderRadius: FRAME_RADIUS + MASK_BORDER,
              borderColor: MASK,
            }}
          />
          {/* Theme tint at the top and bottom, fading into the mask */}
          <LinearGradient
            pointerEvents="none"
            colors={[theme.primary + "B3", "transparent"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: frame.top }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["transparent", theme.accent + "80"]}
            style={{ position: "absolute", left: 0, right: 0, top: frame.top + frame.height, bottom: 0 }}
          />
          {/* Frame outline */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              ...frame,
              borderRadius: FRAME_RADIUS,
              borderWidth: 2.5,
              borderColor: "rgba(255,255,255,0.92)",
            }}
          />

          {/* Privacy pill */}
          <View
            pointerEvents="none"
            className="absolute self-center flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5"
            style={{ top: frame.top + 14, backgroundColor: "rgba(17,12,34,0.6)" }}
          >
            <Lock size={12} color="#fff" />
            <Text className="text-xs font-medium text-white">Read on your phone · photo not uploaded</Text>
          </View>

          {busy ? (
            <>
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: frame.left + 12,
                  width: frame.width - 24,
                  top: frame.top,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: theme.primaryLight,
                  shadowColor: theme.primary,
                  shadowOpacity: 0.9,
                  shadowRadius: 10,
                  elevation: 6,
                  transform: [
                    {
                      translateY: scanLine.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, Math.max(24, frame.height - 24)],
                      }),
                    },
                  ],
                }}
              />
              <View
                pointerEvents="none"
                className="absolute self-center flex-row items-center gap-2 rounded-full px-4 py-2.5"
                style={{ top: frame.top + frame.height - 64, backgroundColor: "rgba(17,12,34,0.75)" }}
              >
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-sm font-medium text-white">
                  {phase === "reading" ? "Reading the label…" : "Finding the product…"}
                </Text>
              </View>
            </>
          ) : null}
        </>
      ) : null}

      {/* Header */}
      <View
        className="absolute left-0 right-0 flex-row items-center px-4"
        style={{ top: insets.top + 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="w-11 h-11 items-center justify-center"
        >
          <X size={26} color="#fff" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-semibold text-white">
          Capture front of the product
        </Text>
        <Pressable
          onPress={() => setTorch((t) => !t)}
          disabled={!!photoUri}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: torch ? "#fff" : "rgba(255,255,255,0.18)" }}
        >
          {torch ? <Zap size={20} color={theme.primary} /> : <ZapOff size={20} color="#fff" />}
        </Pressable>
      </View>

      {/* Controls */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-6"
        style={{ bottom: insets.bottom + 28 }}
      >
        <Pressable
          onPress={pickFromGallery}
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
        >
          <ImageIcon size={22} color="#fff" />
        </Pressable>

        <Pressable
          onPress={capture}
          disabled={busy || !!photoUri}
          className="items-center justify-center rounded-full"
          style={({ pressed }) => ({
            width: 82,
            height: 82,
            borderWidth: 4,
            borderColor: theme.primaryLight,
            backgroundColor: "rgba(255,255,255,0.25)",
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <View className="w-[64px] h-[64px] rounded-full items-center justify-center bg-white">
            {busy ? <ActivityIndicator color={theme.primary} /> : <ScanLine size={26} color={theme.primary} />}
          </View>
        </Pressable>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setHelpOpen(true)}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <CircleHelp size={22} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(main)/scan-product")}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <Barcode size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      {phase === "results" ? (
        <ProductMatchSheet
          matches={matches}
          searching={searching}
          bottomInset={insets.bottom}
          onSelect={select}
          onSearch={search}
          onAddMissing={() => router.push("/(main)/add-my-product")}
          onClose={reset}
        />
      ) : null}

      <ScannerHelpSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </View>
  );
}
