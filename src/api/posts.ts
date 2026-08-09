import { apiFetch } from './client'

export interface Post {
  id: string
  content: string
  tag: string | null
  likes: number
  commentCount: number
  likedByMe: boolean
  createdAt: string
  authorName: string
}


export interface Comment {
  id: string
  content: string
  createdAt: string
  authorName: string
}


export function getPosts() {
  return apiFetch<Post[]>('/posts')
}

export function createPost(content: string, tag?: string) {
  return apiFetch<Post>('/posts', { method: 'POST', body: JSON.stringify({ content, tag }) })
}

export function likePost(id: string) {
  return apiFetch(`/posts/${id}/like`, { method: 'POST' })
}


export function getComments(postId: string) {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`)
}

export function addComment(postId: string, content: string) {
  return apiFetch<Comment>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })
}