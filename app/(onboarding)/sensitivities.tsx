import React from "react";
import { useRouter } from "expo-router";
import { OnboardingStep } from "../../components/OnboardingStep";
import { SelectChip } from "../../components/SelectChip";
import { useOnboardingStore } from "../../src/store/useOnboardingStore";

const options = [
  "Fragrance",
  "Alcohol",
  "Sulfates",
  "Essential oils",
  "None that I know of",
];

export default function SensitivitiesStep() {
  const router = useRouter();
  const { sensitivities, toggleSensitivity } = useOnboardingStore();

  return (
    <OnboardingStep
      step={3}
      totalSteps={4}
      title="Any sensitivities?"
      subtitle="We'll flag products that contain these."
      onNext={() => router.push("/(onboarding)/goals")}
      nextDisabled={sensitivities.length === 0}
    >
      {options.map((opt) => (
        <SelectChip
          key={opt}
          label={opt}
          selected={sensitivities.includes(opt.toLowerCase())}
          onPress={() => toggleSensitivity(opt.toLowerCase())}
        />
      ))}
    </OnboardingStep>
  );
}
