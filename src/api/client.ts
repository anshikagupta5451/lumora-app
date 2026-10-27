import { router } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

const SESSION_EXPIRED = "Your session has expired. Please log in again";

// One refresh at a time: when several requests hit a 401 together they all
// wait on the same refresh instead of each spending the refresh token.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const store = useAuthStore.getState();
  const refreshToken = await store.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    await store.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function send(path: string, options: RequestInit, token: string | null) {
  const isFormData = options.body instanceof FormData;
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  let res = await send(path, options, token);

  // The access token lives 15 minutes. On a 401, refresh once and retry;
  // if that fails too the session is really over, so log out.
  if (res.status === 401 && token && !path.startsWith("/auth/")) {
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const fresh = await refreshing;
    if (!fresh) {
      await useAuthStore.getState().logout();
      router.replace("/(auth)/login");
      throw new Error(SESSION_EXPIRED);
    }
    res = await send(path, options, fresh);
  }

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
