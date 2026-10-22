import React from 'react'
import { useRouter } from 'expo-router'
import { OnboardingStep } from '../../components/OnboardingStep'
import { SelectChip } from '../../components/SelectChip'
import { useOnboardingStore } from '../../src/store/useOnboardingStore'

const options = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive']

export default function SkinTypeStep() {
  const router = useRouter()
  const { skinType, setSkinType } = useOnboardingStore()

  return (
    <OnboardingStep
      step={1}
      totalSteps={4}
      title="What's your skin type?"
      subtitle="This shapes almost every recommendation we give you."
      onNext={() => router.push('/(onboarding)/concerns')}
      nextDisabled={!skinType}
    >
      {options.map((opt) => (
        <SelectChip key={opt} label={opt} selected={skinType === opt.toLowerCase()} onPress={() => setSkinType(opt.toLowerCase())} />
      ))}
    </OnboardingStep>
  )
}