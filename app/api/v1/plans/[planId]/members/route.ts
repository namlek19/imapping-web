import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const token = await getAuthToken();
  const { userId } = await req.json();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans/${planId}/members`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ userId }),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server." });
  }

  let body: Record<string, unknown> = {};
  try { const t = await beRes.text(); if (t) body = JSON.parse(t); } catch { }
  return NextResponse.json({
    status: (body.status as number) ?? beRes.status,
    message: (body.message as string) ?? "OK",
  });
}
