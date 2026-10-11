import { apiFetch } from "./client";

export interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  ingredients: string[];
  price: number;
  imageUrl: string | null;
  barcode: string | null;
  isPromoted: boolean;
  _count: { reviews: number; userProducts: number; routineSteps: number };
}

export interface ProductInput {
  name: string;
  brand: string;
  category: string;
  price: number;
  ingredients: string[];
  imageUrl: string | null;
  barcode: string | null;
  isPromoted: boolean;
}

// A product found on Open Beauty Facts, used to prefill the form.
export interface ProductDraft {
  barcode: string | null;
  name: string;
  brand: string;
  category: string | null;
  ingredients: string[];
  imageUrl: string | null;
  quantity: string | null;
  existingProductId: string | null;
}

export function getAdminProducts(query?: string) {
  return apiFetch<AdminProduct[]>(
    `/admin/products${query ? `?query=${encodeURIComponent(query)}` : ""}`,
  );
}

export function getAdminCategories() {
  return apiFetch<string[]>("/admin/categories");
}

export function createProduct(input: ProductInput) {
  return apiFetch<AdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProduct(id: string, input: Partial<ProductInput>) {
  return apiFetch<AdminProduct>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: string) {
  return apiFetch<{ success: true }>(`/admin/products/${id}`, { method: "DELETE" });
}

export function lookupProductBarcode(code: string) {
  return apiFetch<ProductDraft>(`/admin/lookup/barcode/${encodeURIComponent(code)}`);
}

export function searchProductsOnline(q: string) {
  return apiFetch<ProductDraft[]>(`/admin/lookup/search?q=${encodeURIComponent(q)}`);
}
