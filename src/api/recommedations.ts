import { apiFetch } from "./client";

export interface RecommendationResponse {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  reason: string;
  generatedAt: string;
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

export function submitRecommendationFeedback(
  recommendationId: string,
  helpful: boolean,
) {
  return apiFetch(`/recommendations/${recommendationId}/feedback`, {
    method: "POST",
    body: JSON.stringify({ helpful }),
  });
}
