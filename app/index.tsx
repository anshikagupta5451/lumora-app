// app/index.tsx
import React, { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/store/useAuthStore'
import { getMySkinProfile } from '../src/api/skinProfile'

type Target = 'login' | 'onboarding' | 'home' | null

export default function Index() {
  const [target, setTarget] = useState<Target>(null)
  const { loadAuth } = useAuthStore()

  useEffect(() => {
    ;(async () => {
      await loadAuth()

      if (!useAuthStore.getState().isAuthenticated) {
        setTarget('login')
        return
      }

      // A user who signed up but never finished onboarding (closed the
      // app mid-flow, lost connection, etc.) has no skin profile yet —
      // send them back to pick up where they left off instead of
      // dropping them on an empty home tab.
      try {
        await getMySkinProfile()
        setTarget('home')
      } catch (err: any) {
        setTarget(err?.message === 'No skin profile yet' ? 'onboarding' : 'home')
      }
    })()
  }, [])

  if (target === 'login') return <Redirect href="/(auth)/login" />
  if (target === 'onboarding') return <Redirect href="/(onboarding)/skin-type" />
  if (target === 'home') return <Redirect href="/(main)/(tabs)/home" />
  return null // or a splash/loading view
}
