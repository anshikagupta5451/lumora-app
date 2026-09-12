import { useAuthStore } from "../store/useAuthStore";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Parse defensively: a 204, an empty body, or an HTML error page from a
  // proxy would all blow up on res.json() before we could read the status.
  const raw = await res.text();
  let data: any = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new Error(
      data?.error || data?.message || `Request failed (${res.status})`,
    );
  }

  return data as T;
}
