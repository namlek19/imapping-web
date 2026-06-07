export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function GET() {
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/bookings/my`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null });
  }

  const body = await beRes.json();
  return NextResponse.json({
    status: (body.status as number) ?? beRes.status,
    message: (body.message as string) ?? "OK",
    data: body.data ?? null,
  });
}

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  const payload = await req.json(); // { locationId, bookingDate, numberOfPeople, note? }

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/bookings`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null });
  }

  const body = await beRes.json();
  return NextResponse.json({
    status: (body.status as number) ?? beRes.status,
    message: (body.message as string) ?? "OK",
    data: body.data ?? null,
  });
}
