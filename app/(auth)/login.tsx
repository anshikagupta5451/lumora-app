import React from 'react'
import {
  View, Text, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Toast from 'react-native-toast-message'
import { loginSchema, LoginInput } from '../../src/lib/validation/auth'
import { loginUser } from '../../src/api/auth'
import { useAuthStore } from '../../src/store/useAuthStore'

export default function LoginScreen() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const { control, handleSubmit, formState: { errors, isSubmitting, isValid } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: 'onChange' })

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await loginUser(data)
      await setAuth(response.user, response.accessToken, response.refreshToken)
      Toast.show({ type: 'success', text1: 'Welcome back!' })
      router.replace('/(main)/(tabs)/home')
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Invalid email or password' })
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Badge */}
        <View className="flex-row items-center self-center bg-card border border-border rounded-full px-3 py-1.5 mb-4">
          <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
          <Text className="text-xs text-muted">Lumora • AI Beauty Companion</Text>
        </View>

        <Text className="text-2xl font-bold text-foreground text-center">
          Welcome back
        </Text>
        <Text className="text-sm text-muted text-center mt-1 mb-6">
          Log in to see your personalized routine.
        </Text>

        {/* Card */}
        <View className="bg-card rounded-2xl border border-border p-5">
          <Pressable
            className="border border-border rounded-xl py-3 items-center mb-4"
            onPress={() => Toast.show({ type: 'info', text1: 'Google login coming soon!' })}
          >
            <Text className="text-sm font-medium text-foreground">G   Continue with Google</Text>
          </Pressable>

          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-2.5 text-xs text-muted">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <Text className="text-sm font-medium text-foreground mb-1.5">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-border rounded-xl px-3.5 py-3 text-[15px] text-foreground bg-white"
                placeholder="you@example.com"
                placeholderTextColor="#8A7A72"
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-[11px] mt-1 ml-0.5">{errors.email.message}</Text>
          )}

          <Text className="text-sm font-medium text-foreground mb-1.5 mt-3.5">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-border rounded-xl px-3.5 py-3 text-[15px] text-foreground bg-white"
                placeholder="••••••••"
                placeholderTextColor="#8A7A72"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-[11px] mt-1 ml-0.5">{errors.password.message}</Text>
          )}

          <Pressable
            className={`rounded-xl py-3.5 items-center mt-6 ${(!isValid || isSubmitting) ? 'bg-primary/50' : 'bg-primary'}`}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            <Text className="text-white text-[15px] font-semibold">
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </Text>
          </Pressable>

          <View className="flex-row justify-between mt-5">
            <Link href="/(auth)/signup" className="text-primary font-medium text-[13px]">
              Create an account
            </Link>
            <Pressable onPress={() => Toast.show({ type: 'info', text1: 'Feature coming soon!' })}>
              <Text className="text-muted text-[13px]">Forgot password?</Text>
            </Pressable>
          </View>

          <Text className="text-[10px] text-muted text-center mt-5 leading-4">
            By continuing, you agree to our Terms & Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}