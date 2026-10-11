import { apiFetch } from './client'
import { LoginInput, SignupInput } from '../lib/validation/auth'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; name: string; isPremium?: boolean; avatarUrl?: string | null }
}

export interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean
}

export function loginUser(data: LoginInput) {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) })
}

export function signupUser(data: SignupInput) {
  return apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) })
}

export function googleAuth(idToken: string) {
  return apiFetch<GoogleAuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
}

export function forgotPassword(email: string) {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(data: { email: string; code: string; newPassword: string }) {
  return apiFetch<AuthResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}