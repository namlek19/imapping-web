"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { spaceGrotesk, plusJakarta } from "@/components/fonts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Overview {
  totalUsers: number;
  activeToday: number;
  totalSessions: number;
  avgSessionsPerUser: number;
}

interface LoginPoint   { date: string; sessions: number }
interface FeaturePoint { action: string; count: number }
interface RecentUser   {
  userId: string; name: string; email: string;
  lastActive: string; totalSessions: number; status: "active" | "inactive";
}

interface DashboardData {
  overview: Overview;
  loginHistory: LoginPoint[];
  featureUsage: FeaturePoint[];
  recentUsers: RecentUser[];
}

type Tab = "dashboard" | "orders" | "cskh" | "locations" | "add-location";

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
      <p className="text-sm text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="font-bold text-gray-800">{payload[0].value}</p>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
        <path fillRule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h10.5a.75.75 0 0 1 0 1.5H12v13.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V3.5h-.5A.75.75 0 0 1 1 2.75ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-4 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Z" clipRule="evenodd" />
        <path d="M14.75 7.25a.75.75 0 0 0-.75.75v9.25h3.25A1.75 1.75 0 0 0 19 15.5V8a.75.75 0 0 0-.75-.75h-3.5Z" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "Order History",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
        <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "cskh",
    label: "CSKH",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
        <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 0 1-5.183.501.78.78 0 0 0-.528.224l-3.579 3.58A.75.75 0 0 1 6 17.25v-3.443a41.033 41.033 0 0 1-2.57-.339C1.993 13.244 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "locations",
    label: "Địa điểm",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
        <path fillRule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h10.5a.75.75 0 0 1 0 1.5H12v13.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V3.5h-.5A.75.75 0 0 1 1 2.75ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-4 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "add-location",
    label: "Thêm địa điểm",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .757.433l.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function Sidebar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <aside className="w-60 shrink-0 bg-slate-950 min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <span className={`${spaceGrotesk.className} text-base font-bold text-white`}>iMapping</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "cskh" && !isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  value, sub, bg, icon,
}: {
  value: string | number; sub: string;
  bg: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-7 flex items-start justify-between gap-4" style={{ backgroundColor: bg }}>
      <div className="flex flex-col gap-2 min-w-0">
        <p className="text-5xl font-bold tabular-nums text-white tracking-tight">{value}</p>
        <p className="text-sm text-white/80">{sub}</p>
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
        {icon}
      </div>
    </div>
  );
}

// ─── Order History tab ────────────────────────────────────────────────────────

interface Order {
  id: string;
  user: string;
  phone: string;
  location: string;
  numberOfPeople: number;
  bookingDate: string;
  note: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
}

function mapStatus(s: string): Order["status"] {
  const u = s?.toUpperCase();
  if (u === "ACCEPTED") return "ACCEPTED";
  if (u === "REJECTED") return "REJECTED";
  if (u === "CANCELLED") return "CANCELLED";
  return "PENDING";
}

const REJECT_PHRASE = "nam le dep trai";

function OrderHistoryTab() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [updating, setUpdating]   = useState<string | null>(null);
  const [rejectId, setRejectId]   = useState<string | null>(null);
  const [rejectText, setRejectText] = useState("");

  useEffect(() => {
    fetch("/api/v1/admin/bookings")
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200 && Array.isArray(body.data)) {
          setOrders(body.data.map((b: Record<string, unknown>) => ({
            id: String(b.id),
            user: String(b.userName ?? b.userId ?? "—"),
            phone: String(b.phoneNumber ?? "—"),
            location: String(b.locationName ?? b.locationId ?? "—"),
            numberOfPeople: Number(b.numberOfPeople ?? 1),
            bookingDate: String(b.bookingDate ?? ""),
            note: String(b.note ?? ""),
            status: mapStatus(String(b.status ?? "PENDING")),
          })));
        } else {
          setError(body.message ?? "Không tải được danh sách đặt chỗ");
        }
      })
      .catch(() => setError("Không thể kết nối tới server"))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id: string, status: Order["status"]) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/v1/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json();
      if (body.status === 200) {
        setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
        setViewOrder((prev) => prev?.id === id ? { ...prev, status } : prev);
      } else {
        setError(body.message ?? "Cập nhật thất bại");
      }
    } catch {
      setError("Không thể kết nối tới server");
    }
    setUpdating(null);
  }

  const statusLabel: Record<Order["status"], string> = {
    PENDING: "Chờ xử lý", ACCEPTED: "Đã chấp nhận", REJECTED: "Đã từ chối", CANCELLED: "Đã huỷ",
  };
  const statusCls: Record<Order["status"], string> = {
    PENDING: "text-amber-500", ACCEPTED: "text-emerald-600", REJECTED: "text-red-500", CANCELLED: "text-slate-400",
  };

  function fmtDate(iso: string) {
    if (!iso) return "—";
    try {
      const d = /Z|[+-]\d{2}:?\d{2}$/.test(iso) ? new Date(iso) : new Date(iso + "Z");
      return d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });
    }
    catch { return iso; }
  }

  return (
    <>
      <SectionHeader title="Order History" sub="Danh sách đơn đặt chỗ từ người dùng" />

      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Đơn đặt chỗ</p>
          <span className="text-xs text-gray-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">{orders.length} đơn</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-accent animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Chưa có đơn đặt chỗ nào
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Mã đơn</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Khách hàng</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Địa điểm</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400">Số người</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400">Ngày đặt</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{o.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-accent to-[#008080] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {(o.user[0] ?? "U").toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{o.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{o.location}</td>
                  <td className="px-6 py-4 text-center font-semibold tabular-nums text-gray-700">{o.numberOfPeople} người</td>
                  <td className="px-6 py-4 text-center text-gray-400 text-xs">{fmtDate(o.bookingDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewOrder(o)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Chi tiết
                      </button>
                      {o.status === "ACCEPTED" ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-medium text-emerald-600">Đã chấp nhận</span>
                      ) : o.status === "REJECTED" || o.status === "CANCELLED" ? (
                        <span className="px-3 py-1.5 rounded-lg bg-red-50 text-xs font-medium text-red-400">{statusLabel[o.status]}</span>
                      ) : (
                        <>
                          <button
                            onClick={() => setStatus(o.id, "ACCEPTED")}
                            disabled={updating === o.id}
                            className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
                          >
                            Chấp nhận
                          </button>
                          <button
                            onClick={() => { setRejectId(o.id); setRejectText(""); }}
                            disabled={updating === o.id}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject confirmation modal */}
      {rejectId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => { setRejectId(null); setRejectText(""); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">Từ chối đơn #{rejectId}?</p>
                <p className="text-sm text-gray-500 mt-0.5">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Để xác nhận, hãy nhập chính xác cụm từ bên dưới vào ô:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-center">
                <span className="font-mono text-sm font-semibold text-gray-800 select-all">{REJECT_PHRASE}</span>
              </div>
              <input
                type="text"
                value={rejectText}
                onChange={(e) => setRejectText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rejectText === REJECT_PHRASE) { setStatus(rejectId, "REJECTED"); setRejectId(null); setRejectText(""); }
                  if (e.key === "Escape") { setRejectId(null); setRejectText(""); }
                }}
                placeholder="Nhập cụm từ xác nhận…"
                autoFocus
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition font-mono ${
                  rejectText && rejectText !== REJECT_PHRASE
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
                    : rejectText === REJECT_PHRASE
                    ? "border-emerald-400 bg-emerald-50 focus:ring-2 focus:ring-emerald-200"
                    : "border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                }`}
              />
            </div>
            <div className="px-6 pb-5 flex items-center justify-end gap-2">
              <button
                onClick={() => { setRejectId(null); setRejectText(""); }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={() => { setStatus(rejectId, "REJECTED"); setRejectId(null); setRejectText(""); }}
                disabled={rejectText !== REJECT_PHRASE || updating === rejectId}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {updating === rejectId ? "Đang từ chối…" : "Từ chối đơn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Chi tiết đặt chỗ</p>
                <p className="text-base font-bold text-gray-900">#{viewOrder.id}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 flex flex-col gap-3 text-sm">
              {[
                { label: "Khách hàng",   value: viewOrder.user },
                { label: "Số điện thoại", value: viewOrder.phone },
                { label: "Địa điểm",    value: viewOrder.location },
                { label: "Số người",    value: `${viewOrder.numberOfPeople} người` },
                { label: "Ngày đặt",    value: fmtDate(viewOrder.bookingDate) },
                { label: "Ghi chú",     value: viewOrder.note || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className="font-semibold text-gray-800 text-right">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Trạng thái</span>
                <span className={`font-semibold ${statusCls[viewOrder.status]}`}>
                  {statusLabel[viewOrder.status]}
                </span>
              </div>
            </div>
            {viewOrder.status === "PENDING" && (
              <div className="px-6 pb-5 flex gap-2">
                <button
                  onClick={() => { setStatus(viewOrder.id, "ACCEPTED"); setViewOrder(null); }}
                  disabled={updating === viewOrder.id}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  Chấp nhận
                </button>
                <button
                  onClick={() => { setRejectId(viewOrder.id); setRejectText(""); setViewOrder(null); }}
                  disabled={updating === viewOrder.id}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Locations list tab ───────────────────────────────────────────────────────

interface LocationItem {
  locationId: string;
  name: string;
  address: string;
  category: string;
  imageUrl: string;
  averageRating: number;
  proposedPrice: number | null;
}

function LocationsTab() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_PHRASE = "nam le dep trai";
  const PAGE_SIZE = 10;

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/locations/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (body.status === 200) {
        setLocations((prev) => prev.filter((l) => l.locationId !== id));
        setTotalElements((n) => n - 1);
      } else {
        setError(body.message ?? "Xoá thất bại");
      }
    } catch {
      setError("Không thể kết nối tới server");
    }
    setDeletingId(null);
    setConfirmId(null);
    setConfirmText("");
  }

  function load(p: number) {
    setLoading(true);
    setError(null);
    fetch(`/api/v1/locations?page=${p}&size=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((body) => {
        if (body.status !== 200) { setError(body.message ?? "Lỗi tải danh sách"); return; }
        setLocations(body.data?.content ?? []);
        setTotalPages(body.data?.totalPages ?? 1);
        setTotalElements(body.data?.totalElements ?? 0);
        setPage(p);
      })
      .catch(() => setError("Không thể kết nối tới server"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(0); }, []);

  const CATEGORY_COLORS: Record<string, string> = {
    "F&B": "bg-amber-100 text-amber-700",
    "Thể thao": "bg-blue-100 text-blue-700",
    "Dịch vụ giải trí": "bg-purple-100 text-purple-700",
    "Dịch vụ lưu trú": "bg-teal-100 text-teal-700",
    "Khác": "bg-slate-100 text-slate-600",
  };

  return (
    <>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Địa điểm</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalElements} địa điểm trong hệ thống</p>
        </div>
        <button
          onClick={() => load(page)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}>
            <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-100 flex items-center justify-center py-24">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-accent animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 flex items-center justify-center py-24">
          <p className="text-sm text-gray-400">Chưa có địa điểm nào — hãy thêm ở tab &quot;Thêm địa điểm&quot;</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400">Địa điểm</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400">Địa chỉ</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400">Danh mục</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400">Đánh giá</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400">Giá / người</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {locations.map((loc) => (
                  <tr key={loc.locationId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          {loc.imageUrl ? (
                            <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800 line-clamp-1">{loc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs max-w-[200px]">
                      <span className="line-clamp-1">{loc.address || "—"}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {loc.category ? (
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${CATEGORY_COLORS[loc.category] ?? "bg-slate-100 text-slate-600"}`}>
                          {loc.category}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                          <path fillRule="evenodd" d="M8 1.25a.75.75 0 0 1 .692.462l1.25 3.001a.75.75 0 0 0 .628.462l3.25.293a.75.75 0 0 1 .421 1.316l-2.455 2.14a.75.75 0 0 0-.24.736l.752 3.17a.75.75 0 0 1-1.114.812L8 11.773l-2.784 1.67a.75.75 0 0 1-1.114-.813l.752-3.17a.75.75 0 0 0-.24-.735L2.16 6.784a.75.75 0 0 1 .42-1.316l3.25-.293a.75.75 0 0 0 .629-.462L7.308 1.71A.75.75 0 0 1 8 1.25Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold tabular-nums text-gray-700">
                          {loc.averageRating > 0 ? loc.averageRating.toFixed(1) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-gray-700 text-xs">
                      {loc.proposedPrice
                        ? `${loc.proposedPrice.toLocaleString("vi-VN")}đ`
                        : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => { setConfirmId(loc.locationId); setConfirmText(""); }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Xoá địa điểm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => load(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>
              <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => { setConfirmId(null); setConfirmText(""); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-red-500">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">Xoá địa điểm</p>
                <p className="text-sm text-gray-500 mt-0.5">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Để xác nhận, hãy nhập chính xác cụm từ bên dưới vào ô:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-center">
                <span className="font-mono text-sm font-bold text-red-600 select-all">{CONFIRM_PHRASE}</span>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && confirmText === CONFIRM_PHRASE) handleDelete(confirmId);
                  if (e.key === "Escape") { setConfirmId(null); setConfirmText(""); }
                }}
                placeholder="Nhập cụm từ xác nhận…"
                autoFocus
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition font-mono ${
                  confirmText && confirmText !== CONFIRM_PHRASE
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
                    : confirmText === CONFIRM_PHRASE
                    ? "border-emerald-400 bg-emerald-50 focus:ring-2 focus:ring-emerald-200"
                    : "border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                }`}
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex items-center justify-end gap-2">
              <button
                onClick={() => { setConfirmId(null); setConfirmText(""); }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={confirmText !== CONFIRM_PHRASE || deletingId === confirmId}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deletingId === confirmId ? "Đang xoá…" : "Xoá địa điểm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Add Location tab ─────────────────────────────────────────────────────────

const CATEGORIES = ["F&B", "Thể thao", "Dịch vụ giải trí", "Dịch vụ lưu trú", "Khác"];

const EMPTY_FORM = { name: "", description: "", address: "", category: "", proposedPrice: "" };

function ImageDropZone({ files, onChange }: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const imgs = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    if (imgs.length) onChange([...files, ...imgs]);
  }

  function remove(idx: number) {
    onChange(files.filter((_, i) => i !== idx));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function onPaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imgs = items.map((i) => i.getAsFile()).filter((f): f is File => !!f && f.type.startsWith("image/"));
    if (imgs.length) onChange([...files, ...imgs]);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none flex flex-col items-center justify-center gap-3 py-8
          ${dragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-slate-200 hover:border-accent hover:bg-slate-50"}`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => addFiles(e.target.files)} />
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-accent/15" : "bg-slate-100"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${dragging ? "text-accent" : "text-slate-400"}`}>
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">
            {dragging ? "Thả ảnh vào đây" : "Kéo thả, dán (Ctrl+V) hoặc nhấn để chọn"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Chọn nhiều ảnh cùng lúc — ảnh đầu tiên là ảnh bìa</p>
        </div>
      </div>

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              {/* thumbnail */}
              <div className="aspect-square rounded-xl overflow-hidden border border-slate-100">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              </div>
              {/* badge bìa */}
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none">Bìa</span>
              )}
              {/* nút xóa — nằm ngoài overflow-hidden */}
              <button type="button" onClick={() => remove(i)}
                style={{ backgroundColor: "#ef4444" }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-accent hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function AddLocationTab() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      setStep(imageFiles.length > 0 ? "Đang tạo địa điểm & upload ảnh…" : "Đang tạo địa điểm…");

      const locationData: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        category: form.category || undefined,
        proposedPrice: form.proposedPrice.trim() || undefined,
      };

      const fd = new FormData();
      fd.append("location", new Blob([JSON.stringify(locationData)], { type: "application/json" }));
      if (imageFiles.length > 0) {
        fd.append("coverImage", imageFiles[0]);
        for (let i = 1; i < imageFiles.length; i++) {
          fd.append("galleryImages", imageFiles[i]);
        }
      }

      const res = await fetch("/api/v1/locations", { method: "POST", body: fd });
      const body = await res.json();

      if (body.status !== 200) {
        setResult({ ok: false, msg: body.message ?? "Tạo địa điểm thất bại." });
        return;
      }

      setResult({ ok: true, msg: `Tạo địa điểm thành công${imageFiles.length > 0 ? ` với ${imageFiles.length} ảnh` : ""}!` });
      setForm(EMPTY_FORM);
      setImageFiles([]);
    } catch {
      setResult({ ok: false, msg: "Không thể kết nối tới server." });
    } finally {
      setSaving(false);
      setStep(null);
    }
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-white";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

  return (
    <>
      <SectionHeader title="Thêm địa điểm" sub="Tạo địa điểm mới — ảnh upload thẳng lên Cloudinary" />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-7 grid grid-cols-2 gap-8 items-start">

        {/* Cột trái — thông tin */}
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Tên địa điểm <span className="text-red-400">*</span></label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="VD: The Coffee House Nguyễn Huệ" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Mô tả</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Mô tả ngắn về địa điểm..." rows={4}
              className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Địa chỉ</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)}
              placeholder="VD: 86-88 Lê Thánh Tôn, Q.1, TP.HCM" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Danh mục</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              <option value="">-- Chọn danh mục --</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Giá đề xuất / người</label>
            <input
              type="text"
              value={form.proposedPrice}
              onChange={(e) => set("proposedPrice", e.target.value)}
              placeholder="VD: 100.000 - 200.000 VNĐ"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1.5">Có thể nhập khoảng giá, ví dụ: 50.000 - 150.000 VNĐ</p>
          </div>

          {result && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              <span>{result.ok ? "✓" : "✗"}</span>
              <span>{result.msg}</span>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {saving ? (step ?? "Đang xử lý…") : "Tạo địa điểm"}
          </button>
        </div>

        {/* Cột phải — ảnh */}
        <div className="flex flex-col gap-3">
          <label className={labelCls}>
            Ảnh {imageFiles.length > 0 && <span className="font-normal text-slate-400">({imageFiles.length} ảnh)</span>}
          </label>
          <ImageDropZone files={imageFiles} onChange={(f) => { setImageFiles(f); setResult(null); }} />
        </div>

      </form>
    </>
  );
}

// ─── CSKH tab ─────────────────────────────────────────────────────────────────

interface SupportMessage {
  id: number;
  userId: number;
  message: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface SupportUser {
  userId: string;
  name: string;
  email: string;
}

function CSKHTab() {
  const [users, setUsers] = useState<SupportUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SupportUser | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const msgBottomRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLInputElement>(null);

  // Fetch only users who have sent support messages
  useEffect(() => {
    fetch("/api/v1/support/messages/users")
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200 && Array.isArray(body.data) && body.data.length > 0) {
          const list: SupportUser[] = body.data.map(
            (u: { userId: number; fullName: string; username: string }) => ({
              userId: String(u.userId),
              name: u.fullName || u.username || "Người dùng",
              email: u.username ?? "",
            })
          );
          setUsers(list);
          setSelectedUser(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  // Load messages when user selected
  useEffect(() => {
    if (!selectedUser) return;
    setMessages([]);
    setLoadingMsgs(true);
    fetch(`/api/v1/support/messages?userId=${selectedUser.userId}`)
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200 && Array.isArray(body.data)) {
          setMessages(body.data as SupportMessage[]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [selectedUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    msgBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 8s
  useEffect(() => {
    if (!selectedUser) return;
    const id = setInterval(() => {
      fetch(`/api/v1/support/messages?userId=${selectedUser.userId}`)
        .then((r) => r.json())
        .then((body) => {
          if (body.status === 200 && Array.isArray(body.data)) {
            setMessages(body.data as SupportMessage[]);
          }
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, [selectedUser]);

  async function sendReply() {
    if (!reply.trim() || !selectedUser || sending) return;
    const text = reply.trim();
    setReply("");
    setSending(true);
    try {
      const res = await fetch("/api/v1/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(selectedUser.userId), message: text, fromAdmin: true }),
      });
      const body = await res.json();
      if (body.status === 200 && body.data) {
        setMessages((prev) => [...prev, body.data as SupportMessage]);
      }
    } catch { /* ignore */ }
    setSending(false);
    setTimeout(() => replyRef.current?.focus(), 50);
  }

  return (
    <>
      <SectionHeader title="CSKH" sub="Hỗ trợ và tư vấn khách hàng qua chat" />
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex" style={{ height: "calc(100vh - 13rem)" }}>

        {/* Left: user list */}
        <div className="w-72 shrink-0 border-r border-slate-100 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Người dùng</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-accent animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-slate-200">
                  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                </svg>
                <p className="text-xs text-gray-400">Chưa có người dùng nào</p>
              </div>
            ) : (
              users.map((u) => {
                const isSelected = selectedUser?.userId === u.userId;
                return (
                  <button
                    key={u.userId}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? "bg-accent/5 border-r-2 border-accent" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-accent to-[#008080] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? "text-accent" : "text-gray-800"}`}>{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email || `user#${u.userId}`}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: conversation */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-400">Chọn một người dùng để xem hội thoại</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent to-[#008080] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {selectedUser.name[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.name}</p>
                  <p className="text-xs text-gray-400">{selectedUser.email || `User ID: ${selectedUser.userId}`}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-slate-50">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-accent animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-slate-200">
                      <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-400">Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.fromAdmin ? "justify-end" : "justify-start"}`}>
                      {!msg.fromAdmin && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">
                          {selectedUser.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className={`max-w-[70%] flex flex-col gap-1 ${msg.fromAdmin ? "items-end" : "items-start"}`}>
                        <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          msg.fromAdmin
                            ? "bg-accent text-white rounded-br-sm"
                            : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm"
                        }`}>
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-gray-400 px-1">{msg.createdAt?.slice(11, 16)}</span>
                      </div>
                      {msg.fromAdmin && (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          A
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={msgBottomRef} />
              </div>

              {/* Reply input */}
              <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-white">
                <input
                  ref={replyRef}
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                  placeholder={`Trả lời ${selectedUser.name}…`}
                  disabled={sending}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition disabled:opacity-60"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white disabled:opacity-40 transition hover:bg-accent/90 active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 translate-x-px">
                    <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────

function DashboardTab({ data, loading, fetchError, onRefresh, refreshing }: { data: DashboardData | null; loading: boolean; fetchError: string | null; onRefresh: () => void; refreshing: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-accent animate-spin" />
        <p className="text-sm text-gray-400">Đang tải dashboard…</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center px-4">
        <p className="text-sm font-semibold text-red-500">Không tải được dữ liệu dashboard</p>
        <p className="text-xs text-gray-400 max-w-xs">{fetchError ?? "Không có phản hồi từ server"}</p>
        <button onClick={onRefresh} className="mt-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          Thử lại
        </button>
      </div>
    );
  }
  const { overview, loginHistory, featureUsage, recentUsers } = data!;

  const loginChartData = loginHistory.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Cập nhật đến {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          >
            <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z" clipRule="evenodd" />
          </svg>
          {refreshing ? "Đang tải…" : "Refresh"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={overview.totalUsers} sub="tài khoản đã đăng ký"
          bg="#334155"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" /></svg>}
        />
        <StatCard
          value={overview.activeToday} sub="phiên đăng nhập trong ngày"
          bg="#008080"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          value={overview.totalSessions.toLocaleString("vi-VN")} sub="Tổng phiên truy cập"
          bg="#FF7F50"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          value={overview.avgSessionsPerUser} sub="TB phiên / người"
          bg="#7c3aed"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.632l2.051-.684a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" /></svg>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Phiên đăng nhập theo ngày</p>
            <p className="text-xs text-gray-400 mt-0.5">14 ngày gần nhất</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={loginChartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="sessions" stroke="#008080" strokeWidth={2} dot={{ r: 3, fill: "#008080", strokeWidth: 0 }} activeDot={{ r: 4, fill: "#FF7F50", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Tính năng được dùng nhiều nhất</p>
            <p className="text-xs text-gray-400 mt-0.5">Hành vi người dùng</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={featureUsage} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="action" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={96} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="#FF7F50" radius={[0, 5, 5, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Người dùng gần đây</p>
          <span className="text-xs text-gray-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">{recentUsers.length} bản ghi</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Người dùng</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Email</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400">Tổng phiên</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400">Hoạt động cuối</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentUsers.map((u) => (
              <tr key={u.userId} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-accent to-[#008080] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {u.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <span className="font-medium text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{u.email}</td>
                <td className="px-6 py-4 text-center font-semibold tabular-nums text-gray-700">{u.totalSessions}</td>
                <td className="px-6 py-4 text-center text-gray-400">{(/Z|[+-]\d{2}:?\d{2}$/.test(u.lastActive) ? new Date(u.lastActive) : new Date(u.lastActive + "Z")).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    u.status === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-400" : "bg-slate-400"}`} />
                    {u.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [adminName, setAdminName]       = useState("");
  const [activeTab, setActiveTab]       = useState<Tab>("dashboard");
  const [authReady, setAuthReady]       = useState(false);

  function fetchStats(isRefresh = false) {
    if (isRefresh) { setRefreshing(true); setData(null); }
    setLoadingStats(true);
    setFetchError(null);
    fetch("/api/v1/admin/stats")
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200) setData(body.data);
        else setFetchError(body.message ?? `Lỗi ${body.status}`);
      })
      .catch((err) => setFetchError(String(err)))
      .finally(() => { setLoadingStats(false); setRefreshing(false); });
  }

  useEffect(() => {
    const rawRole = (localStorage.getItem("role") ?? "").toLowerCase();
    const role = rawRole.startsWith("role_") ? rawRole.slice(5) : rawRole;
    if (role !== "admin") { router.replace("/login"); return; }
    setAdminName(localStorage.getItem("name") ?? "");
    setAuthReady(true);
    fetchStats();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    router.push("/login");
  }

  // Only block render until auth is verified (localStorage read — near-instant)
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${plusJakarta.className} min-h-screen bg-slate-50 flex flex-col`}>

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <span className={`${spaceGrotesk.className} text-base font-bold text-accent`}>iMapping</span>
          <span className="text-slate-300 text-sm">/</span>
          <span className="text-sm text-slate-500 font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent to-[#008080] flex items-center justify-center text-white text-xs font-bold ring-2 ring-accent/20">
                {adminName ? adminName[0].toUpperCase() : "A"}
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-gray-400 font-medium">Xin chào,</span>
              <span className="text-sm font-bold text-gray-800">Admin {adminName} <span className="text-accent">cute</span> 🩷</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h4A2.25 2.25 0 0 1 10.5 4.25v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 0-.75-.75h-4a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h4a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 1 1.5 0v.5A2.25 2.25 0 0 1 8.25 14h-4A2.25 2.25 0 0 1 2 11.75v-7.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H6.75a.75.75 0 0 1 0-1.5h5.69l-.97-.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        <Sidebar active={activeTab} onChange={setActiveTab} />
        <main className="flex-1 min-w-0 px-8 py-7">
          {activeTab === "dashboard"    && <DashboardTab data={data} loading={loadingStats} fetchError={fetchError} onRefresh={() => fetchStats(true)} refreshing={refreshing} />}
          {activeTab === "orders"       && <OrderHistoryTab />}
          {activeTab === "cskh"         && <CSKHTab />}
          {activeTab === "locations"    && <LocationsTab />}
          {activeTab === "add-location" && <AddLocationTab />}
        </main>
      </div>
    </div>
  );
}
