import { Platform } from "react-native";
import { apiFetch } from "./client";

/** Upload local image URIs and return their hosted image URLs. */
export async function uploadImages(uris: string[]): Promise<string[]> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    await Promise.all(
      uris.map(async (uri, index) => {
        const response = await fetch(uri);
        formData.append("images", await response.blob(), `photo${index}.jpg`);
      }),
    );
  } else {
    uris.forEach((uri, index) => {
      const filename = uri.split("/").pop() || `photo${index}.jpg`;
      const extension = filename.split(".").pop()?.toLowerCase();
      const type = extension === "png" ? "image/png" : "image/jpeg";
      formData.append("images", { uri, name: filename, type } as any);
    });
  }

  const data = await apiFetch<{ urls: string[] }>("/uploads/images", {
    method: "POST",
    body: formData,
  });
  return data.urls;
}
