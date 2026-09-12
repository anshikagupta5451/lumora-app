import { Link, useRouter } from "expo-router";
import { LogOut, User as UserIcon } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./ui/Text";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../src/store/useAuthStore";
import { Button } from "./ui/Button";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function SiteHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    Toast.show({ type: "success", text1: "Logged out successfully" });
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
      <Link href="/(main)/(tabs)/home" asChild>
        <Pressable className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Text className="text-white text-sm font-bold">LU</Text>
          </View>
          <View>
            <Text className="text-sm font-semibold text-foreground">
              Lumora
            </Text>
            <Text className="text-[13px] text-muted-foreground">
              AI Beauty Companion
            </Text>
          </View>
        </Pressable>
      </Link>

      {isAuthenticated ? (
        <View className="flex-row items-center gap-3">
          <Link href="/(main)/(tabs)/profile" asChild>
            <Pressable className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-border">
                {user?.name ? (
                  <Text className="text-primary font-semibold text-xs">
                    {getInitials(user.name)}
                  </Text>
                ) : (
                  <UserIcon size={14} color="#E8896F" />
                )}
              </View>
            </Pressable>
          </Link>
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-1 p-2"
          >
            <LogOut size={16} color="#8A7A72" />
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-center gap-2">
          <Link href="/(auth)/login" asChild>
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/(auth)/signup" asChild>
            <Button>Get started</Button>
          </Link>
        </View>
      )}
    </View>
  );
}
