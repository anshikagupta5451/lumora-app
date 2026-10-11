import { useState } from 'react'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { signInWithGoogle } from './googleAuth'
import { googleAuth } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'

// Shared by the login and signup screens: Google is one button that either
// logs an existing user in or creates their account, depending on what the
// backend finds for that Google identity.
export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const signIn = async () => {
    setIsLoading(true)
    try {
      const idToken = await signInWithGoogle()
      if (!idToken) return

      const response = await googleAuth(idToken)
      await setAuth(response.user, response.accessToken, response.refreshToken)

      Toast.show({
        type: 'success',
        text1: response.isNewUser ? 'Welcome to Lumora!' : 'Welcome back!',
      })
      router.replace(
        response.isNewUser ? '/(onboarding)/skin-type' : '/(main)/(tabs)/home',
      )
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Google sign-in failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return { signInWithGoogle: signIn, isLoading }
}
