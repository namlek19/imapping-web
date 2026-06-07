export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { BE_BASE } from "@/app/api/v1/_lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, dob, phone, password } = await req.json();

  if (!name || !email || !dob || !password) {
    return NextResponse.json({ status: 400, message: "Vui lòng điền đầy đủ thông tin bắt buộc.", data: null });
  }

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, dob, phone, password, confirmPassword: password }),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  return NextResponse.json(
    { status: beRes.status, message: body.message ?? (beRes.ok ? "Đăng ký thành công." : "Đăng ký thất bại."), data: body.data ?? null },
    { status: beRes.status }
  );
}
