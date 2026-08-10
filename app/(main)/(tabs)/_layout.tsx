import { Tabs, useRouter } from "expo-router";
import { Compass, Sparkles, User, Users, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { View, Pressable, Text, Modal } from "react-native";
import { useTheme } from "../../../src/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function QuickActionSheet({ visible, onClose, theme }: any) {
  const router = useRouter();

  const actions = [
    { label: "Create routine", route: "/(main)/routine-builder" },
    { label: "Add product", route: "/(main)/add-my-product" },
    { label: "Write a review", route: "/(main)/share-review" },
    { label: "Scan a product", route: "/(main)/scan-product" },
  ];
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onClose}
      >
        <View
          className="rounded-t-3xl p-5"
          style={{ backgroundColor: theme.background }}
        >
          <Text
            className="text-base font-semibold mb-4"
            style={{ color: theme.foreground }}
          >
            Quick actions
          </Text>
          {actions.map((a) => (
            <Pressable
              key={a.route}
              onPress={() => {
                onClose();
                router.push(a.route as any);
              }}
              className="py-3.5"
              style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: theme.foreground }}
              >
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted,
          tabBarStyle: {
            borderTopColor: theme.border,
            backgroundColor: theme.card,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Brief",
            tabBarIcon: ({ color, size }) => (
              <Sparkles color={color} size={size} />
            ),
          }}
        />
     
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Compass color={color} size={size} />
            ),
          }}
        />

           <Tabs.Screen
          name="add-action"
          options={{
            title: "",
            tabBarIcon: () => (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginBottom: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.primary,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 5,
                }}
              >
                <Plus size={22} color="#fff" />
              </View>
            ),
            tabBarButton: (props) => (
              <Pressable
                onPress={() => setSheetOpen(true)}
                style={props.style}
                accessibilityRole={props.accessibilityRole}
                accessibilityState={props.accessibilityState}
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "Community",
            tabBarIcon: ({ color, size }) => (
              <Users color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="routine"
          options={{
            href: null, // hides from tab bar, but route still works
          }}
        />
      </Tabs>

      <QuickActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        theme={theme}
      />
    </>
  );
}
