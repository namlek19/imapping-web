import { NextRequest, NextResponse } from "next/server";
import { BE_BASE, getAuthToken, authHeaders } from "@/app/api/v1/_lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const token = await getAuthToken();
  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans/${planId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server." });
  }
  let body: Record<string, unknown> = {};
  try { const t = await beRes.text(); if (t) body = JSON.parse(t); } catch { }
  return NextResponse.json({ status: (body.status as number) ?? beRes.status, message: (body.message as string) ?? "OK" });
}

function computeInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const token = await getAuthToken();

  let beRes: Response;
  try {
    beRes = await fetch(`${BE_BASE}/api/v1/plans/${planId}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ status: 503, message: "Không thể kết nối tới server.", data: null }, { status: 503 });
  }

  const body = await beRes.json();

  if (!beRes.ok) {
    return NextResponse.json(
      { status: beRes.status, message: body.message ?? "Không tìm thấy plan.", data: null },
      { status: beRes.status }
    );
  }

  const d = body.data ?? body;

  const members = (d.members ?? []).map((m: Record<string, unknown>) => {
    const name = String(m.fullName ?? m.username ?? "");
    return { userId: String(m.userId), name, initials: computeInitials(name) };
  });

  const itinerary = (d.itinerary ?? []).map((item: Record<string, unknown>) => {
    // Backend stores startTime as ISO string; split into date and time for the UI
    const startTime = String(item.startTime ?? item.date ?? "");
    const [datePart, timePart] = startTime.includes("T")
      ? startTime.split("T")
      : [startTime, String(item.time ?? "")];
    return {
      id: String(item.id ?? item.itineraryId ?? ""),
      locationId: String(item.locationId ?? ""),
      date: datePart,
      time: (timePart ?? "").substring(0, 5),
      location: String(item.locationName ?? item.customLocationName ?? item.location ?? ""),
      content: String(item.content ?? ""),
      orderIndex: Number(item.orderIndex ?? 0),
    };
  });

  const expenses = (d.expenses ?? []).map((e: Record<string, unknown>) => ({
    id: String(e.id),
    planId: String(e.planId),
    paidById: String(e.paidById),
    paidByName: e.paidByName,
    amount: e.amount,
    title: e.title,
    category: e.category,
    splits: e.splits ?? [],
  }));

  return NextResponse.json({
    status: 200,
    message: "OK",
    data: {
      planId: String(d.planId ?? d.id),
      name: d.name,
      destination: d.destination,
      startDate: d.startDate,
      endDate: d.endDate,
      creatorId: String(d.creatorId ?? ""),
      creatorName: d.creatorName ?? "",
      members,
      itinerary,
      expenses,
    },
  });
}
