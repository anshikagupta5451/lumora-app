import { create } from 'zustand'

interface OnboardingState {
  skinType: string | null
  concerns: string[]
  sensitivities: string[]
  goals: string[]
  setSkinType: (v: string) => void
  toggleConcern: (v: string) => void
  toggleSensitivity: (v: string) => void
  toggleGoal: (v: string) => void
  reset: () => void
}

function toggle(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  skinType: null,
  concerns: [],
  sensitivities: [],
  goals: [],
  setSkinType: (v) => set({ skinType: v }),
  toggleConcern: (v) => set((s) => ({ concerns: toggle(s.concerns, v) })),
  toggleSensitivity: (v) => set((s) => ({ sensitivities: toggle(s.sensitivities, v) })),
  toggleGoal: (v) => set((s) => ({ goals: toggle(s.goals, v) })),
  reset: () => set({ skinType: null, concerns: [], sensitivities: [], goals: [] }),
}))