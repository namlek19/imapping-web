"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PlanCard, { type PlanVariant } from "@/components/plan-card";
import type { Plan } from "@/app/api/v1/plans/route";

// ─── grouping helpers ─────────────────────────────────────────────────────────

function getWeekBounds(now: Date) {
  const d = new Date(now);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  const start = new Date(d);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

type Group = "week" | "month" | "year" | "beyond" | "past";

function getGroup(plan: Plan, now: Date): Group {
  const start  = new Date(plan.startDate);
  const end    = new Date(plan.endDate);
  if (end < now) return "past";
  const { start: ws, end: we } = getWeekBounds(now);
  if (start >= ws && start <= we) return "week";
  if (start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth()) return "month";
  if (start.getFullYear() === now.getFullYear()) return "year";
  return "beyond";
}

// Per-group visual config
const GROUP_CONFIG: Record<Group, {
  heading: string;
  badge: string;
  wrapperCls: string;
  variant: PlanVariant;
}> = {
  week:   { heading: "text-[#008080]",   badge: "bg-teal-50 text-[#008080] border-teal-200",       wrapperCls: "",             variant: "week"   },
  month:  { heading: "text-orange-500",  badge: "bg-orange-50 text-orange-500 border-orange-200",  wrapperCls: "",             variant: "month"  },
  year:   { heading: "text-violet-500",  badge: "bg-violet-50 text-violet-500 border-violet-200",  wrapperCls: "",             variant: "year"   },
  beyond: { heading: "text-sky-400",     badge: "bg-sky-50 text-sky-400 border-sky-200",           wrapperCls: "",             variant: "beyond" },
  past:   { heading: "text-gray-400",    badge: "bg-gray-100 text-gray-400 border-gray-200",       wrapperCls: "opacity-70",   variant: "past"   },
};

// ─── Add Plan Modal ───────────────────────────────────────────────────────────

interface AddPlanModalProps {
  onClose: () => void;
  onAdd: (plan: Plan) => void;
}

function AddPlanModal({ onClose, onAdd }: AddPlanModalProps) {
  const [name, setName]             = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (endDate < startDate) { setError("Ngày kết thúc phải sau ngày bắt đầu."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, destination, startDate, endDate }),
      });
      const body = await res.json();
      if (body.status === 200) { onAdd(body.data); onClose(); }
      else setError(body.message ?? "Có lỗi xảy ra.");
    } catch { setError("Không thể kết nối máy chủ."); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 bg-linear-to-r from-[#008080] to-accent" />
        <div className="px-7 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Tạo plan mới</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Tên chuyến đi</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Hè Đà Nẵng 2026" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Điểm đến</label>
              <input required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ví dụ: Đà Nẵng" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-[#e86e3f] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200"
            >
              {loading ? "Đang tạo…" : "Tạo plan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySection({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 px-6 py-8 text-center">
      <p className="text-sm text-gray-400">{label} chưa có plan nào.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<Group, string> = {
  week:   "Tuần này",
  month:  "Tháng này",
  year:   "Năm nay",
  beyond: "Xa hơn",
  past:   "Đã từng đi",
};
const SECTION_ORDER: Group[] = ["week", "month", "year", "beyond", "past"];

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans]       = useState<Plan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const now = new Date();

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/login?redirect=/plans"); return; }
    fetch("/api/v1/plans")
      .then((r) => r.json())
      .then((body) => { if (body.status === 200) setPlans(body.data); })
      .finally(() => setLoading(false));
  }, [router]);

  const grouped = SECTION_ORDER.reduce<Record<Group, Plan[]>>(
    (acc, g) => { acc[g] = []; return acc; },
    {} as Record<Group, Plan[]>
  );
  plans.forEach((p) => grouped[getGroup(p, now)].push(p));

  return (
    <main className="flex-1 px-4 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-1 h-12 rounded-full bg-accent shrink-0" />
            <div>
              <h1 className="text-5xl font-black tracking-tighter leading-none text-gray-900">
                Kế hoạch <span className="text-accent">của bạn</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">Lên lịch, mời bạn bè và chia sẻ chi phí</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold shadow-md shadow-accent/25 hover:bg-[#e86e3f] active:scale-95 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Thêm plan
          </button>
        </div>

        {/* Sections */}
        {loading ? (
          <div className="flex flex-col gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="h-5 w-24 bg-white/60 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2].map((j) => <div key={j} className="h-40 bg-white/60 rounded-2xl animate-pulse" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {SECTION_ORDER.map((group) => {
              const cfg = GROUP_CONFIG[group];
              const isPast = group === "past";
              return (
                <section key={group}>
                  {/* Section divider for "past" */}
                  {isPast && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Ký ức</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <h2 className={`text-xl font-bold ${cfg.heading}`}>
                      {SECTION_LABELS[group]}
                    </h2>
                    {grouped[group].length > 0 && (
                      <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {grouped[group].length}
                      </span>
                    )}
                  </div>

                  {grouped[group].length === 0 ? (
                    <EmptySection label={SECTION_LABELS[group]} />
                  ) : (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${cfg.wrapperCls}`}>
                      {grouped[group].map((p) => <PlanCard key={p.planId} plan={p} variant={cfg.variant} />)}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <AddPlanModal
          onClose={() => setShowModal(false)}
          onAdd={(plan) => setPlans((prev) => [plan, ...prev])}
        />
      )}
    </main>
  );
}
