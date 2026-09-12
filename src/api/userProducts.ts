import { apiFetch } from './client'

export interface UserProduct {
  id: string
  customName: string | null
  customBrand: string | null
  openedAt: string | null
  expiresAt: string | null
  quantityTotal: number | null
  quantityLeft: number | null
  quantityUnit: string | null
  isFinished: boolean
  createdAt: string
  product: { id: string; name: string; brand: string; category: string } | null
}

export interface AddUserProductInput {
  productId?: string
  customName?: string
  customBrand?: string
  category?: string
  openedAt?: string
  expiresAt?: string
  quantityTotal?: number
  quantityUnit?: string
}

export function getMyProducts() {
  return apiFetch<UserProduct[]>('/user-products')
}

export function addMyProduct(data: AddUserProductInput) {
  return apiFetch<UserProduct>('/user-products', { method: 'POST', body: JSON.stringify(data) })
}

export function updateMyProduct(id: string, updates: Partial<{ isFinished: boolean; quantityLeft: number; expiresAt: string | null }>) {
  return apiFetch<UserProduct>(`/user-products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
}

export function removeMyProduct(id: string) {
  return apiFetch(`/user-products/${id}`, { method: 'DELETE' })
}