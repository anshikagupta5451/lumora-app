import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../src/store/useAuthStore";
import { updateMyProfile } from "../../src/api/users";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Toast.show({
        type: "error",
        text1: "Name must be at least 2 characters",
      });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMyProfile(name.trim());
      await updateUser({ name: updated.name });
      Toast.show({ type: "success", text1: "Profile updated" });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Could not update profile",
      });
    } finally {
      setSaving(false);
    }
  };
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-background p-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center gap-1 mb-5"
      >
        <ChevronLeft size={18} color="#8A7A72" />
        <Text className="text-sm text-muted-foreground">Back</Text>
      </Pressable>

      <Text className="text-2xl font-bold text-foreground mb-1">
        Edit profile
      </Text>
      <Text className="text-sm text-muted-foreground mb-6">
        Update your name below.
      </Text>

      <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
      <TextInput
        className="border border-border rounded-xl px-3.5 py-3 text-[15px] text-foreground bg-white mb-4"
        placeholder="Your name"
        placeholderTextColor="#8A7A72"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-sm font-medium text-foreground mb-1.5">Email</Text>
      <View className="border border-border rounded-xl px-3.5 py-3 bg-card mb-1">
        <Text className="text-[15px] text-muted-foreground">{user?.email}</Text>
      </View>
      <Text className="text-xs text-muted-foreground mb-6">
        Email can&apos;t be changed yet.
      </Text>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        className={`rounded-xl py-3.5 items-center ${saving ? "bg-primary/50" : "bg-primary"}`}
      >
        <Text className="text-white font-semibold">
          {saving ? "Saving..." : "Save changes"}
        </Text>
      </Pressable>
    </View>
  );
}
