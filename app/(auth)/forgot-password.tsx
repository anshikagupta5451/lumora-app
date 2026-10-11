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
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "../../src/lib/validation/auth";
import { forgotPassword } from "../../src/api/auth";
import { useTheme } from "../../src/theme/ThemeContext";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword(data.email);
      Toast.show({
        type: "success",
        text1: "Check your email",
        text2: "If that email is registered, we've sent a reset code.",
      });
      router.push(`/(auth)/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Something went wrong",
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
          Reset your password
        </Text>
        <Text
          className="text-sm text-center mt-1 mb-6"
          style={{ color: theme.muted }}
        >
          Enter your email and we&apos;ll send you a 6-digit reset code.
        </Text>

        <View
          className="rounded-2xl p-5"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
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
              {isSubmitting ? "Sending..." : "Send reset code"}
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-5">
            <Link
              href="/(auth)/login"
              style={{ color: theme.primary, fontWeight: "500", fontSize: 13 }}
            >
              Back to log in
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
