export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function GET() {
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/admin/stats`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await beRes.text();
    if (text) body = JSON.parse(text);
  } catch { /* empty or non-JSON response */ }

  const bodyStatus = (body.status as number) ?? beRes.status;
  return NextResponse.json(
    { status: bodyStatus, message: (body.message as string) ?? "OK", data: body.data ?? null }
  );
}
