import React, { useRef, useState } from "react";
import { View, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { Text } from "../../components/ui/Text";
import { Image } from "expo-image";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { ChevronLeft, ScanFace, RotateCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "../../src/theme/ThemeContext";
import { analyzeFaceScan } from "../../src/api/faceScan";
import { useFaceScanStore } from "../../src/store/useFaceScanStore";

export default function FaceScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // The backend crops the photo to this oval (ovalCropRect in
  // src/lib/faceAnalysis.ts on the server) using these same proportions
  // and the screen's width / height — keep the two in sync if this
  // changes.
  const ovalWidth = width * 0.64;
  const ovalHeight = ovalWidth * 1.35;
  const ovalTop = height * 0.16;

  if (!permission) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  if (!permission.granted) {
    return (
      <View
        style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}
        className="px-6 items-center justify-center"
      >
        <ScanFace size={40} color={theme.primary} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: theme.foreground }}>
          Camera access needed
        </Text>
        <Text className="text-sm text-center mt-2 mb-5" style={{ color: theme.muted }}>
          We need camera permission to scan your face for skin concerns.
        </Text>
        <Pressable onPress={requestPermission} className="rounded-xl py-3 px-6" style={{ backgroundColor: theme.primary }}>
          <Text className="text-white font-medium text-sm">Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) setPhotoUri(photo.uri);
    } catch {
      Toast.show({ type: "error", text1: "Could not take photo — try again" });
    } finally {
      setCapturing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!photoUri) return;
    setAnalyzing(true);
    try {
      const result = await analyzeFaceScan(photoUri, width / height);
      useFaceScanStore.getState().setLatestScan(result);
      router.replace("/(main)/face-scan-results");
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.message || "Could not analyze that photo" });
    } finally {
      setAnalyzing(false);
    }
  };

  if (photoUri) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Image source={{ uri: photoUri }} style={{ flex: 1 }} contentFit="cover" />

        <View style={{ position: "absolute", top: insets.top + 12, left: 16 }}>
          <Pressable
            onPress={() => setPhotoUri(null)}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
        </View>

        <View
          style={{ position: "absolute", bottom: insets.bottom + 32, left: 0, right: 0 }}
          className="px-6 gap-3"
        >
          <Pressable
            onPress={handleAnalyze}
            disabled={analyzing}
            className="rounded-xl py-3.5 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: theme.primary }}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ScanFace size={18} color="#fff" />
            )}
            <Text className="text-white font-semibold text-sm">
              {analyzing ? "Analyzing your skin..." : "Analyze this photo"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPhotoUri(null)}
            disabled={analyzing}
            className="rounded-xl py-3 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <RotateCcw size={16} color="#fff" />
            <Text className="text-white font-medium text-sm">Retake</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />

      {/* Oval alignment guide */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: (width - ovalWidth) / 2,
          top: ovalTop,
          width: ovalWidth,
          height: ovalHeight,
          borderRadius: 9999,
          borderWidth: 3,
          borderColor: "rgba(255,255,255,0.85)",
        }}
      />

      <View style={{ position: "absolute", top: insets.top + 12, left: 16 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <ChevronLeft size={20} color="#fff" />
        </Pressable>
      </View>

      <View
        style={{ position: "absolute", top: ovalTop - 44, left: 0, right: 0 }}
        className="items-center px-6"
      >
        <View className="px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <Text className="text-white text-xs text-center">
            Center your face in the oval, in good natural light
          </Text>
        </View>
      </View>

      <View style={{ position: "absolute", bottom: insets.bottom + 36, left: 0, right: 0 }} className="items-center">
        <Pressable
          onPress={handleCapture}
          disabled={capturing}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: "#fff", opacity: capturing ? 0.6 : 1 }}
        >
          <View className="w-14 h-14 rounded-full" style={{ borderWidth: 2, borderColor: "#000" }} />
        </Pressable>
      </View>
    </View>
  );
}
