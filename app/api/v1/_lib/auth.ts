import { cookies } from "next/headers";

export const BE_BASE = process.env.NEXT_PUBLIC_BE_BASE || process.env.BE_BASE || "https://api-imapping.coachcafe.shop";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value ?? null;
}

export function authHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}
