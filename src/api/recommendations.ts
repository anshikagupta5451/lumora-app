import { apiFetch } from "./client";

export interface RecommendationResponse {
  id: string
  productId: string
  productName: string
  brand: string
  reason: string
  generatedAt: string
  weatherUsed: { temp: number; condition: string; humidity: number } | null
}

export function getLatestRecommendation() {
  return apiFetch<RecommendationResponse>("/recommendations/latest");
}

export function generateRecommendation(weather?: {
  temp: number;
  condition: string;
  humidity: number;
}) {
  return apiFetch<RecommendationResponse>("/recommendations/generate", {
    method: "POST",
    body: JSON.stringify(weather || {}),
  });
}

export interface ScanRecommendation {
  key: string;
  label: string;
  score: number;
  freeTips: string[];
  ownedMatch: { id: string; name: string; brand: string } | null;
  suggestedProducts: {
    id: string;
    name: string;
    brand: string;
    price: number;
    category: string;
  }[];
}

export interface ScanRecommendationsResponse {
  concerns: ScanRecommendation[];
  budget: number | null;
  generatedAt: string;
}

export function getRecommendationsFromScan() {
  return apiFetch<ScanRecommendationsResponse>("/recommendations/from-scan");
}

export function submitRecommendationFeedback(
  recommendationId: string,
  helpful: boolean,
) {
  return apiFetch(`/recommendations/${recommendationId}/feedback`, {
    method: "POST",
    body: JSON.stringify({ helpful }),
  });
}
