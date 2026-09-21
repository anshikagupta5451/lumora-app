import { Platform } from "react-native";
import { apiFetch } from "./client";

export interface ConcernScore {
  key: string;
  label: string;
  score: number;
  detected: boolean;
  reasoning?: string;
}

export interface Detection {
  key: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax], normalized 0-1000
  note: string;
}

export interface FaceScanResult {
  id: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  concerns: ConcernScore[];
  detections: Detection[];
  source: "ai" | "heuristic";
  createdAt: string;
}

export async function analyzeFaceScan(uri: string): Promise<FaceScanResult> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const res = await fetch(uri);
    const blob = await res.blob();
    formData.append("image", blob, "face.jpg");
  } else {
    formData.append("image", {
      uri,
      name: "face.jpg",
      type: "image/jpeg",
    } as any);
  }

  return apiFetch<FaceScanResult>("/face-scan/analyze", {
    method: "POST",
    body: formData,
  });
}

export function getLatestFaceScan() {
  return apiFetch<FaceScanResult>("/face-scan/latest");
}
