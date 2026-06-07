import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string; itineraryId: string }> }
) {
  const { planId, itineraryId } = await params;
  const token = await getAuthToken();
  const body = await req.json();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans/${planId}/itinerary/${itineraryId}`, {
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string; itineraryId: string }> }
) {
  const { planId, itineraryId } = await params;
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans/${planId}/itinerary/${itineraryId}`, {
      method: "DELETE",
      headers: authHeaders(token),
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
