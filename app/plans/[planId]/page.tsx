"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AnimatedBackButton from "@/components/animated-back-button";
import type { Plan } from "@/app/api/v1/plans/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItineraryItem {
  id: string;
  locationId: string;
  date: string;
  time: string;
  location: string;
  content: string;
  orderIndex: number;
}

interface ExpenseSplit { userId: string; userName: string; amountOwed: number; }
interface ExpenseItem {
  id: string;
  planId: string;
  paidById: string;
  paidByName: string;
  amount: number;
  title: string;
  category: string;
  splits: ExpenseSplit[];
}
interface DebtBalance {
  fromUserId: string; fromUserName: string;
  toUserId: string;   toUserName: string;
  amount: number;     message: string;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["bg-[#003e3e]", "bg-[#008080]", "bg-[#FF7F50]", "bg-amber-500", "bg-purple-500", "bg-emerald-600"];

function asUTC(iso: string) {
  return /Z|[+-]\d{2}:?\d{2}$/.test(iso) ? new Date(iso) : new Date(iso + "Z");
}
function formatDateLong(iso: string) {
  return asUTC(iso).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
}
function formatDateShort(iso: string) {
  return asUTC(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
}
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000) + 1;
}
function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + " VNĐ";
}

const CATEGORY_LABEL: Record<string, string> = {
  transport: "Di chuyển", accommodation: "Lưu trú", food: "Ăn uống",
  activity: "Hoạt động", other: "Khác",
};
const CATEGORY_EMOJI: Record<string, string> = {
  transport: "🚌", accommodation: "🏨", food: "🍜", activity: "🎯", other: "💳",
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({
  items,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  items: ItineraryItem[];
  onEdit: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
        <p className="text-sm text-gray-400">Chưa có mốc nào. Thêm mốc hoặc gợi ý bằng AI!</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col">
      {sorted.map((item, idx) => {
        const isLast    = idx === sorted.length - 1;
        const isHovered = hoveredId === item.id;
        return (
          <div key={item.id} className="flex gap-4" onMouseEnter={() => setHoveredId(item.id)} onMouseLeave={() => setHoveredId(null)}>
            <div className="flex flex-col items-center">
              <div className={`mt-3.5 w-3 h-3 rounded-full border-2 border-[#008080] shrink-0 transition-all duration-200 ${isHovered ? "bg-[#008080] scale-125" : "bg-white"}`} />
              {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
            </div>
            <div className="flex-1 pb-5">
              <div className="flex items-center gap-2 py-2">
                <span className="text-sm font-bold text-gray-800">{item.time}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{formatDateShort(item.date)}</span>
                <span className="text-xs text-gray-600 font-medium flex-1 truncate">{item.location}</span>
                <div className={`flex items-center gap-0.5 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                  <button
                    onClick={() => onMoveUp(item.id)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Lên trên"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onMoveDown(item.id)}
                    disabled={idx === sorted.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Xuống dưới"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-[#008080] transition-colors"
                    title="Sửa mốc"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM4.75 7.5a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25V9.5a.75.75 0 0 1 1.5 0v1.75A1.75 1.75 0 0 1 8.25 13h-3.5A1.75 1.75 0 0 1 3 11.25v-3.5C3 6.783 3.784 6 4.75 6H6.5a.75.75 0 0 1 0 1.5H4.75Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Xoá mốc"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.712Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
                {item.content && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-2">
                    <p className="text-xs text-gray-600 leading-relaxed">{item.content}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared Expenses ──────────────────────────────────────────────────────────

function SharedExpenses({ items, balances }: { items: ExpenseItem[]; balances: DebtBalance[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const total = items.reduce((s, x) => s + x.amount, 0);

  if (items.length === 0) return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center">
      <p className="text-sm text-gray-400">Chưa có chi phí nào. Thêm chi phí để chia tiền với nhóm!</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Total */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-emerald-600 tabular-nums">{formatVND(total)}</span>
        <span className="text-xs text-gray-400">tổng chi phí nhóm</span>
      </div>

      {/* Expense list */}
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isOpen = expandedId === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-lg shrink-0">{CATEGORY_EMOJI[item.category] ?? "💳"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400">{CATEGORY_LABEL[item.category] ?? item.category} · {item.paidByName} trả</p>
                </div>
                <span className="text-sm font-bold text-gray-700 tabular-nums shrink-0">{formatVND(item.amount)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 flex flex-col gap-1.5">
                  {item.splits.map((s) => (
                    <div key={s.userId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{s.userName}</span>
                      <span className="font-semibold text-gray-700 tabular-nums">{formatVND(s.amountOwed)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Debt balances */}
      {balances.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ai nợ ai</p>
          {balances.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">{b.fromUserName}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium text-gray-700">{b.toUserName}</span>
              <span className="ml-auto font-bold text-red-500 tabular-nums">{formatVND(b.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────

function AddMemberModal({ planId, onClose, onAdd }: { planId: string; onClose: () => void; onAdd: (m: { userId: string; name: string; initials: string }) => void }) {
  const [code, setCode]     = useState("");
  const [busy, setBusy]     = useState(false);
  const [errMsg, setErrMsg] = useState("");

  async function submit() {
    const trimmed = code.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setErrMsg("");

    try {
      // Step 1: lookup user by code
      const lookupRes  = await fetch(`/api/v1/users/lookup?code=${encodeURIComponent(trimmed)}`);
      const lookupBody = await lookupRes.json();
      if (lookupBody.status !== 200 || !lookupBody.data) {
        setErrMsg(lookupBody.message ?? "Không tìm thấy người dùng với mã này.");
        return;
      }
      const found = lookupBody.data as { userId: string; name: string; initials: string };

      // Step 2: add to plan
      const addRes  = await fetch(`/api/v1/plans/${planId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(found.userId) }),
      });
      const addBody = await addRes.json();
      if (addBody.status === 200 || addBody.status === 201) {
        onAdd(found);
        onClose();
      } else {
        setErrMsg(addBody.message ?? "Không thể thêm thành viên.");
      }
    } catch {
      setErrMsg("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 bg-linear-to-r from-[#008080] to-accent" />
        <div className="px-7 py-6 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Thêm thành viên</h2>
              <p className="text-xs text-gray-400 mt-0.5">Nhập mã của người bạn muốn mời</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-gray-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
              </svg>
            </button>
          </div>

          {/* Input */}
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setErrMsg(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Nhập mã người dùng"
            autoFocus
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono font-semibold tracking-widest outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition placeholder:font-normal placeholder:tracking-normal"
          />

          {/* Error */}
          {errMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0-4a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 1.5 0v3.5A.75.75 0 0 1 8 11Zm0 2.25a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" clipRule="evenodd" />
              </svg>
              {errMsg}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={!code.trim() || busy}
            className="w-full py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-[#e86e3f] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Đang thêm…
              </>
            ) : "Thêm vào kế hoạch"}
          </button>

          <p className="text-center text-xs text-gray-400 -mt-2">
            Bạn bè có thể tìm mã của họ trong trang{" "}
            <span className="font-semibold text-gray-500">Hồ sơ cá nhân</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────

interface Member { userId: string; name: string; initials: string; }

function AddExpenseModal({
  planId,
  members,
  onClose,
  onAdd,
}: {
  planId: string;
  members: Member[];
  onClose: () => void;
  onAdd: (expense: ExpenseItem) => void;
}) {
  const [title, setTitle]     = useState("");
  const [amount, setAmount]   = useState("");
  const [category, setCategory] = useState("other");
  const [paidById, setPaidById] = useState(members[0]?.userId ?? "");
  // splits: equal by default, editable
  const [splits, setSplits]   = useState<Record<string, string>>(() =>
    Object.fromEntries(members.map((m) => [m.userId, ""]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg]   = useState("");
  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition";

  const CATEGORIES = [
    { value: "food", label: "🍜 Ăn uống" },
    { value: "transport", label: "🚌 Di chuyển" },
    { value: "accommodation", label: "🏨 Lưu trú" },
    { value: "activity", label: "🎯 Hoạt động" },
    { value: "other", label: "💳 Khác" },
  ];

  function distributeEqually() {
    const amt = parseFloat(amount);
    if (!amt || members.length === 0) return;
    const each = Math.ceil(amt / members.length);
    setSplits(Object.fromEntries(members.map((m) => [m.userId, String(each)])));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setErrMsg("Số tiền không hợp lệ."); return; }
    if (!paidById) { setErrMsg("Vui lòng chọn người trả."); return; }
    const splitItems = members
      .map((m) => ({ userId: m.userId, amountOwed: parseFloat(splits[m.userId] ?? "0") || 0 }))
      .filter((s) => s.amountOwed > 0);
    if (splitItems.length === 0) { setErrMsg("Vui lòng nhập số tiền chia cho ít nhất 1 người."); return; }

    setSubmitting(true);
    setErrMsg("");
    try {
      const res = await fetch("/api/v1/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: Number(planId),
          paidBy: Number(paidById),
          amount: amt,
          title,
          category,
          splits: splitItems.map((s) => ({ userId: Number(s.userId), amountOwed: s.amountOwed })),
        }),
      });
      const body = await res.json();
      if (body.status === 200 || body.status === 201) {
        onAdd({
          id: String(body.data?.id ?? Date.now()),
          planId,
          paidById,
          paidByName: members.find((m) => m.userId === paidById)?.name ?? "",
          amount: amt,
          title,
          category,
          splits: splitItems.map((s) => ({
            userId: s.userId,
            userName: members.find((m) => m.userId === s.userId)?.name ?? "",
            amountOwed: s.amountOwed,
          })),
        });
        onClose();
      } else {
        setErrMsg(body.message ?? "Không thể thêm chi phí.");
      }
    } catch {
      setErrMsg("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 bg-linear-to-r from-emerald-500 to-accent" />
        <div className="px-7 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Thêm chi phí</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-gray-500 hover:bg-slate-200 flex items-center justify-center transition-colors">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Tên khoản chi</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Vé cáp treo Fansipan" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                <input required type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1200000" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Danh mục</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Người trả</label>
              <select value={paidById} onChange={(e) => setPaidById(e.target.value)} className={inputCls}>
                {members.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
              </select>
            </div>

            {/* Splits */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Chia tiền</label>
                <button type="button" onClick={distributeEqually} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                  Chia đều
                </button>
              </div>
              {members.map((m) => (
                <div key={m.userId} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-7 h-7 rounded-full bg-[#008080] flex items-center justify-center text-white text-xs font-bold shrink-0`}>{m.initials}</div>
                    <span className="text-sm text-gray-700 truncate">{m.name}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={splits[m.userId] ?? ""}
                    onChange={(e) => setSplits((p) => ({ ...p, [m.userId]: e.target.value }))}
                    placeholder="0"
                    className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-right outline-none focus:border-emerald-500 transition"
                  />
                </div>
              ))}
            </div>

            {errMsg && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{errMsg}</p>}
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98] transition-all duration-200">
              {submitting ? "Đang thêm…" : "Thêm chi phí"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Milestone Modal ─────────────────────────────────────────────────────

function EditMilestoneModal({
  item,
  planId,
  onClose,
  onUpdate,
}: {
  item: ItineraryItem;
  planId: string;
  onClose: () => void;
  onUpdate: (updated: ItineraryItem) => void;
}) {
  const [date, setDate]       = useState(item.date);
  const [time, setTime]       = useState(item.time);
  const [status, setStatus]   = useState("PENDING");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg]   = useState("");
  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) { setErrMsg("Vui lòng chọn ngày và giờ."); return; }
    setSubmitting(true);
    setErrMsg("");
    try {
      const res = await fetch(`/api/v1/plans/${planId}/itinerary/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: `${date}T${time}:00`, status }),
      });
      const body = await res.json();
      if (body.status === 200) {
        onUpdate({ ...item, date, time });
        onClose();
      } else {
        setErrMsg(body.message ?? "Không thể cập nhật mốc.");
      }
    } catch {
      setErrMsg("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 bg-linear-to-r from-[#008080] to-accent" />
        <div className="px-7 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sửa mốc</h2>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.location}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-gray-500 hover:bg-slate-200 flex items-center justify-center transition-colors">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Ngày</label>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Giờ</label>
                <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="DONE">Hoàn thành</option>
              </select>
            </div>
            {errMsg && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{errMsg}</p>}
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-[#008080] text-white text-sm font-bold hover:bg-[#006060] disabled:opacity-50 active:scale-[0.98] transition-all duration-200">
              {submitting ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Add Milestone Modal ──────────────────────────────────────────────────────

function AddMilestoneModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: ItineraryItem) => void }) {
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent]   = useState("");
  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      id: `local_${Date.now()}`,
      locationId: "",
      date,
      time,
      orderIndex: 9999,
      location,
      content,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 bg-linear-to-r from-[#008080] to-accent" />
        <div className="px-7 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Thêm mốc thời gian</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-gray-500 hover:bg-slate-200 flex items-center justify-center transition-colors">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Ngày</label>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Giờ</label>
                <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Địa điểm</label>
              <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ví dụ: Cầu Vàng Đà Nẵng" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea rows={2} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Mô tả hoạt động, lưu ý…" className={`${inputCls} resize-none`} />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-[#008080] text-white text-sm font-bold hover:bg-[#006060] active:scale-[0.98] transition-all duration-200">
              Thêm mốc
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const router = useRouter();

  const [plan, setPlan]                         = useState<Plan | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [notFound, setNotFound]                 = useState(false);
  const [itinerary, setItinerary]               = useState<ItineraryItem[]>([]);
  const [expenses, setExpenses]                 = useState<ExpenseItem[]>([]);
  const [balances, setBalances]                 = useState<DebtBalance[]>([]);
  const [showModal, setShowModal]               = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePhrase, setDeletePhrase]         = useState("");
  const [deleting, setDeleting]                 = useState(false);
  const [editingItem, setEditingItem]           = useState<ItineraryItem | null>(null);

  useEffect(() => {
    fetch(`/api/v1/plans/${planId}`)
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200) {
          setPlan(body.data);
          setItinerary(body.data.itinerary ?? []);
        } else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    // Load expenses + balances independently
    fetch(`/api/v1/expenses/plan/${planId}`)
      .then((r) => r.json())
      .then((body) => { if (body.status === 200 && Array.isArray(body.data)) setExpenses(body.data.map((e: Record<string, unknown>) => ({
        id: String(e.id ?? ""), planId: String(e.planId ?? planId),
        paidById: String(e.paidById ?? ""), paidByName: String(e.paidByName ?? ""),
        amount: Number(e.amount ?? 0), title: String(e.title ?? ""), category: String(e.category ?? "other"),
        splits: (Array.isArray(e.splits) ? e.splits : []).map((s: Record<string, unknown>) => ({
          userId: String(s.userId ?? ""), userName: String(s.userName ?? ""), amountOwed: Number(s.amountOwed ?? 0),
        })),
      }))); })
      .catch(() => {});

    fetch(`/api/v1/expenses/plan/${planId}/balances`)
      .then((r) => r.json())
      .then((body) => { if (body.status === 200 && Array.isArray(body.data)) setBalances(body.data.map((b: Record<string, unknown>) => ({
        fromUserId: String(b.fromUserId ?? ""), fromUserName: String(b.fromUserName ?? ""),
        toUserId: String(b.toUserId ?? ""),     toUserName: String(b.toUserName ?? ""),
        amount: Number(b.amount ?? 0),          message: String(b.message ?? ""),
      }))); })
      .catch(() => {});
  }, [planId]);

  async function handleDeleteItinerary(id: string) {
    if (!confirm("Xoá mốc này?")) return;
    try {
      const res = await fetch(`/api/v1/plans/${planId}/itinerary/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (body.status === 200) setItinerary((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  }

  async function callReorder(updated: ItineraryItem[]) {
    try {
      await fetch(`/api/v1/plans/${planId}/itinerary/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated.map((item, idx) => ({ itineraryId: Number(item.id), orderIndex: idx }))),
      });
    } catch { /* ignore — local state already updated */ }
  }

  function handleMoveUp(id: string) {
    setItinerary((prev) => {
      const sorted = [...prev].sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = sorted.findIndex((i) => i.id === id);
      if (idx <= 0) return prev;
      [sorted[idx - 1], sorted[idx]] = [sorted[idx], sorted[idx - 1]];
      const updated = sorted.map((item, i) => ({ ...item, orderIndex: i }));
      callReorder(updated);
      return updated;
    });
  }

  function handleMoveDown(id: string) {
    setItinerary((prev) => {
      const sorted = [...prev].sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = sorted.findIndex((i) => i.id === id);
      if (idx === -1 || idx >= sorted.length - 1) return prev;
      [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
      const updated = sorted.map((item, i) => ({ ...item, orderIndex: i }));
      callReorder(updated);
      return updated;
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res  = await fetch(`/api/v1/plans/${planId}`, { method: "DELETE" });
      const body = await res.json();
      if (body.status === 200 || body.status === 204) {
        router.push("/plans");
      }
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeletePhrase(""); }
  }

const cardCls = "bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 flex flex-col gap-4";

  return (
    <main className="flex-1 px-4 py-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        <div className="self-start">
          <AnimatedBackButton />
        </div>

        {loading && (
          <div className="flex flex-col gap-4">
            <div className="h-10 w-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="h-48 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            <div className="h-48 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          </div>
        )}

        {!loading && (notFound || !plan) && (
          <div className="py-24 text-center"><p className="text-gray-500">Không tìm thấy plan này.</p></div>
        )}

        {!loading && plan && (<>
          {/* Plan header */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="h-1.5 bg-linear-to-r from-[#008080] to-accent" />
            <div className="p-7 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.712Z" clipRule="evenodd" />
                  </svg>
                  Xoá plan
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#008080]"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.31-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.387 1.445-.99 2.274-1.813C15.302 15.125 17 12.745 17 9A7 7 0 103 9c0 3.745 1.698 6.125 3.352 7.536.83.823 1.654 1.426 2.274 1.813.311.193.571.337.757.433a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
                  {plan.destination}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#008080]"><path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" /></svg>
                  {formatDateLong(plan.startDate)} → {formatDateLong(plan.endDate)}
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-[#008080]">
                  {daysBetween(plan.startDate, plan.endDate)} ngày
                </div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Thành viên <span className="text-sm font-normal text-gray-400">({plan.members.length})</span></h2>
              <button
                onClick={() => setShowMemberModal(true)}
                className="text-xs font-semibold text-[#008080] border border-[#008080]/30 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                + Mời thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {plan.members.map((m, i) => (
                <div key={m.userId} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                  <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold`}>{m.initials}</div>
                  <span className="text-sm font-medium text-gray-700">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Lịch trình <span className="ml-1 text-sm font-normal text-gray-400">({itinerary.length} mốc)</span></h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowModal(true)} className="text-xs font-semibold text-[#008080] border border-[#008080]/30 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">+ Thêm mốc</button>
                <span title="Tính năng đang được phát triển" className="relative group">
                  <button
                    disabled
                    className="text-xs font-semibold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-xl cursor-not-allowed"
                  >
                    Gợi ý bằng AI ✨
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-gray-800 px-2.5 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    Sắp ra mắt
                  </span>
                </span>
              </div>
            </div>
            <Timeline
              items={itinerary}
              onEdit={(item) => setEditingItem(item)}
              onDelete={handleDeleteItinerary}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </div>

          {/* Expenses */}
          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Chi phí nhóm</h2>
              <button onClick={() => setShowExpenseModal(true)} className="text-xs font-semibold text-emerald-600 border border-emerald-500/30 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors">+ Thêm chi phí</button>
            </div>

            <SharedExpenses items={expenses} balances={balances} />
          </div>
        </>)}
      </div>

      {showModal && (
        <AddMilestoneModal
          onClose={() => setShowModal(false)}
          onAdd={(item) => setItinerary((prev) => [...prev, { ...item, orderIndex: prev.length }])}
        />
      )}
      {showExpenseModal && plan && (
        <AddExpenseModal
          planId={planId}
          members={plan.members}
          onClose={() => setShowExpenseModal(false)}
          onAdd={(expense) => {
            setExpenses((prev) => [...prev, expense]);
            // Refresh balances after adding
            fetch(`/api/v1/expenses/plan/${planId}/balances`)
              .then((r) => r.json())
              .then((body) => { if (body.status === 200 && Array.isArray(body.data)) setBalances(body.data.map((b: Record<string, unknown>) => ({
                fromUserId: String(b.fromUserId ?? ""), fromUserName: String(b.fromUserName ?? ""),
                toUserId: String(b.toUserId ?? ""),     toUserName: String(b.toUserName ?? ""),
                amount: Number(b.amount ?? 0),          message: String(b.message ?? ""),
              }))); })
              .catch(() => {});
          }}
        />
      )}
      {editingItem && (
        <EditMilestoneModal
          item={editingItem}
          planId={planId}
          onClose={() => setEditingItem(null)}
          onUpdate={(updated) => {
            setItinerary((prev) => prev.map((i) => i.id === updated.id ? updated : i));
            setEditingItem(null);
          }}
        />
      )}
      {showMemberModal && plan && (
        <AddMemberModal
          planId={planId}
          onClose={() => setShowMemberModal(false)}
          onAdd={(member) => {
            const alreadyIn = plan.members.some((m) => m.userId === member.userId);
            if (!alreadyIn) setPlan({ ...plan, members: [...plan.members, member] });
          }}
        />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm(false); setDeletePhrase(""); }}>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="h-1 bg-red-400" />
            <div className="px-7 py-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Xoá kế hoạch?</h2>
                <p className="text-sm text-gray-500 mt-1">Hành động này không thể hoàn tác. Toàn bộ lịch trình trong kế hoạch sẽ bị xoá vĩnh viễn.</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  Gõ <span className="font-mono font-bold text-red-500">toi dong y xoa</span> để xác nhận:
                </p>
                <input
                  value={deletePhrase}
                  onChange={(e) => setDeletePhrase(e.target.value)}
                  placeholder="toi dong y xoa"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition font-mono"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePhrase(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-gray-600 hover:bg-slate-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || deletePhrase.trim() !== "toi dong y xoa"}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? "Đang xoá…" : "Xoá"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
