import { NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function POST() {
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/events/checkin`, {
      method: "POST",
      headers: authHeaders(token),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();
  return NextResponse.json({
    status: (body.status as number) ?? beRes.status,
    message: (body.message as string) ?? "OK",
    data: body.data ?? null,
  });
}
