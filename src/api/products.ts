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

export function getProduct(id: string) {
  return apiFetch<Product>(`/products/${id}`);
}

export function getProductByBarcode(code: string) {
  return apiFetch<Product>(`/products/barcode/${code}`);
}
