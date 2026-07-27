// app/index.tsx
import React, { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/store/useAuthStore'

export default function Index() {
  const [checked, setChecked] = useState(false)
  const { isAuthenticated, loadAuth } = useAuthStore()

  useEffect(() => {
    loadAuth().finally(() => setChecked(true))
  }, [])

  if (!checked) return null // or a splash/loading view

  return isAuthenticated
    ? <Redirect href="/(main)/(tabs)/home" />
    : <Redirect href="/(auth)/login" />
}