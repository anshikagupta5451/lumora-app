import { Platform } from "react-native";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import type { ReadTextLine } from "../api/products";

// Reads the text on a product photo with Google ML Kit, on the device:
// free, offline, and the photo never leaves the phone. Only the words go
// to the backend, which matches them to products (src/api/products.ts →
// matchProducts). Line heights are kept because the brand and product
// name are usually the biggest print on the pack.
//
// Native-only, and needs a dev build that includes the module — after
// installing it, rebuild with `npx expo run:android`.
export const supportsTextRecognition = Platform.OS !== "web";

export async function readProductText(uri: string): Promise<ReadTextLine[]> {
  const result = await TextRecognition.recognize(uri);
  return result.blocks
    .flatMap((block) => block.lines)
    .map((line) => ({ text: line.text.trim(), size: line.frame?.height ?? 1 }))
    .filter((line) => line.text.length > 0);
}
