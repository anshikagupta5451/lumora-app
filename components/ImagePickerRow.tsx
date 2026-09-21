import React from "react";
import { View, Image, Pressable, ScrollView, Alert } from "react-native";
import { Text } from "./ui/Text";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, X } from "lucide-react-native";
const MAX_IMAGES = 6;

interface Props {
  uris: string[];
  onChange: (uris: string[]) => void;
  theme: any;
  label?: string;
  helperText?: string;
}

export function ImagePickerRow({
  uris,
  onChange,
  theme,
  label = "Photos",
  helperText,
}: Props) {
  const pickImages = async () => {
    if (uris.length >= MAX_IMAGES) {
      Alert.alert("Limit reached", `You can add up to ${MAX_IMAGES} photos.`);
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Photo access needed",
        "Enable photo library access in settings to add photos to your post.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - uris.length,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      onChange([...uris, ...newUris].slice(0, MAX_IMAGES));
    }
  };

  const removeAt = (index: number) => {
    onChange(uris.filter((_, i) => i !== index));
  };

  return (
    <View>
      <Text
        className="text-xs font-semibold uppercase mb-2 mt-3"
        style={{ color: theme.muted, letterSpacing: 0.5 }}
      >
        {label} {uris.length > 0 ? `(${uris.length}/${MAX_IMAGES})` : ""}
      </Text>
      {helperText ? (
        <Text className="text-xs mb-2 -mt-1" style={{ color: theme.muted }}>
          {helperText}
        </Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {uris.map((uri, i) => (
            <View key={uri} style={{ width: 72, height: 72 }}>
              <Image
                source={{ uri }}
                style={{ width: 72, height: 72, borderRadius: 10 }}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => removeAt(i)}
                hitSlop={6}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.foreground,
                }}
              >
                <X size={12} color={theme.background} />
              </Pressable>
            </View>
          ))}

          {uris.length < MAX_IMAGES && (
            <Pressable
              onPress={pickImages}
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: theme.border,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.card,
              }}
            >
              <ImagePlus size={20} color={theme.muted} />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
