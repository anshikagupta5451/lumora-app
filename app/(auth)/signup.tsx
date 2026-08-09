import React from 'react'
import {
  View, Text, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Toast from 'react-native-toast-message'
import { signupSchema, SignupInput } from '../../src/lib/validation/auth'
import { signupUser } from '../../src/api/auth'
import { useAuthStore } from '../../src/store/useAuthStore'
import { useTheme } from '../../src/theme/ThemeContext'

export default function SignupScreen() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const {theme}=useTheme();
  const { control, handleSubmit, formState: { errors, isSubmitting, isValid } } =
    useForm<SignupInput>({ resolver: zodResolver(signupSchema), mode: 'onChange' })

  const onSubmit = async (data: SignupInput) => {
    try {
      const response = await signupUser(data)
      await setAuth(response.user, response.accessToken, response.refreshToken)
      Toast.show({ type: 'success', text1: 'Welcome to Lumora!' })
      router.replace('/(onboarding)/skin-type')
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Could not create account' })
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
       style={{ backgroundColor: theme.background }}
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center self-center bg-card border border-border rounded-full px-3 py-1.5 mb-4">
          <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
          <Text className="text-xs text-muted">Lumora • AI Beauty Companion</Text>
        </View>

        <Text className="text-2xl font-bold text-foreground text-center">
          Create your account
        </Text>
        <Text className="text-sm text-muted text-center mt-1 mb-6">
          Get your first AI Beauty Brief in minutes.
        </Text>

        <View className="bg-card rounded-2xl border border-border p-5">
          <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-border rounded-xl px-3.5 py-3 text-[15px] text-foreground bg-white"
                placeholder="Your name"
                placeholderTextColor="#8A7A72"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-[11px] mt-1 ml-0.5">{errors.name.message}</Text>
          )}

          <Text className="text-sm font-medium text-foreground mb-1.5 mt-3.5">Email</Text>
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
                placeholder="At least 6 characters"
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
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-5">
            <Text className="text-muted text-[13px]">Already have an account? </Text>
            <Link href="/(auth)/login" className="text-primary font-medium text-[13px]">
              Log in
            </Link>
          </View>

          <Text className="text-[10px] text-muted text-center mt-5 leading-4">
            By continuing, you agree to our Terms & Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}