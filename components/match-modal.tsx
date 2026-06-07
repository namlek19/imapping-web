import Link from "next/link";
import type { MatchedLocation } from "@/components/member-view";

interface MatchModalProps {
  matches: MatchedLocation[];
  onClose: () => void;
}

const RANK_STYLES = [
  "border-[#D4AF37] bg-amber-50 text-amber-600",
  "border-slate-400 bg-slate-100 text-slate-500",
  "border-[#B87333] bg-orange-50 text-[#B87333]",
  "border-[#008080] bg-[#E0F7FA] text-[#008080]",
] as const;

export default function MatchModal({ matches, onClose }: MatchModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-7 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Top 5 địa điểm dành cho bạn
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Sắp xếp theo độ phù hợp giảm dần</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <ol className="overflow-y-auto divide-y divide-gray-100">
          {matches.slice(0, 5).map((loc, idx) => (
            <li key={loc.locationId}>
              <Link
                href={`/locations/${loc.locationId}`}
                onClick={onClose}
                className="flex gap-4 px-7 py-5 hover:bg-[#E0F7FA] active:bg-[#c8f0f5] transition-colors duration-150"
              >
                <span
                  className={`shrink-0 mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                    RANK_STYLES[Math.min(idx, RANK_STYLES.length - 1)]
                  }`}
                >
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-bold text-gray-900 truncate">
                      {loc.name}
                    </span>
                    <span className="shrink-0 text-sm font-black text-accent">
                      {loc.matchPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {loc.matchReason}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div className="shrink-0 px-7 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-accent text-white text-sm font-bold hover:bg-[#e86e3f] active:scale-[0.98] transition-all duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
