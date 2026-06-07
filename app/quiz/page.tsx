"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2, Wind, TrendingUp, MapPin,
  UtensilsCrossed, Camera, Heart, Rocket,
  CheckCircle2, type LucideIcon,
} from "lucide-react";
import { plusJakarta, spaceGrotesk } from "@/components/fonts";

// ─── Static visual config (4 vibe questions) ────────────────────────────────

interface OptionConfig {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
}

interface QuestionConfig {
  question: string;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  dot: string;
  options: [OptionConfig, OptionConfig];
}

const QUESTIONS: QuestionConfig[] = [
  {
    question: "Khi đi chơi, bạn thích ngồi ở một không gian có \"vibe\" như thế nào?",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-300",
    iconBg: "bg-orange-500",
    dot: "bg-orange-500",
    options: [
      { Icon: Music2, title: "Náo nhiệt & xập xình", subtitle: "Nhạc to, đông vui, không khí sôi động" },
      { Icon: Wind,   title: "Yên tĩnh & nhẹ nhàng", subtitle: "Riêng tư, vừa đủ để trò chuyện" },
    ],
  },
  {
    question: "Khẩu vị chọn quán của bạn thường nghiêng về hướng nào?",
    cardBg: "bg-teal-50",
    cardBorder: "border-teal-300",
    iconBg: "bg-teal-500",
    dot: "bg-teal-500",
    options: [
      { Icon: TrendingUp, title: "Hot-trend & dễ tìm", subtitle: "Mặt tiền lớn, thiết kế nổi bật" },
      { Icon: MapPin,     title: "Núp hẻm & độc lạ",  subtitle: "Hơi khó tìm nhưng concept riêng" },
    ],
  },
  {
    question: "Điều gì sẽ giữ chân bạn lại một quán cafe / nhà hàng lâu nhất?",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-300",
    iconBg: "bg-amber-500",
    dot: "bg-amber-500",
    options: [
      { Icon: UtensilsCrossed, title: "Menu chất lượng", subtitle: "Đồ ăn / nước uống thật sự ngon" },
      { Icon: Camera,          title: "Thiết kế có gu",  subtitle: "Góc check-in đẹp, nhạc đúng mood" },
    ],
  },
  {
    question: "Thói quen đi ăn uống / la cà của bạn là gì?",
    cardBg: "bg-violet-50",
    cardBorder: "border-violet-300",
    iconBg: "bg-violet-500",
    dot: "bg-violet-500",
    options: [
      { Icon: Heart,  title: "Quán ruột quen thuộc", subtitle: "Biết chắc là hợp với mình" },
      { Icon: Rocket, title: "Săn địa điểm mới",     subtitle: "Concept lạ, chưa từng thử" },
    ],
  },
];

// ─── Backend shape ────────────────────────────────────────────────────────────

interface BackendOption   { id: number; content: string }
interface BackendQuestion { id: number; content: string; options: BackendOption[] }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter();

  const [backendQs, setBackendQs]     = useState<BackendQuestion[]>([]);

  const [current, setCurrent]         = useState(0);
  const [answers, setAnswers]         = useState<number[]>([]); // selected optionId per question
  const [chosen, setChosen]           = useState<number | null>(null);
  const [phase, setPhase]             = useState<"quiz" | "submitting" | "done" | "error">("quiz");
  const [aiAdvice, setAiAdvice]       = useState("");
  const [submitError, setSubmitError] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch option IDs in the background — UI is hardcoded so quiz shows immediately
  useEffect(() => {
    fetch("/api/v1/quiz")
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200 && Array.isArray(body.data)) {
          setBackendQs(body.data);
        }
      })
      .catch(() => {});
  }, []);

  function getOptionId(qIdx: number, optIdx: number): number {
    return backendQs[qIdx]?.options?.[optIdx]?.id ?? -(qIdx * 2 + optIdx + 1);
  }

  function handleChoose(optionId: number) {
    if (chosen !== null || phase !== "quiz") return;
    setChosen(optionId);

    timerRef.current = setTimeout(() => {
      const next = [...answers.slice(0, current), optionId];
      setAnswers(next);
      setChosen(null);

      if (current < QUESTIONS.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setPhase("submitting");
        doSubmit(next);
      }
    }, 380);
  }

  function handleBack() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setChosen(null);
    setCurrent((c) => c - 1);
  }

  async function doSubmit(optionIds: number[]) {
    try {
      const res = await fetch("/api/v1/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optionIds),
      });
      const body = await res.json();
      if (body.status === 200) {
        setAiAdvice(body.data ?? "");
        setPhase("done");
      } else if (body.status === 500) {
        // Tags đã được lưu, chỉ phần AI bị lỗi → vẫn hiện done
        setAiAdvice("");
        setPhase("done");
      } else {
        setSubmitError(body.message ?? "Lưu thất bại, vui lòng thử lại.");
        setPhase("error");
      }
    } catch {
      setSubmitError("Không thể kết nối tới server.");
      setPhase("error");
    }
  }

  // ── Submitting ─────────────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <main className={`${plusJakarta.className} flex-1 flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-violet-300 border-t-violet-600 animate-spin" />
          <p className="text-sm text-gray-400">Đang lưu kết quả…</p>
        </div>
      </main>
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <main className={`${plusJakarta.className} flex-1 flex items-center justify-center px-4 py-16`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md flex flex-col items-center gap-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-violet-400 to-accent flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className={`${spaceGrotesk.className} text-3xl font-bold text-gray-900`}>
              Đã lưu cá tính!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Hệ thống đã ghi nhận phong cách du lịch của bạn.
            </p>
          </div>

          {aiAdvice && (
            <div className="w-full bg-violet-50 border border-violet-100 rounded-2xl p-5 text-left">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-2">
                ✦ Gợi ý từ AI
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{aiAdvice}</p>
            </div>
          )}

          <button
            onClick={() => router.push("/profile")}
            className="w-full py-3 rounded-2xl bg-accent text-white text-sm font-bold shadow-md shadow-orange-200 hover:bg-[#e86e3f] active:scale-[0.98] transition-all"
          >
            Xem hồ sơ của tôi
          </button>
        </motion.div>
      </main>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <main className={`${plusJakarta.className} flex-1 flex items-center justify-center px-4`}>
        <div className="max-w-sm text-center flex flex-col gap-4">
          <p className="text-sm text-red-500">{submitError}</p>
          <button
            onClick={() => { setPhase("quiz"); setCurrent(0); setAnswers([]); }}
            className="py-2.5 px-6 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-all"
          >
            Thử lại từ đầu
          </button>
        </div>
      </main>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  const q = QUESTIONS[current];

  return (
    <main className={`${plusJakarta.className} flex-1 flex flex-col items-center justify-center px-4 py-10`}>
      <div className="w-full max-w-lg flex flex-col gap-8">

        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`hdr-${current}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-violet-500 mb-2">
              ✦ Trắc nghiệm cá tính
            </p>
            <h1 className={`${spaceGrotesk.className} text-xl font-bold text-gray-900 leading-snug`}>
              {q.question}
            </h1>
            <p className="mt-2 text-xs text-gray-400">
              Câu {current + 1} / {QUESTIONS.length} — chạm để chọn
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2">
          {QUESTIONS.map((qc, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? `w-6 h-2 ${qc.dot}`
                  : i < current
                  ? `w-2 h-2 ${qc.dot} opacity-50`
                  : "w-2 h-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Binary choice cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cards-${current}`}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -48 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="grid grid-cols-2 gap-4"
          >
            {q.options.map((opt, i) => {
              const { Icon, title, subtitle } = opt;
              const optId  = getOptionId(current, i);
              const active = chosen === optId || answers[current] === optId;

              return (
                <motion.button
                  key={i}
                  onClick={() => handleChoose(optId)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  animate={chosen === optId ? { scale: [1, 1.06, 1.02] } : { scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`relative flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-colors duration-200 cursor-pointer text-center shadow-sm ${
                    active
                      ? `${q.cardBg} ${q.cardBorder} shadow-none`
                      : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  {/* Icon container */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      active ? q.iconBg : "bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 transition-colors duration-200 ${
                        active ? "text-white" : "text-gray-400"
                      }`}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm font-bold leading-tight ${active ? "text-gray-900" : "text-gray-600"}`}>
                      {title}
                    </span>
                    <span className="text-xs text-gray-400 leading-snug">{subtitle}</span>
                  </div>

                  {/* Checkmark badge */}
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                      className={`absolute top-3 right-3 w-5 h-5 rounded-full ${q.iconBg} flex items-center justify-center`}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Back button */}
        {current > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleBack}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2"
            >
              ← Câu trước
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
