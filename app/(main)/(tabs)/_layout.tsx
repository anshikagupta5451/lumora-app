import React from 'react'
import { Tabs } from 'expo-router'
import { Sparkles, ListChecks, Compass, User } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#C97B63',
        tabBarInactiveTintColor: '#8A7A72',
        tabBarStyle: { borderTopColor: '#F0E4DE', backgroundColor: '#FFFFFF' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Brief', tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="routine"
        options={{ title: 'Routine', tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  )
}