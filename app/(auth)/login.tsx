import React from "react";
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { loginSchema, LoginInput } from "../../src/lib/validation/auth";
import { loginUser } from "../../src/api/auth";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useTheme } from "../../src/theme/ThemeContext";
import { useGoogleSignIn } from "../../src/lib/useGoogleSignIn";
import { GoogleIcon } from "../../components/ui/GoogleIcon";

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await loginUser(data);
      await setAuth(response.user, response.accessToken, response.refreshToken);
      Toast.show({ type: "success", text1: "Welcome back!" });
      router.replace("/(main)/(tabs)/home");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Invalid email or password",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-row items-center self-center rounded-full px-3 py-1.5 mb-4"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <View
            className="w-1.5 h-1.5 rounded-full mr-2"
            style={{ backgroundColor: theme.primary }}
          />
          <Text className="text-xs" style={{ color: theme.muted }}>
            Lumora • AI Beauty Companion
          </Text>
        </View>

        <Text
          className="text-2xl font-bold text-center"
          style={{ color: theme.foreground }}
        >
          Welcome back
        </Text>
        <Text
          className="text-sm text-center mt-1 mb-6"
          style={{ color: theme.muted }}
        >
          Log in to see your personalized routine.
        </Text>

        <View
          className="rounded-2xl p-5"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Pressable
            className="flex-row items-center justify-center gap-2 rounded-xl py-3 mb-4"
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              opacity: isGoogleLoading ? 0.6 : 1,
            }}
            onPress={signInWithGoogle}
            disabled={isGoogleLoading}
          >
            <GoogleIcon size={18} />
            <Text
              className="text-sm font-medium"
              style={{ color: theme.foreground }}
            >
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Text>
          </Pressable>

          <View className="flex-row items-center mb-4">
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: theme.border }}
            />
            <Text className="mx-2.5 text-xs" style={{ color: theme.muted }}>
              or
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: theme.border }}
            />
          </View>

          <Text
            className="text-sm font-medium mb-1.5"
            style={{ color: theme.foreground }}
          >
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-xl px-3.5 py-3 text-[15px]"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.foreground,
                }}
                placeholder="you@example.com"
                placeholderTextColor={theme.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text
              className="text-[14px] mt-1 ml-0.5"
              style={{ color: "#EF4444" }}
            >
              {errors.email.message}
            </Text>
          )}

          <Text
            className="text-sm font-medium mb-1.5 mt-3.5"
            style={{ color: theme.foreground }}
          >
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-xl px-3.5 py-3 text-[15px]"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.foreground,
                }}
                placeholder="••••••••"
                placeholderTextColor={theme.muted}
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text
              className="text-[14px] mt-1 ml-0.5"
              style={{ color: "#EF4444" }}
            >
              {errors.password.message}
            </Text>
          )}

          <Pressable
            className="rounded-xl py-3.5 items-center mt-6"
            style={{
              backgroundColor:
                !isValid || isSubmitting ? theme.primaryLight : theme.primary,
            }}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            <Text className="text-white text-[15px] font-semibold">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Text>
          </Pressable>

          <View className="flex-row justify-between mt-5">
            <Link
              href="/(auth)/signup"
              style={{ color: theme.primary, fontWeight: "500", fontSize: 14 }}
            >
              Create an account
            </Link>
            <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
              <Text className="text-[13px]" style={{ color: theme.muted }}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <Text
            className="text-[13px] text-center mt-5 leading-4"
            style={{ color: theme.muted }}
          >
            By continuing, you agree to our Terms & Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
