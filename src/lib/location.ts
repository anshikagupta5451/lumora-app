import * as Location from "expo-location";

const FRESH_FIX_TIMEOUT_MS = 8_000;

// Weather/UV only need city-level accuracy, so a recent cached position is
// good enough and returns instantly. A fresh GPS fix can take many seconds
// (or never arrive indoors), so it's capped — callers treat null as "no
// location" and carry on.
export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  const cached = await Location.getLastKnownPositionAsync({
    maxAge: 30 * 60 * 1000,
  }).catch(() => null);
  if (cached) {
    return { lat: cached.coords.latitude, lon: cached.coords.longitude };
  }

  const fresh = await Promise.race([
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }).catch(() => null),
    new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), FRESH_FIX_TIMEOUT_MS),
    ),
  ]);
  if (!fresh) return null;
  return { lat: fresh.coords.latitude, lon: fresh.coords.longitude };
}
