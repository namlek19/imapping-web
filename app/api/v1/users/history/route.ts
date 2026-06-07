export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function GET() {
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/users/history`, {
      headers: authHeaders(token),
      cache: "no-store",
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

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  const body = await req.json(); // { locationId, visitedDate }

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/users/history`, {
      method: "POST",
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
