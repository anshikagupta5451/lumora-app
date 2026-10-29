import { apiFetch } from "./client";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  ingredients: string[];
  price: number;
  imageUrl: string | null;
}

export function getProducts(params?: { category?: string; query?: string }) {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.query) search.set("query", params.query);
  const qs = search.toString();
  return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ""}`);
}

export interface PopularProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imageUrl: string | null;
  reviewCount: number;
  avgRating: number | null;
}

// Most-reviewed products with their average rating.
export function getPopularProducts() {
  return apiFetch<PopularProduct[]>("/products/popular");
}

export function getProduct(id: string) {
  return apiFetch<Product>(`/products/${id}`);
}

export function getProductByBarcode(code: string) {
  return apiFetch<Product>(`/products/barcode/${code}`);
}

export type VerdictCheckStatus = "good" | "caution" | "bad" | "info";

export interface VerdictCheck {
  kind: "sensitivity" | "skinType" | "concerns" | "owned" | "clash" | "budget" | "community" | "usage" | "ingredients";
  status: VerdictCheckStatus;
  title: string;
  detail: string;
}

export interface ConcernFit {
  label: string;
  // null when the ingredient list is unknown
  percent: number | null;
  fromScan: boolean;
  reason: string;
}

export interface Verdict {
  overall: "great" | "good" | "caution" | "avoid" | "unknown";
  headline: string;
  checks: VerdictCheck[];
  // 0–100, or null without a skin profile or ingredient list.
  match: { percent: number | null; concerns: ConcernFit[] };
}

// Products not in our catalog have no id or price. "ai" means the AI
// identified the product and found its ingredients on the web.
export interface BarcodeCheck {
  source: "catalog" | "openbeautyfacts" | "ai";
  product: {
    id: string | null;
    name: string;
    brand: string | null;
    category: string | null;
    ingredients: string[];
    price: number | null;
    imageUrl: string | null;
  };
  verdict: Verdict;
  // Web pages the AI found the ingredients on (catalog results have none).
  sources?: { title: string; url: string }[];
}

// The in-shop "Is this right for me?" check for a scanned barcode.
export function checkBarcode(code: string) {
  return apiFetch<BarcodeCheck>(`/products/barcode/${encodeURIComponent(code)}/check`);
}

// The same check for a product the photo scanner couldn't match, from the
// text read off its pack (or a typed name). The AI identifies it.
export function identifyProduct(query: string) {
  return apiFetch<BarcodeCheck>("/products/identify", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export interface ProductMatch {
  source: "catalog" | "openbeautyfacts";
  // Catalog matches open the product page; OBF-only ones are checked by barcode.
  productId: string | null;
  barcode: string | null;
  name: string;
  brand: string;
  category: string | null;
  imageUrl: string | null;
  price: number | null;
  avgRating: number | null;
  reviewCount: number;
  // 0–100: how closely the brand and name match what was read.
  score: number;
}

export interface ReadTextLine {
  text: string;
  size: number;
}

// The photo scanner: lines read off the front of the pack, or a typed
// query from Manual search. Best match first.
export function matchProducts(input: { lines: ReadTextLine[] } | { query: string }) {
  return apiFetch<{ readText: string; matches: ProductMatch[] }>("/products/match", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// The same verdict for a catalog product, for its detail page.
export function getProductVerdict(id: string) {
  return apiFetch<{ verdict: Verdict; reviewCount: number; avgRating: number | null }>(
    `/products/${id}/verdict`,
  );
}
