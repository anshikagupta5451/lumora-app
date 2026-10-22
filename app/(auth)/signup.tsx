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
import { signupSchema, SignupInput } from "../../src/lib/validation/auth";
import { signupUser } from "../../src/api/auth";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useTheme } from "../../src/theme/ThemeContext";
import { useGoogleSignIn } from "../../src/lib/useGoogleSignIn";
import { GoogleIcon } from "../../components/ui/GoogleIcon";

export default function SignupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      const response = await signupUser(data);
      await setAuth(response.user, response.accessToken, response.refreshToken);
      Toast.show({ type: "success", text1: "Welcome to Lumora!" });
      router.replace("/(onboarding)/skin-type");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Could not create account",
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
          Create your account
        </Text>
        <Text
          className="text-sm text-center mt-1 mb-6"
          style={{ color: theme.muted }}
        >
          Get your first AI Beauty Brief in minutes.
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
            Name
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-xl px-3.5 py-3 text-[15px]"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.foreground,
                }}
                placeholder="Your name"
                placeholderTextColor={theme.muted}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && (
            <Text
              className="text-[14px] mt-1 ml-0.5"
              style={{ color: "#EF4444" }}
            >
              {errors.name.message}
            </Text>
          )}

          <Text
            className="text-sm font-medium mb-1.5 mt-3.5"
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
                placeholder="At least 6 characters"
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
              {isSubmitting ? "Creating account..." : "Create account"}
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-5">
            <Text className="text-[13px]" style={{ color: theme.muted }}>
              Already have an account?{" "}
            </Text>
            <Link
              href="/(auth)/login"
              style={{ color: theme.primary, fontWeight: "500", fontSize: 13 }}
            >
              Log in
            </Link>
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
