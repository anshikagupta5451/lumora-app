import { apiFetch } from "./client";

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  goodFor: string[];
  category: string;
}

export function getIngredients(query?: string) {
  const qs = query ? `?query=${encodeURIComponent(query)}` : "";
  return apiFetch<Ingredient[]>(`/ingredients${qs}`);
}

export function getIngredient(name: string) {
  return apiFetch<Ingredient>(`/ingredients/${encodeURIComponent(name)}`);
}
