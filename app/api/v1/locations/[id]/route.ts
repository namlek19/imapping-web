import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getAuthToken();
  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/locations/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server." });
  }
  let body: Record<string, unknown> = {};
  try { const t = await beRes.text(); if (t) body = JSON.parse(t); } catch { }
  return NextResponse.json({ status: (body.status as number) ?? beRes.status, message: (body.message as string) ?? "OK" });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getAuthToken();

  // Pass userId as query param if present in request
  const userId = req.nextUrl.searchParams.get("userId");
  const url = new URL(`${BE_BASE}/api/v1/locations/${id}`);
  if (userId) url.searchParams.set("userId", userId);

  let beRes: Response;
  try {
    beRes = await fetch(url.toString(), {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  if (!beRes.ok) {
    return NextResponse.json(
      { status: beRes.status, message: body.message ?? "Không tìm thấy địa điểm.", data: null },
      { status: beRes.status }
    );
  }

  const d = body.data ?? body;

  const comments = (d.comments ?? []).map((c: Record<string, unknown>) => ({
    commentId: String(c.commentId),
    userName: c.userName ?? c.username ?? "Ẩn danh",
    initials: c.initials ?? String(c.userName ?? c.username ?? "A").charAt(0).toUpperCase(),
    rating: c.rating ?? 0,
    content: c.content ?? "",
    createdAt: c.createdAt ?? "",
  }));

  return NextResponse.json({
    status: 200,
    message: "OK",
    data: {
      locationId: String(d.id ?? d.locationId),
      name: d.name,
      address: d.address,
      description: d.description,
      category: d.category ?? "",
      proposedPrice: (d.proposedPrice as string | null) ?? null,
      openingHours: d.openingHours ?? "08:00 - 22:00",
      phoneNumber: d.phoneNumber ?? "",
      imageUrl: (d.images as string[] | undefined)?.[0] ?? d.imageUrl ?? "",
      images: d.images ?? (d.imageUrl ? [d.imageUrl] : []),
      amenities: d.amenities ?? [],
      matchPercent: d.matchPercentage ?? 0,
      matchReason: d.matchReason ?? "",
      aiComment: d.aiComment ?? "",
      comments,
    },
  });
}
