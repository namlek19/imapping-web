export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  const optionIds: number[] = await req.json();

  // Resolve userId from user profile
  let userId: string;
  try {
    const profileRes = await fetch(`${BE_BASE}/api/v1/users/profile`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
    const profileBody = await profileRes.json();
    userId = String(profileBody.data?.userId ?? "");
    if (!userId || userId === "undefined") throw new Error("no userId");
  } catch {
    return NextResponse.json({ status: 401, message: "Không thể xác thực người dùng.", data: null });
  }

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/quiz/submit/${userId}`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(optionIds),
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
