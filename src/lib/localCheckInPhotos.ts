import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Free-tier check-in photos never leave the device: they're copied into
// permanent app storage and indexed in AsyncStorage by check-in id, instead
// of being uploaded to Supabase. Premium users skip this module entirely and
// go through src/api/uploads.ts instead. Not supported on web (no durable
// native filesystem) — callers should keep free-tier users on the upload
// path there.
const STORAGE_PREFIX = "local-checkin-photos:";
const PHOTOS_DIR_NAME = "checkin-photos";

export const supportsLocalCheckInPhotos = Platform.OS !== "web";

function getPhotosDir() {
  const dir = new Directory(Paths.document, PHOTOS_DIR_NAME);
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function storageKey(checkInId: string) {
  return `${STORAGE_PREFIX}${checkInId}`;
}

/** On-device photo URIs already saved for this check-in (empty if none). */
export async function getLocalCheckInPhotos(checkInId: string): Promise<string[]> {
  if (!supportsLocalCheckInPhotos) return [];
  try {
    const raw = await AsyncStorage.getItem(storageKey(checkInId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Reconciles `uris` (a mix of already-persisted file uris and freshly
 * picked ones from ImagePickerRow) against what's saved on disk for this
 * check-in: copies new picks into permanent storage, deletes files that
 * were dropped from the selection, and persists the final list. Never
 * touches the network.
 */
export async function saveLocalCheckInPhotos(
  checkInId: string,
  uris: string[],
): Promise<string[]> {
  if (!supportsLocalCheckInPhotos) return uris;

  const dir = getPhotosDir();
  const previous = await getLocalCheckInPhotos(checkInId);

  const finalUris = uris.map((uri) => {
    if (previous.includes(uri)) return uri;
    const name = `${checkInId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const dest = new File(dir, name);
    new File(uri).copy(dest);
    return dest.uri;
  });

  const removed = previous.filter((uri) => !finalUris.includes(uri));
  removed.forEach((uri) => {
    try {
      new File(uri).delete();
    } catch {
      // already gone — nothing to clean up
    }
  });

  await AsyncStorage.setItem(storageKey(checkInId), JSON.stringify(finalUris));
  return finalUris;
}

/** Deletes all on-device photos for a check-in, e.g. when it's deleted. */
export async function deleteLocalCheckInPhotos(checkInId: string): Promise<void> {
  if (!supportsLocalCheckInPhotos) return;

  const uris = await getLocalCheckInPhotos(checkInId);
  uris.forEach((uri) => {
    try {
      new File(uri).delete();
    } catch {
      // already gone
    }
  });
  await AsyncStorage.removeItem(storageKey(checkInId));
}
