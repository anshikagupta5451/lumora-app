import { apiFetch } from './client'
import { LoginInput, SignupInput } from '../lib/validation/auth'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; name: string }
}

export function loginUser(data: LoginInput) {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) })
}

export function signupUser(data: SignupInput) {
  return apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) })
}