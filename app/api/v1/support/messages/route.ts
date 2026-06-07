import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function GET(req: NextRequest) {
  const token = await getAuthToken();
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ status: 400, message: "Thiếu userId.", data: null });

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/support/messages?userId=${userId}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối server.", data: null });
  }

  let body: Record<string, unknown> = {};
  try { const t = await beRes.text(); if (t) body = JSON.parse(t); } catch { }

  const status = (body.status as number) ?? beRes.status;
  return NextResponse.json({ status, message: (body.message as string) ?? "OK", data: body.data ?? [] });
}

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  const payload = await req.json();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/support/messages`, {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối server.", data: null });
  }

  let body: Record<string, unknown> = {};
  try { const t = await beRes.text(); if (t) body = JSON.parse(t); } catch { }

  const status = (body.status as number) ?? beRes.status;
  return NextResponse.json({ status, message: (body.message as string) ?? "OK", data: body.data ?? null });
}
