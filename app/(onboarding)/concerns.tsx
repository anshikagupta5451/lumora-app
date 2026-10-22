import React from "react";
import { useRouter } from "expo-router";
import { OnboardingStep } from "../../components/OnboardingStep";
import { SelectChip } from "../../components/SelectChip";
import { useOnboardingStore } from "../../src/store/useOnboardingStore";

const options = [
  "Acne",
  "Pigmentation",
  "Dryness",
  "Fine lines",
  "Dullness",
  "Large pores",
];

export default function ConcernsStep() {
  const router = useRouter();
  const { concerns, toggleConcern } = useOnboardingStore();

  return (
    <OnboardingStep
      step={2}
      totalSteps={4}
      title="Any specific concerns?"
      subtitle="Select all that apply."
      onNext={() => router.push("/(onboarding)/sensitivities")}
      nextDisabled={concerns.length === 0}
    >
      {options.map((opt) => (
        <SelectChip
          key={opt}
          label={opt}
          selected={concerns.includes(opt.toLowerCase())}
          onPress={() => toggleConcern(opt.toLowerCase())}
        />
      ))}
    </OnboardingStep>
  );
}
