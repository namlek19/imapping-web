"use client";

import { useState } from "react";
import Link from "next/link";
import MatchModal from "@/components/match-modal";
import type { MatchedLocation } from "@/components/member-view";

interface GuestHeroProps {
  isLoggedIn?: boolean;
  matches?: MatchedLocation[];
}

export default function GuestHero({ isLoggedIn = false, matches = [] }: GuestHeroProps) {
  const [showModal, setShowModal] = useState(false);
  const top = matches[0];
  const showSuggestion = isLoggedIn && !!top;

  return (
    <main className="flex-1 flex flex-col relative">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col justify-center px-6 py-20">
        <div className={`relative z-10 max-w-6xl mx-auto w-full ${showSuggestion ? "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" : "flex flex-col items-center text-center"}`}>

          {/* Left: hero text */}
          <div className={`flex flex-col gap-7 ${showSuggestion ? "items-start text-left" : "items-center text-center"}`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 border border-[#008080]/20 text-[#008080] text-xs font-semibold tracking-widest uppercase backdrop-blur-sm">
              ✦ Cá nhân hoá bởi AI
            </span>

            <h1 className="flex flex-col gap-1">
              <span className="text-6xl sm:text-8xl font-black tracking-tight text-[#FF7F50] leading-none">
                iMapping
              </span>
              <span className="text-5xl sm:text-6xl font-bold leading-tight text-gray-900">
                Hành trình nào{" "}
                <span className="bg-linear-to-r from-[#008080] to-[#FF7F50] bg-clip-text text-transparent">
                  kể về bạn
                </span>
                ?
              </span>
            </h1>

            <p className="text-lg text-gray-500 max-w-md leading-relaxed">
              Khám phá những địa điểm được chọn lọc riêng cho tính cách và cảm xúc của
              bạn — không phải đám đông, chỉ là{" "}
              <em className="text-gray-700 not-italic font-medium">bạn</em>.
            </p>

            <Link
              href={isLoggedIn ? "/locations" : "/login"}
              className="mt-2 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-white text-base font-bold tracking-wide shadow-sm shadow-accent/30 hover:shadow-md hover:shadow-accent/30 active:scale-95 transition-all duration-200"
            >
              Bắt đầu hành trình
            </Link>
          </div>

          {/* Right: AI suggestion card (logged-in only) */}
          {showSuggestion && (
            <div className="relative bg-surface rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm shadow-slate-300/40">
              <Link href={`/locations/${top.locationId}`} className="block">
                <div className="h-1.5 w-full bg-linear-to-r from-[#008080] to-[#FF7F50]" />
                <div className="p-6 pb-4 flex flex-col gap-4">
                  <span className="text-xs font-semibold text-[#008080] uppercase tracking-widest">
                    ✨ Gợi ý đặc biệt hôm nay
                  </span>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{top.name}</h3>
                    <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-[#FFF3EE] border border-[#FF7F50]/20">
                      <span className="text-xl font-black text-[#FF7F50] leading-none tabular-nums">
                        {top.matchPercent}<span className="text-xs font-bold">%</span>
                      </span>
                      <span className="text-[9px] font-semibold text-[#FF7F50]/70 uppercase tracking-wide mt-0.5">phù hợp</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0 w-1 rounded-full bg-linear-to-b from-[#008080] to-[#FF7F50]" />
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{top.matchReason}</p>
                  </div>
                </div>
              </Link>
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-2.5 rounded-2xl border-2 border-[#008080] text-[#008080] text-sm font-bold hover:bg-[#008080] hover:text-white active:scale-[0.98] transition-all duration-200"
                >
                  Xem thêm các lựa chọn khác
                </button>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* Feature strip */}
      <section className="relative py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: "🧭",
              color: "bg-teal-100/80 border-teal-200",
              iconBg: "bg-teal-100",
              title: "Gợi ý cá nhân hoá",
              desc: "AI đọc vị tính cách, đề xuất đúng nơi bạn cần.",
            },
            {
              icon: "🤝",
              color: "bg-orange-100/80 border-orange-200",
              iconBg: "bg-orange-100",
              title: "Lên kế hoạch nhóm",
              desc: "Mời bạn bè, phân chia chi phí minh bạch tức thì.",
            },
            {
              icon: "🛎️",
              color: "bg-violet-100/80 border-violet-200",
              iconBg: "bg-violet-100",
              title: "Trải nghiệm full service",
              desc: "CSKH sẽ trực tiếp order thay bạn — chỉ cần thư giãn!",
            },
          ].map((f) => (
            <div key={f.title} className={`flex flex-col gap-4 rounded-3xl border border-slate-200/50 shadow-sm shadow-slate-300/40 p-6 ${f.color}`}>
              <div className={`w-11 h-11 rounded-2xl ${f.iconBg} flex items-center justify-center text-2xl`}>
                {f.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="font-bold text-gray-900">{f.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal && <MatchModal matches={matches} onClose={() => setShowModal(false)} />}
    </main>
  );
}
