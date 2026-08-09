import { apiFetch } from "./client";

interface BackendReview {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  skinType?: string;
  concerns: string[];
  isAnonymous: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
  product: { id: string; name: string; brand: string; category: string };
  user: { id: string; name: string } | null;
}

export interface Review {
  id: string;
  product: string;
  brand: string;
  category: string;
  rating: number;
  title: string;
  review: string;
  skinType: string;
  concerns: string[];
  reviewer: string;
  createdAt: string;
  verified: boolean;
}

function formatLabel(value: string) {
  const map: Record<string, string> = {
    combo: "Combo",
    oily: "Oily",
    dry: "Dry",
    normal: "Normal",
    sensitive: "Sensitive",
  };
  return map[value] || value.charAt(0).toUpperCase() + value.slice(1);
}

function mapReview(item: BackendReview): Review {
  return {
    id: item.id,
    product: item.product?.name || "Unknown Product",
    brand: item.product?.brand || "Unknown Brand",
    category: item.product?.category || "Skincare",
    rating: item.rating,
    title: item.title || "Honest Review",
    review: item.comment,
    skinType: item.skinType ? formatLabel(item.skinType) : "",
    concerns: item.concerns.map(formatLabel),
    reviewer: item.isAnonymous
      ? "Anonymous"
      : item.user?.name || "Anonymous User",
    createdAt: item.createdAt,
    verified: item.isVerifiedPurchase,
  };
}

export interface SubmitReviewInput {
  productId?: string;
  newProduct?: { name: string; brand: string; category: string };
  rating: number;
  comment: string;
  skinType?: string;
  concerns: string[];
  isAnonymous: boolean;
}

export function submitReview(data: SubmitReviewInput) {
  return apiFetch("/reviews", { method: "POST", body: JSON.stringify(data) });
}

export async function getReviews(): Promise<Review[]> {
  const data = await apiFetch<BackendReview[]>("/reviews");
  return data.map(mapReview);
}
