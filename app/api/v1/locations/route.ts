export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export type { LocationItem } from "@/app/api/v1/locations/data";

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  const formData = await req.formData();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/locations`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  let beBody: Record<string, unknown> = {};
  try {
    const text = await beRes.text();
    if (text) beBody = JSON.parse(text);
  } catch { }

  return NextResponse.json({
    status: (beBody.status as number) ?? beRes.status,
    message: (beBody.message as string) ?? "OK",
    data: beBody.data ?? null,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "6";
  const category = searchParams.get("category") ?? "";

  const url = new URL(`${BE_BASE}/api/v1/locations`);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);
  if (category) url.searchParams.set("category", category);

  const token = await getAuthToken();

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
    return NextResponse.json({ status: beRes.status, message: body.message ?? "Lỗi.", data: null }, { status: beRes.status });
  }

  // BE returns CustomPageResponse: { content, currentPage, totalPages, totalElements, size }
  const pageData = body.data ?? body;
  const content = (pageData.content ?? []).map((item: Record<string, unknown>) => ({
    locationId: String(item.locationId ?? item.id),
    name: item.name,
    description: item.description,
    address: item.address,
    category: item.category ?? "",
    imageUrl: item.imageUrl ?? "",
    averageRating: item.averageRating ?? 0,
    proposedPrice: item.proposedPrice ?? null,
    latitude: item.latitude,
    longitude: item.longitude,
    matchPercentage: item.matchPercentage ?? 0,
    matchReason: item.matchReason ?? "",
  }));

  return NextResponse.json({
    status: 200,
    message: "OK",
    data: {
      content,
      currentPage: pageData.currentPage ?? 0,
      totalPages: pageData.totalPages ?? 1,
      totalElements: pageData.totalElements ?? content.length,
      size: pageData.size ?? content.length,
    },
  });
}
