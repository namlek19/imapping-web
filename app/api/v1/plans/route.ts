import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export interface PlanMember {
  userId: string;
  name: string;
  initials: string;
}

export interface Plan {
  planId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: PlanMember[];
}

function computeInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export async function GET() {
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  if (!beRes.ok) {
    return NextResponse.json({ status: beRes.status, message: body.message ?? "Lỗi.", data: null }, { status: beRes.status });
  }

  const list = (Array.isArray(body.data) ? body.data : []).map((item: Record<string, unknown>) => {
    const creatorName = String(item.creatorName ?? "");
    const creatorMember = item.creatorId
      ? [{ userId: String(item.creatorId), name: creatorName, initials: computeInitials(creatorName) }]
      : [];
    return {
      planId: String(item.planId ?? item.id),
      name: item.name,
      destination: item.destination,
      startDate: item.startDate,
      endDate: item.endDate,
      members: creatorMember,
    };
  });

  return NextResponse.json({ status: 200, message: "OK", data: list });
}

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  const { name, destination, startDate, endDate } = await req.json();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name, destination, startDate, endDate }),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  if (!beRes.ok) {
    return NextResponse.json({ status: beRes.status, message: body.message ?? "Tạo plan thất bại.", data: null }, { status: beRes.status });
  }

  const d = body.data ?? body;
  return NextResponse.json({
    status: 200,
    message: "Tạo plan thành công.",
    data: {
      planId: String(d.planId ?? d.id),
      name: d.name,
      destination: d.destination,
      startDate: d.startDate,
      endDate: d.endDate,
      members: (d.members ?? []).map((m: Record<string, unknown>) => {
        const memberName = String(m.fullName ?? m.username ?? "");
        return {
          userId: String(m.userId),
          name: memberName,
          initials: computeInitials(memberName),
        };
      }),
    },
  });
}
