import {
  ChevronDown,
  ChevronUp,
  Package,
  RefreshCw,
  ScanLine,
  X,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/theme/ThemeContext";
import { Text } from "./ui/Text";

const TIPS: { title: string; sub?: string; icon?: typeof Zap }[] = [
  {
    title: "Photograph the front of the product.",
    sub: "Make sure the brand and product name are in view.",
  },
  { title: "Use a plain background if you can." },
  {
    title: "Hold steady so it isn't blurry.",
    sub: "Move back a little if it won't focus.",
    icon: RefreshCw,
  },
  {
    title: "Find good light and avoid glare.",
    sub: "Turn on the flash if it's dim.",
    icon: Zap,
  },
];

const FAQ = [
  {
    q: "Why did I get several results?",
    a: "Brands often give products very similar names and packaging, so we show the closest matches and how sure we are about each. Open “Similar matches” to pick the right one.",
  },
  {
    q: "Product not found?",
    a: "1. Check “Similar matches” if it's shown.\n2. Try “Manual search” with the brand and name.\n3. Still missing? Use “Add missing product” to add it to your shelf.\n\nYou can also switch to the barcode scanner for an exact match.",
  },
  {
    q: "Is my photo uploaded?",
    a: "No. The text on the pack is read on your phone, and only those words are sent to find the product. The photo itself never leaves your device.",
  },
];

// A tiny drawn phone-with-product, in place of a sample photo.
function Illustration() {
  const { theme } = useTheme();
  return (
    <View
      className="self-center rounded-[28px] p-3 mt-2"
      style={{ width: 168, backgroundColor: theme.primary }}
    >
      <View
        className="rounded-[20px] items-center justify-center"
        style={{ height: 210, borderWidth: 2, borderColor: "rgba(255,255,255,0.9)" }}
      >
        <View
          className="rounded-2xl items-center justify-center"
          style={{ width: 72, height: 120, backgroundColor: "rgba(255,255,255,0.92)" }}
        >
          <Package size={30} color={theme.primary} />
          <View className="mt-2 rounded-full" style={{ width: 40, height: 5, backgroundColor: theme.primary + "55" }} />
          <View className="mt-1 rounded-full" style={{ width: 28, height: 5, backgroundColor: theme.primary + "33" }} />
        </View>
      </View>
      <View
        className="self-center -mt-5 w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: "#fff", borderWidth: 3, borderColor: theme.primaryLight }}
      >
        <ScanLine size={18} color={theme.primary} />
      </View>
    </View>
  );
}

export function ScannerHelpSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose} />
      <View
        className="absolute left-0 right-0 bottom-0 rounded-t-[28px]"
        style={{ backgroundColor: theme.background, top: insets.top + 24 }}
      >
        <View className="items-center pt-2.5">
          <View className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
        </View>
        <View className="flex-row items-center px-5 pt-3 pb-2">
          <View className="flex-1 flex-row items-center justify-center gap-2 pl-8">
            <ScanLine size={22} color={theme.primary} />
            <Text className="text-xl font-bold" style={{ color: theme.primary }}>
              Product Scanner
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} className="w-8 h-8 items-center justify-center">
            <X size={22} color={theme.primary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
          {TIPS.map((tip) => (
            <View key={tip.title} className="flex-row gap-3 mb-4">
              <View className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: theme.primary }} />
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: theme.foreground }}>
                  {tip.title}
                </Text>
                {tip.sub ? (
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    {tip.icon ? <tip.icon size={13} color={theme.muted} /> : null}
                    <Text className="text-sm" style={{ color: theme.muted }}>
                      {tip.sub}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}

          <Illustration />

          <View
            className="mt-6 rounded-2xl overflow-hidden"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
          >
            <Pressable
              onPress={() => setFaqOpen((o) => !o)}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
                FAQ
              </Text>
              {faqOpen ? (
                <ChevronUp size={18} color={theme.muted} />
              ) : (
                <ChevronDown size={18} color={theme.muted} />
              )}
            </Pressable>
            {faqOpen
              ? FAQ.map((item) => (
                  <View
                    key={item.q}
                    className="px-4 py-3.5"
                    style={{ borderTopWidth: 1, borderTopColor: theme.border }}
                  >
                    <Text className="text-base font-semibold" style={{ color: theme.foreground }}>
                      {item.q}
                    </Text>
                    <Text className="text-sm mt-1 leading-5" style={{ color: theme.muted }}>
                      {item.a}
                    </Text>
                  </View>
                ))
              : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
