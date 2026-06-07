import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  const { message, userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ status: 400, message: "Thiếu userId.", data: null });
  }

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/chat/${userId}`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ message }),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await beRes.text();
    if (text) body = JSON.parse(text);
  } catch { }

  const businessStatus = (body.status as number) ?? beRes.status;
  return NextResponse.json({
    status: businessStatus,
    message: (body.message as string) ?? "OK",
    data: (body.data as string) ?? null,
  });
}
