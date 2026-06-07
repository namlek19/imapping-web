import { NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function GET() {
  const token = await getAuthToken();
  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/support/messages/users`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối server.", data: [] });
  }

  let body: Record<string, unknown> = {};
  try { const t = await beRes.text(); if (t) body = JSON.parse(t); } catch { }

  const status = (body.status as number) ?? beRes.status;
  return NextResponse.json({ status, message: (body.message as string) ?? "OK", data: body.data ?? [] });
}
