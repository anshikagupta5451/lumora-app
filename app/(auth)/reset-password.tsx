import React, { useState } from "react";
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "../../src/lib/validation/auth";
import { resetPassword, forgotPassword } from "../../src/api/auth";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useTheme } from "../../src/theme/ThemeContext";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!email) {
      Toast.show({ type: "error", text1: "Missing email — start over" });
      return;
    }
    try {
      const response = await resetPassword({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });
      await setAuth(response.user, response.accessToken, response.refreshToken);
      Toast.show({ type: "success", text1: "Password updated!" });
      router.replace("/(main)/(tabs)/home");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Invalid or expired code",
      });
    }
  };

  const onResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await forgotPassword(email);
      Toast.show({ type: "success", text1: "New code sent" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.message || "Could not resend code" });
    } finally {
      setIsResending(false);
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
          Enter your code
        </Text>
        <Text
          className="text-sm text-center mt-1 mb-6"
          style={{ color: theme.muted }}
        >
          {email
            ? `We sent a 6-digit code to ${email}.`
            : "Enter the 6-digit code from your email."}
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
            Reset code
          </Text>
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-xl px-3.5 py-3 text-[15px]"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.foreground,
                  letterSpacing: 4,
                }}
                placeholder="000000"
                placeholderTextColor={theme.muted}
                keyboardType="number-pad"
                maxLength={6}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.code && (
            <Text
              className="text-[14px] mt-1 ml-0.5"
              style={{ color: "#EF4444" }}
            >
              {errors.code.message}
            </Text>
          )}

          <Text
            className="text-sm font-medium mb-1.5 mt-3.5"
            style={{ color: theme.foreground }}
          >
            New password
          </Text>
          <Controller
            control={control}
            name="newPassword"
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
          {errors.newPassword && (
            <Text
              className="text-[14px] mt-1 ml-0.5"
              style={{ color: "#EF4444" }}
            >
              {errors.newPassword.message}
            </Text>
          )}

          <Text
            className="text-sm font-medium mb-1.5 mt-3.5"
            style={{ color: theme.foreground }}
          >
            Confirm new password
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-xl px-3.5 py-3 text-[15px]"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.foreground,
                }}
                placeholder="Re-enter your new password"
                placeholderTextColor={theme.muted}
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text
              className="text-[14px] mt-1 ml-0.5"
              style={{ color: "#EF4444" }}
            >
              {errors.confirmPassword.message}
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
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Text>
          </Pressable>

          <Pressable
            className="items-center mt-5"
            onPress={onResend}
            disabled={isResending || !email}
          >
            <Text className="text-[13px]" style={{ color: theme.muted }}>
              {isResending ? "Resending..." : "Didn't get a code? Resend"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
