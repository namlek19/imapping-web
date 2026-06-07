"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { spaceGrotesk } from "@/components/fonts";
import type { LocationItem } from "@/app/api/v1/locations/data";

const NAV_LINKS = [
  { label: "Địa điểm", href: "/locations",  requireAuth: false },
  { label: "Kế Hoạch", href: "/plans",      requireAuth: true  },
  { label: "Tích điểm", href: "/events",    requireAuth: true  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [query, setQuery] = useState("");
  const [allLocations, setAllLocations] = useState<LocationItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 0
    ? allLocations.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.address.toLowerCase().includes(query.toLowerCase()) ||
        loc.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    fetch("/api/v1/locations?page=0&size=100")
      .then((r) => r.json())
      .then((body) => { if (body.status === 200) setAllLocations(body.data.content); });
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectResult(locationId: string) {
    setSearchOpen(false);
    setQuery("");
    router.push(`/locations/${locationId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setQuery("");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "/";
  }

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="sticky top-0 z-50 px-4 pt-5 pb-2 pointer-events-none">
    <nav className="max-w-6xl mx-auto bg-surface/80 backdrop-blur-lg border border-slate-200/50 rounded-full shadow-sm shadow-slate-200/50 pointer-events-auto">
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="select-none shrink-0">
          <span className={`${spaceGrotesk.className} text-2xl font-bold text-accent tracking-tight`}>
            iMapping
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const href = link.requireAuth && !isLoggedIn ? `/login?redirect=${link.href}` : link.href;
            return (
              <Link
                key={link.href}
                href={href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-primary/70 hover:text-primary hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100/80 border border-slate-200/60 focus-within:border-accent/40 focus-within:bg-white transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 shrink-0">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm địa điểm..."
              className="flex-1 bg-transparent text-sm text-primary placeholder-gray-400 outline-none min-w-0"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            )}
          </div>

          {searchOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/60 overflow-hidden z-50">
              {results.map((loc) => (
                <button
                  key={loc.locationId}
                  onClick={() => handleSelectResult(loc.locationId)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-100 border-b border-slate-100/80 last:border-0"
                >
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent">
                      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{loc.name}</p>
                    <p className="text-xs text-gray-400 truncate">{loc.address} · {loc.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchOpen && query.trim().length > 0 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/60 px-4 py-6 text-center z-50">
              <p className="text-sm text-gray-400">Không tìm thấy địa điểm nào.</p>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="shrink-0">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Tài khoản"
                className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-primary hover:bg-gray-200 transition-colors duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#008080]">
                      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                    </svg>
                    Xem hồ sơ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Zm13.03 4.47-1.28-1.28a.75.75 0 0 0-1.06 1.06l.97.97H8.75a.75.75 0 0 0 0 1.5h5.91l-.97.97a.75.75 0 1 0 1.06 1.06l1.28-1.28a1.75 1.75 0 0 0 0-2.475l.001.001Z" clipRule="evenodd" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-accent text-white text-sm font-bold shadow-sm shadow-accent/30 hover:shadow-md hover:shadow-accent/30 active:scale-95 transition-all duration-200"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
    </div>
  );
}
