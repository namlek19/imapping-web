import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken } from "@/app/api/v1/_lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();

  const formData = await req.formData();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/locations/${id}/upload-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();
  return NextResponse.json({
    status: body.status ?? beRes.status,
    message: body.message ?? "OK",
    data: body.data ?? null,
  });
}
