import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function GET() {
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/users/profile`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();
  return NextResponse.json(
    { status: beRes.status, message: body.message ?? "OK", data: body.data ?? null },
    { status: beRes.status }
  );
}

export async function PATCH(req: NextRequest) {
  const token = await getAuthToken();
  const { selfNote, personalityTags } = await req.json();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/users/profile`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ selfNote, personalityTags }),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();
  return NextResponse.json(
    { status: beRes.status, message: body.message ?? "OK", data: body.data ?? null },
    { status: beRes.status }
  );
}
