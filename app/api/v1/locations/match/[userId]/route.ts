import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/locations/match/${userId}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  if (!beRes.ok) {
    return NextResponse.json(
      { status: beRes.status, message: body.message ?? "Lỗi.", data: null },
      { status: beRes.status }
    );
  }

  const list = (Array.isArray(body.data) ? body.data : body.data?.content ?? []).map(
    (item: Record<string, unknown>) => ({
      locationId: String(item.locationId ?? item.id),
      name: item.name,
      matchPercent: item.matchPercentage ?? item.matchPercent ?? 0,
      matchReason: item.matchReason ?? "",
    })
  );

  return NextResponse.json({ status: 200, message: "OK", data: list });
}
