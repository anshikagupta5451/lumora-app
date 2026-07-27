import React, { useState } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { OnboardingStep } from "../../components/OnboardingStep";
import { SelectChip } from "../../components/SelectChip";
import { useOnboardingStore } from "../../src/store/useOnboardingStore";
import { saveSkinProfile } from "../../src/api/skinProfile";

const options = [
  "Clear skin",
  "Even tone",
  "Anti-aging",
  "Hydration",
  "Oil control",
];

export default function GoalsStep() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { skinType, concerns, sensitivities, goals, toggleGoal, reset } =
    useOnboardingStore();

  const handleSubmit = async () => {
    if (!skinType) return;
    setSubmitting(true);
    try {
      await saveSkinProfile({ skinType, concerns, sensitivities, goals });
      Toast.show({ type: "success", text1: "Your skin profile is ready!" });
      reset();
      router.replace("/(main)/(tabs)/home");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingStep
      step={4}
      totalSteps={4}
      title="What are your goals?"
      subtitle="Select all that apply."
      onNext={handleSubmit}
      nextDisabled={goals.length === 0 || submitting}
      nextLabel={submitting ? "Saving..." : "Finish"}
    >
      {options.map((opt) => (
        <SelectChip
          key={opt}
          label={opt}
          selected={goals.includes(opt.toLowerCase())}
          onPress={() => toggleGoal(opt.toLowerCase())}
        />
      ))}
    </OnboardingStep>
  );
}
