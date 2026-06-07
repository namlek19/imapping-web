"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, X, CalendarDays, Users, FileText, Phone } from "lucide-react";

interface BookingModalProps {
  locationId: number | string;
  locationName: string;
  onClose: () => void;
}

type Stage = "form" | "loading" | "success" | "error";

export default function BookingModal({ locationId, locationName, onClose }: BookingModalProps) {
  const [stage, setStage]               = useState<Stage>("form");
  const [bookingDate, setBookingDate]   = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [phone, setPhone]               = useState("");
  const [note, setNote]                 = useState("");
  const [errorMsg, setErrorMsg]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStage("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: Number(locationId),
          bookingDate: new Date(bookingDate).toISOString().replace("Z", ""),
          numberOfPeople,
          phoneNumber: phone.trim(),
          note: note.trim() || undefined,
        }),
      });
      const body = await res.json();
      if (body.status === 200) {
        setStage("success");
      } else {
        setErrorMsg(body.message ?? "Đặt chỗ thất bại, vui lòng thử lại.");
        setStage("error");
      }
    } catch {
      setErrorMsg("Không thể kết nối tới server.");
      setStage("error");
    }
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget && stage !== "loading") onClose(); }}
      >
        {/* Modal card */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{ opacity: 0,   scale: 0.92, y: 16  }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Close button — hidden during loading */}
          {stage !== "loading" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* ── Form stage ─────────────────────────────────── */}
          {stage === "form" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-7">
              {/* Header */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#008080] mb-1">
                  ✦ Đặt chỗ
                </p>
                <h2 className="text-xl font-black text-gray-900 leading-snug">
                  {locationName}
                </h2>
                <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                  Thông tin sẽ được gửi về bộ phận CSKH để hỗ trợ bạn nhanh nhất.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Date + time */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Ngày &amp; giờ đặt chỗ
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
                />
              </div>

              {/* Number of people */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Users className="w-3.5 h-3.5" />
                  Số người
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNumberOfPeople((n) => Math.max(1, n - 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold text-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-lg font-bold text-gray-900 tabular-nums">
                    {numberOfPeople}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNumberOfPeople((n) => n + 1)}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold text-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Phone className="w-3.5 h-3.5" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0901 234 567"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
                />
              </div>

              {/* Note */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5" />
                  Ghi chú <span className="font-normal normal-case text-gray-400">(tuỳ chọn)</span>
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Yêu cầu đặc biệt, dị ứng thực phẩm, dịp đặc biệt..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none resize-none leading-relaxed transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-accent text-white text-sm font-bold shadow-md shadow-accent/30 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Xác nhận đặt
                </button>
              </div>
            </form>
          )}

          {/* ── Error stage ────────────────────────────────── */}
          {stage === "error" && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <X className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Đặt chỗ thất bại</p>
                <p className="text-sm text-gray-400 mt-1">{errorMsg}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={() => setStage("form")}
                  className="flex-1 py-2.5 rounded-2xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-all"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* ── Loading stage ──────────────────────────────── */}
          {stage === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
              <Loader2 className="w-10 h-10 text-[#008080] animate-spin" />
              <p className="text-sm font-medium text-gray-400">Đang gửi yêu cầu…</p>
            </div>
          )}

          {/* ── Success stage ──────────────────────────────── */}
          {stage === "success" && (
            <div className="flex flex-col items-center gap-5 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Hoàn tất!</h3>
                <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                  Yêu cầu đặt chỗ của bạn đã được gửi.<br />
                  Đội ngũ CSKH sẽ liên hệ để xác nhận sớm nhất.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-accent text-white text-sm font-bold shadow-md shadow-accent/30 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Đóng
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
