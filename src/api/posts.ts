import { apiFetch } from './client'

export interface Post {
  id: string
  title: string | null
  content: string
  category: string
  tags: string[]
  likes: number
  commentCount: number
  likedByMe: boolean
  createdAt: string
  authorName: string
}

export interface Comment {
  id: string
  content: string
  parentCommentId: string | null
  createdAt: string
  authorName: string
}

export function getPosts(category?: string) {
  const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''
  return apiFetch<Post[]>(`/posts${qs}`)
}

export function getPost(id: string) {
  return apiFetch<Post>(`/posts/${id}`)
}

export function createPost(data: { title?: string; content: string; category?: string; tags?: string[] }) {
  return apiFetch<Post>('/posts', { method: 'POST', body: JSON.stringify(data) })
}

export function toggleLikePost(id: string) {
  return apiFetch<{ likes: number; likedByMe: boolean }>(`/posts/${id}/like`, { method: 'POST' })
}

export function getComments(postId: string) {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`)
}

export function addComment(postId: string, content: string, parentCommentId?: string) {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parentCommentId }),
  })
}