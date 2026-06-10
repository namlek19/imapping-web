"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { LocationItem } from "@/app/api/v1/locations/data";
import HeroPhotoStack from "@/components/hero-photo-stack";
import AnimatedBackButton from "@/components/animated-back-button";
import PriceEstimateCard from "@/components/price-estimate-card";
import BookingModal from "@/components/booking-modal";

interface Comment {
  commentId: string;
  userName: string;
  initials: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface LocationDetail extends LocationItem {
  proposedPrice: string | null;
  images: string[];
  matchPercent: number;
  matchReason: string;
  aiComment: string;
  comments: Comment[];
}

const AVATAR_COLORS = [
  "bg-[#008080]", "bg-accent", "bg-violet-500",
  "bg-amber-500",  "bg-emerald-600", "bg-sky-500",
];

const CATEGORY_COLORS: Record<string, string> = {
  "F&B":               "bg-orange-100 text-orange-700",
  "Thể thao":          "bg-blue-100 text-blue-600",
  "Dịch vụ giải trí":  "bg-violet-100 text-violet-700",
  "Dịch vụ lưu trú":  "bg-teal-100 text-teal-700",
  "Khác":              "bg-amber-100 text-amber-700",
};


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
          fill={s <= rating ? "#F59E0B" : "none"}
          stroke={s <= rating ? "none" : "#D1D5DB"}
          strokeWidth={1.5}
          className="w-3.5 h-3.5"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0);
    scrollLeft.current = ref.current?.scrollLeft ?? 0;
    if (ref.current) ref.current.style.cursor = "grabbing";
  }
  function onMouseUp() {
    isDragging.current = false;
    if (ref.current) ref.current.style.cursor = "grab";
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = scrollLeft.current - (x - startX.current);
  }

  return { ref, onMouseDown, onMouseUp, onMouseMove, onMouseLeave: onMouseUp };
}

export default function LocationDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const router = useRouter();
  const [location, setLocation]       = useState<LocationDetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const dragScroll = useDragScroll();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (!locationId) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    fetch(`/api/v1/locations/${locationId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200 && body.data) {
          const detail = body.data;
          // Override tag-based % with AI-based data từ homepage cache
          try {
            const raw = localStorage.getItem("aiMatchCache");
            if (raw) {
              const cached: { locationId: string; matchPercent: number; matchReason: string }[] = JSON.parse(raw);
              const hit = cached.find((m) => String(m.locationId) === String(locationId));
              if (hit && hit.matchPercent > 0) {
                detail.matchPercent = hit.matchPercent;
                detail.matchReason = hit.matchReason;
              }
            }
          } catch { /* ignore parse errors */ }
          setLocation(detail);
        }
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setLoading(false); });

    return () => { clearTimeout(timer); controller.abort(); };
  }, [locationId]);

  if (loading) {
    return (
      <div className="flex-1 px-4">
        <div className="max-w-6xl mx-auto mt-8 h-100 rounded-4xl bg-gray-200 animate-pulse" />
        <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="h-8 w-48 rounded-xl bg-white/60 animate-pulse" />
            <div className="h-4 w-full rounded-lg bg-white/60 animate-pulse" />
            <div className="h-4 w-3/4 rounded-lg bg-white/60 animate-pulse" />
          </div>
          <div className="h-64 rounded-2xl bg-white/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center flex flex-col gap-4">
          <p className="text-gray-500 text-lg">Không tìm thấy địa điểm.</p>
          <button onClick={() => router.back()} className="text-[#008080] font-semibold hover:underline">
            ← Quay lại
          </button>
        </div>
      </main>
    );
  }

  const catCls = CATEGORY_COLORS[location.category] ?? "bg-gray-100 text-gray-600";
  const priceDisplay = location.proposedPrice?.trim() || null;

  return (
    <div className="flex-1 px-4 pb-16">

      {/* Back */}
      <div className="max-w-6xl mx-auto pt-6">
        <AnimatedBackButton />
      </div>

      {/* ── Hero: name + meta ── */}
      <div className="max-w-3xl mx-auto mt-8 text-center flex flex-col items-center gap-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${catCls}`}>
          {location.category}
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          {location.name}
        </h1>
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-gray-400">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.31-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.387 1.445-.99 2.274-1.813C15.302 15.125 17 12.745 17 9A7 7 0 103 9c0 3.745 1.698 6.125 3.352 7.536.83.823 1.654 1.426 2.274 1.813.311.193.571.337.757.433a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
          </svg>
          {location.address}
        </div>
        {isLoggedIn && location.matchPercent > 0 && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200/60 px-4 py-1.5 rounded-full">
            <span className="text-lg font-black text-[#008080] tabular-nums leading-none">{location.matchPercent}%</span>
            <span className="text-xs font-semibold text-teal-700">phù hợp với bạn</span>
          </div>
        )}
      </div>

      {/* ── Photo Stack ── */}
      <HeroPhotoStack
        images={location.images?.length ? location.images : (location.imageUrl ? [location.imageUrl] : [])}
        locationName={location.name}
      />

      {/* ── Two-column layout ── */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Left: main content ── */}
        <div className="md:col-span-2 min-w-0 flex flex-col gap-8">

          {/* Match reason */}
          {isLoggedIn && (
            <div className="bg-teal-50 rounded-2xl border border-teal-200/60 p-6 flex gap-4">
              <span className="text-2xl shrink-0">✨</span>
              <div>
                <p className="text-xs font-bold text-[#008080] uppercase tracking-widest mb-2">
                  AI nói về bạn &amp; nơi này
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">{location.matchReason}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-gray-900">Về địa điểm</h2>
            <p className="text-gray-600 leading-relaxed">{location.description}</p>
          </div>

          {/* Reviews — horizontal scroll */}
          {location.comments.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                Đánh giá
                <span className="ml-2 text-sm font-normal text-gray-400">({location.comments.length})</span>
              </h2>
              <div
                ref={dragScroll.ref}
                onMouseDown={dragScroll.onMouseDown}
                onMouseUp={dragScroll.onMouseUp}
                onMouseMove={dragScroll.onMouseMove}
                onMouseLeave={dragScroll.onMouseLeave}
                className="overflow-x-auto scrollbar-hide pb-3 cursor-grab select-none"
              >
                <div className="flex gap-4 w-max">
                {location.comments.map((c, i) => (
                  <div
                    key={c.commentId}
                    className="w-72 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-md p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                        {c.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{c.userName}</p>
                        <p className="text-xs text-gray-400">
                          {(/Z|[+-]\d{2}:?\d{2}$/.test(c.createdAt) ? new Date(c.createdAt) : new Date(c.createdAt + "Z")).toLocaleDateString("vi-VN", { month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={c.rating} />
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{c.content}</p>
                  </div>
                ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: booking card ── */}
        <div className="md:col-span-1">
          <div className="sticky top-32 bg-white rounded-2xl border border-slate-100 shadow-xl p-6 flex flex-col gap-5">

            {/* Price */}
            {priceDisplay && <PriceEstimateCard priceText={priceDisplay} />}

            {/* CTA */}
            <button
              onClick={() => {
                if (!isLoggedIn) { router.push("/login?redirect=" + encodeURIComponent(`/locations/${locationId}`)); return; }
                setShowBooking(true);
              }}
              className="w-full py-3.5 rounded-full bg-accent text-white font-bold text-sm tracking-wide shadow-md shadow-accent/30 hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            >
              Đặt ngay
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Hotline */}
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Liên hệ hotline:{" "}
              <a href="tel:0902099905" className="font-semibold text-gray-800 hover:text-[#008080] transition-colors">
                0902 099 905
              </a>
              {" "}hoặc{" "}
              <button
                className="font-semibold text-[#008080] hover:underline"
                onClick={() => window.dispatchEvent(new CustomEvent("open-chat", { detail: { mode: "support" } }))}
              >
                chat ngay với chúng tôi
              </button>
            </p>
          </div>
        </div>

      </div>

      {showBooking && location && (
        <BookingModal
          locationId={location.locationId}
          locationName={location.name}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
