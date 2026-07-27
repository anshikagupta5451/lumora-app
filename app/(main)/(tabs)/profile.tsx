import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { LogOut, User as UserIcon, Sparkles } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../../src/store/useAuthStore'
import { getMySkinProfile } from '../../../src/api/skinProfile'
import { Card } from '../../../components/ui/Card'

interface SkinProfile {
  skinType: string
  concerns: string[]
  sensitivities: string[]
  goals: string[]
}

function getInitials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase()
}

function Pill({ label }: { label: string }) {
  return (
    <View className="bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 mr-2 mb-2">
      <Text className="text-xs text-primary font-medium capitalize">{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [profile, setProfile] = useState<SkinProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMySkinProfile()
      setProfile(data as SkinProfile)
    } catch {
      setProfile(null) // user may not have completed onboarding yet
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadProfile()
    }, [loadProfile])
  )

  const handleLogout = async () => {
    await logout()
    Toast.show({ type: 'success', text1: 'Logged out' })
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-5 pb-10"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile() }} />}
    >
      {/* User header */}
      <View className="items-center mt-4 mb-6">
        <View className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 items-center justify-center mb-3">
          {user?.name
            ? <Text className="text-2xl font-bold text-primary">{getInitials(user.name)}</Text>
            : <UserIcon size={28} color="#C97B63" />}
        </View>
        <Text className="text-lg font-semibold text-foreground">{user?.name || 'Lumora User'}</Text>
        <Text className="text-sm text-muted mt-0.5">{user?.email}</Text>
      </View>

      {/* Skin profile card */}
      <Card className="p-4 mb-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Sparkles size={16} color="#C97B63" />
          <Text className="text-sm font-semibold text-foreground">Your Skin Profile</Text>
        </View>

        {loading ? (
          <Text className="text-sm text-muted">Loading...</Text>
        ) : profile ? (
          <View>
            <Text className="text-xs text-muted mb-1">Skin type</Text>
            <Text className="text-sm font-medium text-foreground capitalize mb-3">{profile.skinType}</Text>

            {profile.concerns?.length > 0 && (
              <>
                <Text className="text-xs text-muted mb-1.5">Concerns</Text>
                <View className="flex-row flex-wrap mb-3">
                  {profile.concerns.map((c) => <Pill key={c} label={c} />)}
                </View>
              </>
            )}

            {profile.goals?.length > 0 && (
              <>
                <Text className="text-xs text-muted mb-1.5">Goals</Text>
                <View className="flex-row flex-wrap">
                  {profile.goals.map((g) => <Pill key={g} label={g} />)}
                </View>
              </>
            )}
          </View>
        ) : (
          <View>
            <Text className="text-sm text-muted mb-3">You haven&apos;t completed your skin assessment yet.</Text>
            <Pressable
              onPress={() => router.push('/(onboarding)/skin-type')}
              className="bg-primary rounded-xl py-3 items-center"
            >
              <Text className="text-white font-medium text-sm">Start assessment</Text>
            </Pressable>
          </View>
        )}
      </Card>

      {/* Settings placeholder */}
      <Card className="p-4 mb-4">
        <Text className="text-sm font-semibold text-foreground mb-1">Settings</Text>
        <Text className="text-xs text-muted">Notification preferences, budget, and units coming soon.</Text>
      </Card>

      {/* Logout */}
      <Pressable
        onPress={handleLogout}
        className="flex-row items-center justify-center gap-2 border border-border rounded-xl py-3.5 mt-2"
      >
        <LogOut size={16} color="#8A7A72" />
        <Text className="text-foreground font-medium">Log out</Text>
      </Pressable>
    </ScrollView>
  )
}