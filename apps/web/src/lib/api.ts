import { hc } from "hono/client";

const API_BASE = "/api";

export function sessionHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem("ffmotor_current_user");
    if (!raw) return {};
    const user = JSON.parse(raw) as { id?: string };
    return user.id ? { "X-FF-User-Id": user.id } : {};
  } catch {
    return {};
  }
}

/**
 * Type-Safe Hono RPC Client
 * Menyediakan semakan jenis dan fungsi panggilan API moden.
 */
export const apiClient = hc<any>("/", {
  headers: () => ({
    ...sessionHeader(),
  }),
});

/**
 * Standard fetch wrapper dengan pengesahan sesi automatik (Backward-compatible)
 */
export async function fetchApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...sessionHeader(),
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({ message: res.statusText }))) as any;
      throw new Error(err.message || "Ralat pelayan");
    }
    return (await res.json()) as T;
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}
