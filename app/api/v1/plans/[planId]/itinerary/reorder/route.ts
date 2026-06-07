import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const token = await getAuthToken();
  const body = await req.json(); // List<{ itineraryId, orderIndex }>

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans/${planId}/itinerary/reorder`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null });
  }

  const data = await beRes.json();
  return NextResponse.json({
    status: (data.status as number) ?? beRes.status,
    message: (data.message as string) ?? "OK",
    data: data.data ?? null,
  });
}
