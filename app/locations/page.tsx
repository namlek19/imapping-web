"use client";

import { useState, useEffect } from "react";
import { plusJakarta } from "@/components/fonts";
import LocationCard from "@/components/location-card";
import type { LocationItem } from "@/app/api/v1/locations/data";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Tất cả",            emoji: "✨", inactive: "bg-surface text-primary/60 shadow-sm",     active: "bg-primary text-white shadow-md" },
  { name: "F&B",               emoji: "🍜", inactive: "bg-orange-100 text-orange-700",            active: "bg-orange-500 text-white shadow-lg shadow-orange-400/40" },
  { name: "Thể thao",          emoji: "🏄", inactive: "bg-blue-100 text-blue-600",                active: "bg-blue-500 text-white shadow-lg shadow-blue-400/40" },
  { name: "Dịch vụ giải trí",  emoji: "🎡", inactive: "bg-violet-100 text-violet-700",           active: "bg-violet-500 text-white shadow-lg shadow-violet-400/40" },
  { name: "Dịch vụ lưu trú",  emoji: "🏨", inactive: "bg-teal-100 text-teal-700",               active: "bg-teal-500 text-white shadow-lg shadow-teal-400/40" },
  { name: "Khác",              emoji: "🗺️", inactive: "bg-amber-100 text-amber-700",             active: "bg-amber-500 text-white shadow-lg shadow-amber-400/40" },
] as const;

const PAGE_SIZE = 6;

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video w-full rounded-4xl bg-white/60" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-3 w-1/3 rounded-full bg-white/60" />
        <div className="h-5 w-2/3 rounded-full bg-white/60" />
        <div className="h-3 w-full rounded-full bg-white/60" />
        <div className="h-3 w-4/5 rounded-full bg-white/60" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  const [items, setItems]            = useState<LocationItem[]>([]);
  const [loading, setLoading]        = useState(true);
  const [activeCategory, setActive]  = useState("Tất cả");
  const [currentPage, setPage]       = useState(0);
  const [totalPages, setTotalPages]  = useState(1);
  const [totalElements, setTotal]    = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(currentPage), size: String(PAGE_SIZE) });
    if (activeCategory !== "Tất cả") params.set("category", activeCategory);

    fetch(`/api/v1/locations?${params}`)
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200) {
          setItems(body.data.content);
          setTotalPages(body.data.totalPages ?? 1);
          setTotal(body.data.totalElements ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, [activeCategory, currentPage]);

  function pickCategory(name: string) {
    setActive(name);
    setPage(0);
  }

  function goTo(p: number) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPage(p);
  }

  return (
    <main className={`${plusJakarta.className} flex-1`}>
      <div className="max-w-7xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="mb-14 flex items-start gap-4">
          <div className="mt-1 w-1 h-12 rounded-full bg-linear-to-b from-accent to-[#008080] shrink-0" />
          <div>
            <h1 className="text-5xl font-black tracking-tighter leading-none">
              Danh sách{" "}
              <span className="bg-linear-to-r from-[#008080] to-accent bg-clip-text text-transparent">địa điểm</span>
            </h1>
            {!loading && (
              <p className="mt-2 text-sm text-gray-400">
                {totalElements} địa điểm{activeCategory !== "Tất cả" ? ` · ${activeCategory}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* 2-column layout */}
        <div className="flex gap-16 items-start">

          {/* Sidebar */}
          <aside className="w-52 shrink-0 sticky top-24 flex flex-col gap-2.5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1 px-1">
              Danh mục
            </p>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => pickCategory(cat.name)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold text-left transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive
                      ? cat.active
                      : `${cat.inactive} hover:brightness-95`
                  }`}
                >
                  <span className="text-base leading-none">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0 flex flex-col gap-14">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="py-32 text-center">
                <p className="text-2xl mb-2">🗺️</p>
                <p className="text-gray-400 text-sm">Chưa có địa điểm nào trong danh mục này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {items.map((loc) => <LocationCard key={loc.locationId} location={loc} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={() => goTo(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="flex items-end gap-6">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`text-sm pb-0.5 transition-all duration-150 ${
                        i === currentPage
                          ? "font-bold text-accent border-b-2 border-accent"
                          : "font-medium text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goTo(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
