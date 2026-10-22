import React, { useState } from "react";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Modal,
  StyleSheet,
} from "react-native";
import { Text } from "./ui/Text";
import { X } from "lucide-react-native";

interface Props {
  images: string[];
  variant: "feed" | "detail";
}


export function PostImageGallery({ images, variant }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  if (!images || images.length === 0) return null;

  if (variant === "feed") {
    const shown = images.slice(0, 4);
    const extra = images.length - shown.length;
    const cardWidth = screenWidth - 64; // approx card width minus padding
    const cols = shown.length === 1 ? 1 : 2;
    const gap = 4;
    const tileSize = (cardWidth - gap * (cols - 1)) / cols;

    return (
      <View style={styles.feedGrid}>
        {shown.map((uri, i) => (
          <View
            key={uri}
            style={{ width: tileSize, height: tileSize, overflow: "hidden" }}
          >
            <Image
              source={{ uri }}
              style={{ width: tileSize, height: tileSize }}
              resizeMode="cover"
            />
            {i === shown.length - 1 && extra > 0 && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>+{extra}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }

  // detail variant — full-width swipeable gallery + tap-to-zoom lightbox
  const size = screenWidth - 32;

  return (
    <>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.detailScroll}
      >
        {images.map((uri, i) => (
          <Pressable key={uri} onPress={() => setViewerIndex(i)}>
            <Image
              source={{ uri }}
              style={{ width: size, height: size * 0.75 }}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={viewerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerIndex(null)}
      >
        <View style={styles.lightbox}>
          <Pressable
            onPress={() => setViewerIndex(null)}
            hitSlop={12}
            style={styles.lightboxClose}
          >
            <X size={26} color="#fff" />
          </Pressable>
          {viewerIndex !== null && (
            <Image
              source={{ uri: images[viewerIndex] }}
              style={{ width: screenWidth, height: screenWidth }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  feedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  detailScroll: {
    marginBottom: 18,
    borderRadius: 14,
  },
  lightbox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 1,
  },
});
