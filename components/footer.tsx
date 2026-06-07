"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { spaceGrotesk } from "@/components/fonts";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto bg-[#f0eee9] py-12">
      <div className="mx-auto max-w-6xl px-8 flex flex-col sm:flex-row sm:justify-between gap-8">

        {/* Cột 1 — Logo & slogan */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="inline-block w-fit">
            <span className={`${spaceGrotesk.className} text-lg font-bold text-[#FF7F50]`}>
              iMapping
            </span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed">
            Hành trình nào kể về bạn?
          </p>
        </div>

        {/* Cột 2 — Liên kết nhanh */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Khám phá
          </p>
          <nav className="flex flex-col gap-1.5">
            <Link href="/locations" className="text-sm text-gray-500 hover:text-[#FF7F50] transition-colors">Địa điểm</Link>
            <Link href="/plans"     className="text-sm text-gray-500 hover:text-[#FF7F50] transition-colors">Lịch trình</Link>
            <Link href="/events"    className="text-sm text-gray-500 hover:text-[#FF7F50] transition-colors">Tích điểm</Link>
          </nav>
        </div>

        {/* Cột 3 — Liên hệ */}
        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Liên hệ
          </p>
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2 sm:flex-row-reverse">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-[#FF7F50] shrink-0">
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <span>ducnamle432@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 sm:flex-row-reverse">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-[#FF7F50] shrink-0">
                <path fillRule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2.5 6a5.5 5.5 0 1 1 7.84 4.99l2.835 2.836a.75.75 0 1 1-1.06 1.06L9.28 11.85A5.5 5.5 0 0 1 2.5 6Z" clipRule="evenodd" />
              </svg>
              <span>Hòa Lạc, Hà Nội</span>
            </div>
            <div className="flex items-center gap-2 sm:flex-row-reverse">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-[#FF7F50] shrink-0">
                <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5V5c0 5.523 4.477 10 10 10h1.5a1.5 1.5 0 0 0 1.5-1.5v-1.148a1.5 1.5 0 0 0-1.175-1.466l-2.257-.513a1.5 1.5 0 0 0-1.57.634l-.225.338a8.545 8.545 0 0 1-4.118-4.118l.338-.225a1.5 1.5 0 0 0 .634-1.57L6.013 3.175A1.5 1.5 0 0 0 4.547 2H3.5Z" clipRule="evenodd" />
              </svg>
              <span>0902 099 905</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200/60 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} iMapping. All rights reserved.
      </div>
    </footer>
  );
}
