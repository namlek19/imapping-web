import { NextRequest, NextResponse } from "next/server";
import { BE_BASE } from "@/app/api/v1/_lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  // BE always returns HTTP 200; real status is inside body.status
  const bodyStatus = body.status ?? beRes.status;

  if (bodyStatus !== 200 || !body.data?.token) {
    return NextResponse.json(
      { status: bodyStatus, message: body.message ?? "Đăng nhập thất bại.", data: null }
    );
  }

  const { token, userId, name, role } = body.data;

  const response = NextResponse.json({
    status: 200,
    message: "Đăng nhập thành công.",
    data: { token, userId: String(userId), name, role },
  });

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
