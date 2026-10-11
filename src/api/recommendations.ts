import { apiFetch } from "./client";

export type BriefTipSource =
  | "uv"
  | "air"
  | "humidity"
  | "temperature"
  | "scan"
  | "checkins"
  | "products"
  | "routine";

export interface BriefTip {
  source: BriefTipSource;
  title: string;
  detail: string;
}

export interface BriefPick {
  productId: string | null;
  userProductId: string | null;
  name: string;
  brand: string;
  category: string | null;
  price: number | null;
  owned: boolean;
  reason: string;
}

export interface BriefConditions {
  temp: number | null;
  humidity: number | null;
  uvNow: number | null;
  uvMax: number | null;
  aqi: number | null;
  pm25: number | null;
  condition: string | null;
}

export interface RecommendationResponse {
  id: string;
  headline: string;
  summary: string | null;
  tips: BriefTip[];
  pick: BriefPick | null;
  conditions: BriefConditions | null;
  generatedAt: string;
}

export function getLatestRecommendation() {
  return apiFetch<RecommendationResponse>("/recommendations/latest");
}

// The backend looks up live UV, air quality and weather for these
// coordinates itself; without them the brief uses the skin profile only.
export function generateRecommendation(coords?: { lat: number; lon: number }) {
  return apiFetch<RecommendationResponse>("/recommendations/generate", {
    method: "POST",
    body: JSON.stringify(coords || {}),
  });
}

export type SuggestionSource = "owned" | "promoted" | "web";

export interface SuggestedItem {
  productId: string | null;
  userProductId: string | null;
  name: string;
  brand: string;
  price: number | null;
  category: string | null;
  keyIngredient: string | null;
  why: string;
  tag: "owned" | "featured" | "catalog" | "web";
  url: string | null;
  alsoFor: string[];
}

export interface ScanRecommendation {
  key: string;
  label: string;
  score: number;
  freeTips: string[];
  items: SuggestedItem[];
  emptyReason: string | null;
}

export interface ScanRecommendationsResponse {
  source: SuggestionSource;
  budget: number | null;
  ownedMatches: number;
  concerns: ScanRecommendation[];
  plan: { total: number; budget: number | null; productCount: number };
  web: {
    grounded: boolean;
    sources: { title: string; url: string }[];
    searchedAt: string;
  } | null;
  generatedAt: string;
}

// Without a source the backend picks one: "owned" if something the user
// owns fits a concern, otherwise "promoted".
export function getRecommendationsFromScan(source?: SuggestionSource) {
  return apiFetch<ScanRecommendationsResponse>(
    `/recommendations/from-scan${source ? `?source=${source}` : ""}`,
  );
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
