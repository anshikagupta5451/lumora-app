import { Tabs, useRouter } from "expo-router";
import {
  Compass,
  Sparkles,
  User,
  Users,
  Plus,
  ListChecks,
  PackagePlus,
  Star,
  ScanLine,
  ScanFace,
  Camera,
  ChevronRight,
} from "lucide-react-native";
import React, { useState } from "react";
import { View, Pressable, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/Text";
import { useTheme } from "../../../src/theme/ThemeContext";
import { iconColors } from "../../../src/theme/iconColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function QuickActionSheet({ visible, onClose, theme }: any) {
  const router = useRouter();

  const actions = [
    {
      label: "Log a skin check-in",
      route: "/(main)/(tabs)/home",
      icon: Camera,
      color: iconColors.purple,
    },
    {
      label: "Scan your face",
      route: "/(main)/face-scan",
      icon: ScanFace,
      color: iconColors.pink,
    },
    {
      label: "Create routine",
      route: "/(main)/routine-builder",
      icon: ListChecks,
      color: iconColors.blue,
    },
    {
      label: "Add product",
      route: "/(main)/add-my-product",
      icon: PackagePlus,
      color: iconColors.teal,
    },
    {
      label: "Write a review",
      route: "/(main)/share-review",
      icon: Star,
      color: iconColors.pink,
    },
    {
      label: "Is this right for me?",
      route: "/(main)/scan-product",
      icon: ScanLine,
      color: iconColors.purple,
    },
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
              className="flex-row items-center gap-3 py-3"
              style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${a.color}22` }}
              >
                <a.icon size={18} color={a.color} />
              </View>
              <Text
                className="flex-1 text-sm font-medium"
                style={{ color: theme.foreground }}
              >
                {a.label}
              </Text>
              <ChevronRight size={16} color={theme.muted} />
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
            height: 48 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 1,
          },
          tabBarIconStyle: {
            width: 18,
            height: 18,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Brief",
            tabBarIcon: ({ color }) => <Sparkles color={color} size={18} />,
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => <Compass color={color} size={18} />,
          }}
        />

           <Tabs.Screen
          name="add-action"
          options={{
            title: "",
            tabBarIcon: () => (
              <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  marginBottom: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 5,
                }}
              >
                <Plus size={18} color="#fff" />
              </LinearGradient>
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
            tabBarIcon: ({ color }) => <Users color={color} size={18} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User color={color} size={18} />,
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
