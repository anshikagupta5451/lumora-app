import { apiFetch } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  isAdmin?: boolean;
}

export interface PublicProfile {
  id: string
  name: string
  memberSince: string
  postCount: number
  reviewCount: number
}

export function getPublicProfile(id: string) {
  return apiFetch<PublicProfile>(`/users/${id}/public`)
}

export function getMyProfile() {
  return apiFetch<UserProfile>("/users/me");
}

export function updateMyProfile(name: string) {
  return apiFetch<UserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function registerPushToken(pushToken: string) {
  return apiFetch("/users/push-token", {
    method: "POST",
    body: JSON.stringify({ pushToken }),
  });
}
