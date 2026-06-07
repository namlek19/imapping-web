export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

function computeInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json({ status: 400, message: "Thiếu mã người dùng.", data: null });
  }

  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/users/lookup?code=${encodeURIComponent(code)}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  if (!beRes.ok || !body.data) {
    return NextResponse.json(
      { status: beRes.status, message: body.message ?? "Không tìm thấy người dùng với mã này.", data: null },
      { status: beRes.status }
    );
  }

  const d = body.data;
  const name = d.name ?? d.fullName ?? d.username ?? "";
  return NextResponse.json({
    status: 200,
    message: "Tìm thấy người dùng.",
    data: {
      userId: String(d.userId ?? d.id),
      name,
      initials: computeInitials(name),
    },
  });
}
