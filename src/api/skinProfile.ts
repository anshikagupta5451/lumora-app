import { apiFetch } from './client'

export interface SkinProfileInput {
  skinType: string
  concerns: string[]
  sensitivities: string[]
  goals: string[]
  climateZone?: string
}

export function saveSkinProfile(data: SkinProfileInput) {
  return apiFetch('/skin-profile', { method: 'POST', body: JSON.stringify(data) })
}

export function getMySkinProfile() {
  return apiFetch('/skin-profile/me')
}