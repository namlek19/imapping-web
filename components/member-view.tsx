"use client";

import { useState } from "react";
import Link from "next/link";
import MatchModal from "@/components/match-modal";

export interface MatchedLocation {
  locationId: string;
  name: string;
  matchPercent: number;
  matchReason: string;
}

interface MemberViewProps {
  matches?: MatchedLocation[];
}

export default function MemberView({ matches = [] }: MemberViewProps) {
  const [showModal, setShowModal] = useState(false);
  const topMatch = matches[0];

  if (!topMatch) {
    return (
      <main className="flex-1 bg-background px-4 py-14">
        <div className="max-w-2xl mx-auto text-center text-gray-400 text-sm">
          Chưa có gợi ý phù hợp nào. Hãy hoàn thiện hồ sơ của bạn để nhận gợi ý!
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background px-4 py-14">
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        {/* Section heading */}
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 border border-[#008080]/20 text-[#008080] text-xs font-semibold tracking-widest uppercase">
            ✦ Chỉ dành riêng cho bạn
          </span>
          <h2 className={"mt-4 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight"}>
            Gợi ý đặc biệt hôm nay
          </h2>
        </div>

        {/* Top match card */}
        <div className="relative bg-linear-to-br from-white via-teal-50/40 to-orange-50/20 rounded-2xl border border-white/60 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,128,128,0.15)]">
          {/* Clickable area → detail page */}
          <Link
            href={`/locations/${topMatch.locationId}`}
            className="block"
          >
            <div className="h-1.5 w-full bg-linear-to-r from-[#008080] to-accent" />

            <div className="p-8 pb-5 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className={"text-2xl font-bold text-gray-900 leading-tight"}>
                  {topMatch.name}
                </h3>
                <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-[#FFF3EE] border border-accent/20">
                  <span className="text-2xl font-black text-accent leading-none">
                    {Math.round(topMatch.matchPercent)}
                    <span className="text-sm font-bold">%</span>
                  </span>
                  <span className="text-[10px] font-semibold text-accent/70 uppercase tracking-wide mt-0.5">
                    phù hợp
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0 w-1 rounded-full bg-linear-to-b from-[#008080] to-accent" />
                <div>
                  <p className="text-xs font-semibold text-[#008080] uppercase tracking-wider mb-1">
                    Tại sao nơi này hợp với bạn
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">{topMatch.matchReason}</p>
                </div>
              </div>
            </div>
          </Link>

          {/* CTA — outside Link to avoid nesting */}
          <div className="px-8 pb-8">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 rounded-2xl border-2 border-[#008080] text-[#008080] text-sm font-bold tracking-wide hover:bg-[#008080] hover:text-white active:scale-[0.98] transition-all duration-200"
            >
              Xem thêm các lựa chọn khác
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <MatchModal matches={matches.slice(0, 5)} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
