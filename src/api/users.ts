import { apiFetch } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
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
