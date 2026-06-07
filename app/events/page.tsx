"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Prizes — matches backend rewards: {5, 10, 20, 50, 100} ──────────────────
// Arranged to alternate high/low on the wheel for visual balance
const PRIZES = [
  { label: "5 điểm",   points: 5,   color: "#94A3B8", textColor: "white" },
  { label: "50 điểm",  points: 50,  color: "#FF7F50", textColor: "white" },
  { label: "10 điểm",  points: 10,  color: "#008080", textColor: "white" },
  { label: "100 điểm", points: 100, color: "#059669", textColor: "white" },
  { label: "20 điểm",  points: 20,  color: "#7C3AED", textColor: "white" },
];
const COINS_TO_IDX: Record<number, number> = { 5: 0, 50: 1, 10: 2, 100: 3, 20: 4 };

// ── Vouchers — matches backend V5/V10/V15, costs 50/100/150 ─────────────────
const VOUCHERS = [
  { id: "v1", label: "Voucher giảm 5%",  description: "Áp dụng cho tất cả địa điểm", cost: 50,  icon: "🎟️", voucherType: "V5"  },
  { id: "v2", label: "Voucher giảm 10%", description: "Áp dụng cho tất cả địa điểm", cost: 100, icon: "🏷️", voucherType: "V10" },
  { id: "v3", label: "Voucher giảm 15%", description: "Áp dụng cho tất cả địa điểm", cost: 150, icon: "💎", voucherType: "V15" },
];

const SEG = PRIZES.length;
const CX = 200, CY = 200, R = 178;

// ── SVG wheel helpers ────────────────────────────────────────────────────────

function slicePath(i: number) {
  const deg = 360 / SEG;
  const a1 = ((i * deg) - 90) * (Math.PI / 180);
  const a2 = (((i + 1) * deg) - 90) * (Math.PI / 180);
  const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
  const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
  return `M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`;
}

function sliceTextPos(i: number) {
  const deg = 360 / SEG;
  const mid = ((i * deg) + deg / 2 - 90) * (Math.PI / 180);
  const tr = R * 0.63;
  return { x: CX + tr * Math.cos(mid), y: CY + tr * Math.sin(mid) };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const router = useRouter();
  const now         = new Date();
  const today       = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const year        = now.getFullYear();
  const month       = now.getMonth();
  const currentDay  = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  // ── State ──
  const [points, setPoints]           = useState(0);
  const [streak, setStreak]           = useState(0);
  const [spinsLeft, setSpinsLeft]     = useState(0);
  const [checkedDays, setCheckedDays] = useState<string[]>([]);
  const [loaded, setLoaded]           = useState(false);

  // Spin wheel
  const [rotation, setRotation]   = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize]   = useState<typeof PRIZES[0] | null>(null);
  const [showSpinPopup, setShowSpinPopup] = useState(false);
  const totalRot = useRef(0);

  // Voucher redeem
  const [wonVoucher, setWonVoucher] = useState<{ code: string; label: string; remaining: number } | null>(null);

  // ── Load data ──
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { router.replace("/login?redirect=/events"); return; }

    // Points + streak + remainingSpins from backend
    fetch(`/api/v1/events/points?userId=${userId}`)
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200 && body.data != null) {
          setPoints(body.data.totalCoins ?? 0);
          setStreak(body.data.consecutiveCheckins ?? 0);
          setSpinsLeft(body.data.remainingSpins ?? 0);
        }
      })
      .catch(() => {});

    // Checkin history — try backend endpoint, fall back to localStorage
    fetch("/api/v1/events/checkin/history")
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200 && Array.isArray(body.data)) {
          setCheckedDays(body.data);
          localStorage.setItem("events_checkin_days", JSON.stringify(body.data));
        } else {
          setCheckedDays(JSON.parse(localStorage.getItem("events_checkin_days") ?? "[]"));
        }
      })
      .catch(() => {
        setCheckedDays(JSON.parse(localStorage.getItem("events_checkin_days") ?? "[]"));
      })
      .finally(() => setLoaded(true));
  }, [router]);

  // ── Check-in ──
  const checkedInToday = checkedDays.includes(today);

  async function handleCheckin() {
    if (checkedInToday) return;
    try {
      const res  = await fetch("/api/v1/events/checkin", { method: "POST" });
      const body = await res.json();
      if (body.status === 200) {
        // body.data = total coins (integer)
        const total = typeof body.data === "number" ? body.data : (points + 10);
        setPoints(total);
        setSpinsLeft(1);
        setStreak((s) => s + 1);
        const updated = [...checkedDays, today];
        setCheckedDays(updated);
        localStorage.setItem("events_checkin_days", JSON.stringify(updated));
      }
    } catch {
      // Optimistic local fallback
      const updated = [...checkedDays, today];
      setCheckedDays(updated);
      setPoints((p) => p + 10);
      setSpinsLeft(1);
      setStreak((s) => s + 1);
      localStorage.setItem("events_checkin_days", JSON.stringify(updated));
    }
  }

  // ── Spin ──
  async function handleSpin() {
    if (isSpinning || spinsLeft <= 0) return;
    setIsSpinning(true);

    let idx = 0;
    try {
      const res  = await fetch("/api/v1/events/spin", { method: "POST" });
      const body = await res.json();
      if (body.status === 200 && body.data != null) {
        const coinsWon = body.data.coinsWon ?? 0;
        idx = COINS_TO_IDX[coinsWon] ?? 0;
        setPoints(body.data.totalCoins ?? (points + coinsWon));
      } else {
        idx = Math.floor(Math.random() * PRIZES.length);
        setPoints((p) => p + PRIZES[idx].points);
      }
    } catch {
      idx = Math.floor(Math.random() * PRIZES.length);
      setPoints((p) => p + PRIZES[idx].points);
    }

    setSpinsLeft(0);

    const prize     = PRIZES[idx];
    const segCenter = idx * (360 / SEG) + (360 / SEG) / 2;
    const target    = ((180 - segCenter) % 360 + 360) % 360;
    const cur       = totalRot.current % 360;
    const delta     = ((target - cur) + 360) % 360 || 360;
    const final     = totalRot.current + delta + 5 * 360;

    totalRot.current = final;
    setRotation(final);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);
      setShowSpinPopup(true);
    }, 3600);
  }

  // ── Redeem ──
  async function handleRedeem(cost: number, label: string, voucherType: string) {
    if (points < cost) return;
    if (!confirm(`Đổi "${label}" với ${cost} điểm?`)) return;
    try {
      const res  = await fetch("/api/v1/events/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherType }),
      });
      const body = await res.json();
      if (body.status === 200 && body.data) {
        setPoints(body.data.remainingCoins ?? points - cost);
        setWonVoucher({ code: body.data.voucherCode, label, remaining: body.data.remainingCoins ?? points - cost });
      } else {
        alert(body.message ?? "Đổi điểm thất bại.");
      }
    } catch {
      alert("Không thể kết nối. Vui lòng thử lại.");
    }
  }

  // ── UI ──
  return (
    <main className="flex-1 px-4 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-1 h-12 rounded-full bg-accent shrink-0" />
            <div>
              <h1 className="text-5xl font-black tracking-tighter leading-none text-gray-900">
                Tích điểm <span className="text-accent">săn quà</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">Điểm danh, quay thưởng và đổi voucher mỗi ngày</p>
            </div>
          </div>

          {/* Points + streak bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 shadow-md">
              <span className="text-xl">⭐</span>
              <span className="text-2xl font-black text-gray-900 tabular-nums">{points}</span>
              <span className="text-sm text-gray-500 font-medium">điểm</span>
            </div>
            {streak > 0 && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-50 border border-orange-200 shadow-sm">
                <span className="text-lg">🔥</span>
                <span className="text-base font-black text-orange-600 tabular-nums">{streak}</span>
                <span className="text-sm text-orange-500 font-medium">ngày liên tiếp</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 1. Điểm danh ── */}
        <section className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📅 Điểm danh hàng ngày</h2>
            <p className="text-sm text-gray-500 mt-1">Điểm danh mỗi ngày để nhận 10 điểm + 1 lượt quay</p>
          </div>

          {/* Calendar dot grid */}
          <div className="flex flex-wrap gap-2">
            {loaded && Array.from({ length: daysInMonth }, (_, i) => {
              const day  = i + 1;
              const date = `${monthPrefix}-${String(day).padStart(2, "0")}`;
              const done    = checkedDays.includes(date);
              const isToday = day === currentDay;
              const past    = day < currentDay && !done;
              return (
                <div
                  key={day}
                  title={`Ngày ${day}`}
                  className={[
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    done    ? "bg-[#008080] text-white shadow-md shadow-teal-400/30" : "",
                    isToday && !done ? "ring-2 ring-[#008080] ring-offset-1 bg-teal-50 text-[#008080] animate-pulse" : "",
                    past    ? "bg-gray-200 text-gray-400" : "",
                    !done && !isToday && !past ? "bg-gray-100 text-gray-300" : "",
                  ].join(" ")}
                >
                  {done ? "✓" : day}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleCheckin}
              disabled={checkedInToday}
              className={[
                "px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-200",
                checkedInToday
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#008080] text-white shadow-teal-400/30 hover:bg-[#006666] active:scale-95 animate-bounce",
              ].join(" ")}
            >
              {checkedInToday ? "✓ Đã điểm danh hôm nay" : "🎁 Điểm danh nhận 10 điểm + 1 lượt quay"}
            </button>
          </div>
        </section>

        {/* ── 2. Vòng quay ── */}
        <section className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎰 Vòng quay may mắn</h2>
            <p className="text-sm text-gray-500 mt-1">
              1 lượt quay mỗi ngày sau khi điểm danh
              {spinsLeft > 0 && <span className="ml-2 font-semibold text-[#008080]">(còn {spinsLeft} lượt)</span>}
              {spinsLeft === 0 && checkedInToday && <span className="ml-2 font-semibold text-gray-400">(đã dùng hôm nay)</span>}
              {!checkedInToday && <span className="ml-2 text-orange-500 font-semibold">(điểm danh để nhận lượt)</span>}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <svg
                width={CX * 2}
                height={CY * 2}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 3.6s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
                  display: "block",
                }}
              >
                {PRIZES.map((prize, i) => {
                  const tp = sliceTextPos(i);
                  return (
                    <g key={i}>
                      <path d={slicePath(i)} fill={prize.color} stroke="white" strokeWidth={2} />
                      <text
                        x={tp.x} y={tp.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={prize.textColor}
                        fontSize={13}
                        fontWeight="bold"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
                <circle cx={CX} cy={CY} r={20} fill="white" stroke="#e2e8f0" strokeWidth={3} />
              </svg>
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 z-10"
                style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: "24px solid #1e293b" }}
              />
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning || spinsLeft <= 0}
              className={[
                "px-12 py-3.5 rounded-full font-bold text-sm shadow-lg transition-all duration-200",
                !isSpinning && spinsLeft > 0
                  ? "bg-accent text-white shadow-orange-300/40 hover:bg-[#e86e3f] active:scale-95"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none",
              ].join(" ")}
            >
              {isSpinning ? "Đang quay…" : spinsLeft === 0 ? (checkedInToday ? "✓ Đã quay hôm nay" : "Cần điểm danh trước") : "🎯 Quay ngay"}
            </button>
          </div>
        </section>

        {/* ── 3. Đổi voucher ── */}
        <section className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎁 Đổi điểm lấy voucher</h2>
            <p className="text-sm text-gray-500 mt-1">Dùng điểm tích lũy để nhận ưu đãi hấp dẫn</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 text-center">
            <span className="text-4xl">🚧</span>
            <p className="font-bold text-gray-700">Tính năng đang phát triển</p>
            <p className="text-sm text-gray-400">Kho voucher sẽ sớm được ra mắt, hãy chờ nhé!</p>
          </div>
        </section>

      </div>

      {/* ── Spin result popup ── */}
      {showSpinPopup && wonPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowSpinPopup(false)}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-linear-to-r from-[#008080] to-accent" />
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <span className="text-6xl">🎉</span>
              <h3 className="text-2xl font-black text-gray-900">Chúc mừng!</h3>
              <p className="text-gray-600 text-base">
                Bạn vừa nhận được{" "}
                <span className="font-black text-accent text-xl tabular-nums">{wonPrize.points} điểm</span>
              </p>
              <button
                onClick={() => setShowSpinPopup(false)}
                className="w-full py-3 rounded-2xl bg-[#008080] text-white font-bold hover:bg-[#006666] active:scale-[0.98] transition-all"
              >
                Tuyệt vời!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Voucher code popup ── */}
      {wonVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setWonVoucher(null)}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-linear-to-r from-accent to-amber-400" />
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <span className="text-6xl">🎟️</span>
              <h3 className="text-2xl font-black text-gray-900">Đổi thành công!</h3>
              <p className="text-sm text-gray-500">{wonVoucher.label}</p>
              <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-4 py-4 flex flex-col gap-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Mã voucher</p>
                <p className="text-xl font-black text-gray-900 tracking-widest font-mono">{wonVoucher.code}</p>
                <p className="text-xs text-gray-400 mt-1">Lưu mã này để sử dụng khi đặt dịch vụ</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <span>Điểm còn lại:</span>
                <span className="font-bold text-gray-800">{wonVoucher.remaining} điểm</span>
              </div>
              <button
                onClick={() => setWonVoucher(null)}
                className="w-full py-3 rounded-2xl bg-accent text-white font-bold hover:bg-[#e86e3f] active:scale-[0.98] transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
