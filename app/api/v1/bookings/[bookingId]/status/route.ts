import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const token = await getAuthToken();
  const { status } = await req.json();

  let beRes: Response;
  try {
    beRes = await fetch(
      `${BE_BASE}/api/v1/bookings/${bookingId}/status?status=${encodeURIComponent(status)}`,
      {
        method: "PATCH",
        headers: authHeaders(token),
      }
    );
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
