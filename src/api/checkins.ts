import { apiFetch } from "./client";

export interface CheckIn {
  id: string;
  mood: number;
  note: string | null;
  images: string[];
  createdAt: string;
}

export interface UserStats {
  streak: number;
  totalCheckIns: number;
  productsOpened: number;
  productsTracked: number;
  reviewsWritten: number;
}

export function submitCheckIn(mood: number, note?: string, images: string[] = []) {
  return apiFetch<CheckIn>("/checkins", {
    method: "POST",
    body: JSON.stringify({ mood, note, images }),
  });
}

export function getMyStats() {
  return apiFetch<UserStats>("/checkins/stats");
}

export function getStreak() {
  return apiFetch<{ streak: number; totalCheckIns: number }>(
    "/checkins/streak",
  );
}

export function getTodayCheckIn() {
  return apiFetch<CheckIn | null>("/checkins/today");
}

export function getCheckInHistory() {
  return apiFetch<CheckIn[]>("/checkins/history");
}

export function deleteCheckIn(id: string) {
  return apiFetch(`/checkins/${id}`, { method: "DELETE" });
}

export function updateCheckIn(
  id: string,
  updates: { mood?: number; note?: string; images?: string[] },
) {
  return apiFetch<CheckIn>(`/checkins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
