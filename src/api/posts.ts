import { Platform } from "react-native";
import { apiFetch } from "./client";

export interface Post {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  category: string;
  tags: string[];
  images: string[]; // ADDED
  likes: number;
  commentCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean; // ADDED
  createdAt: string;
  authorName: string;
}
export interface Comment {
  id: string;
  content: string;
  parentCommentId: string | null;
  createdAt: string;
  authorId: string | null;
  authorName: string;
}

export function getMyPosts() {
  return apiFetch<Post[]>("/posts/mine/all");
}

export function getBookmarkedPosts() {
  return apiFetch<Post[]>("/posts/bookmarked/all");
}

export function addComment(
  postId: string,
  content: string,
  parentCommentId?: string,
  isAnonymous?: boolean,
) {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentCommentId, isAnonymous }),
  });
}

export function getPosts(category?: string) {
  const qs =
    category && category !== "All"
      ? `?category=${encodeURIComponent(category)}`
      : "";
  return apiFetch<Post[]>(`/posts${qs}`);
}

export function getPost(id: string) {
  return apiFetch<Post>(`/posts/${id}`);
}

export function createPost(data: {
  title?: string;
  content: string;
  category?: string;
  tags?: string[];
  images?: string[]; // ADDED
}) {
  return apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deletePost(id: string) {
  return apiFetch<{ success: boolean }>(`/posts/${id}`, {
    method: "DELETE",
  });
}

export function toggleLikePost(id: string) {
  return apiFetch<{ likes: number; likedByMe: boolean }>(`/posts/${id}/like`, {
    method: "POST",
  });
}

export function toggleBookmarkPost(id: string) {
  return apiFetch<{ bookmarkedByMe: boolean }>(`/posts/${id}/bookmark`, {
    method: "POST",
  });
}

export function reportPost(id: string, reason?: string) {
  return apiFetch<{ success: boolean; alreadyReported: boolean }>(
    `/posts/${id}/report`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
}

export function getComments(postId: string) {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`);
}

export async function uploadPostImages(uris: string[]): Promise<string[]> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    // On web, expo-image-picker returns blob:/data: URLs, not native
    // file paths — these have to be fetched into real Blob objects
    // before FormData can send them. The RN { uri, name, type } shape
    // below only works on native, where fetch treats it as a file
    // reference rather than trying to serialize it as JSON.
    await Promise.all(
      uris.map(async (uri, i) => {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append("images", blob, `photo${i}.jpg`);
      }),
    );
  } else {
    uris.forEach((uri, i) => {
      const filename = uri.split("/").pop() || `photo${i}.jpg`;
      const ext = filename.split(".").pop()?.toLowerCase();
      const type = ext === "png" ? "image/png" : "image/jpeg";
      formData.append("images", {
        uri,
        name: filename,
        type,
      } as any);
    });
  }

  const data = await apiFetch<{ urls: string[] }>("/uploads/images", {
    method: "POST",
    body: formData,
  });
  return data.urls;
}
