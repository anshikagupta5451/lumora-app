import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { useRouter } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { getIngredients, Ingredient } from "../../src/api/ingredients";
import { useTheme } from "../../src/theme/ThemeContext";

export default function GlossaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const {theme}=useTheme()

  useEffect(() => {
    const timeout = setTimeout(() => {
      getIngredients(query)
        .then(setIngredients)
        .catch(() => setIngredients([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 mb-4"
        >
          <ChevronLeft size={18} color="#8A7A72" />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground mb-1">
          Ingredient Glossary
        </Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Know what&apos;s actually in your products.
        </Text>

        <View className="flex-row items-center bg-card border border-border rounded-xl px-3 py-2.5">
          <Search size={16} color="#8A7A72" />
          <TextInput
            className="flex-1 ml-2 text-sm text-foreground"
            placeholder="Search ingredients..."
            placeholderTextColor="#8A7A72"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E8896F" />
        </View>
      ) : (
        <ScrollView
         style={{ backgroundColor: theme.background }}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {ingredients.map((ing) => (
            <Pressable
              key={ing.id}
              onPress={() => setExpanded(expanded === ing.id ? null : ing.id)}
            >
              <Card className="p-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">
                    {ing.name}
                  </Text>
                  <View className="bg-primary/10 rounded-full px-2.5 py-1">
                    <Text className="text-[13px] text-primary font-medium capitalize">
                      {ing.category}
                    </Text>
                  </View>
                </View>

                {expanded === ing.id && (
                  <View className="mt-3">
                    <Text className="text-xs text-muted-foreground leading-5">
                      {ing.description}
                    </Text>
                    <View className="flex-row flex-wrap mt-3 gap-1.5">
                      {ing.goodFor.map((g) => (
                        <View
                          key={g}
                          className="bg-accent/10 border border-accent/30 rounded-full px-2.5 py-1"
                        >
                          <Text className="text-[13px] text-accent font-medium capitalize">
                            Good for {g}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
