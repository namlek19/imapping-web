"use client";

import { useState } from "react";
import Link from "next/link";
import { spaceGrotesk } from "@/components/fonts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Global format: { status, message, data }
      const body = await res.json();

      if (body.status !== 200) {
        setError(body.message ?? "Email hoặc mật khẩu không đúng.");
        return;
      }

      const rawRole = (body.data.role ?? "user").toLowerCase();
      const role = rawRole.startsWith("role_") ? rawRole.slice(5) : rawRole;
      localStorage.setItem("token", body.data.token);
      localStorage.setItem("userId", String(body.data.userId ?? ""));
      localStorage.setItem("role", role);
      localStorage.setItem("name", body.data.name ?? "");

      if (role === "admin") {
        window.location.href = "/admin";
        return;
      }

      // Check if user has completed the quiz
      try {
        const profileRes = await fetch("/api/v1/users/profile");
        const profileBody = await profileRes.json();
        const tags = profileBody.data?.personality?.tags ?? [];
        window.location.href = tags.length === 0 ? "/quiz" : "/";
      } catch {
        window.location.href = "/";
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-8 py-10 flex flex-col gap-6">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className={`${spaceGrotesk.className} text-2xl font-bold text-[#FF7F50]`}>
              iMapping
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email / Tên đăng nhập
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email hoặc tên đăng nhập"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-[#FF7F50] py-2.5 text-sm font-semibold text-white transition hover:bg-[#e86e3f] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">hoặc</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={() => {/* Google OAuth handler */}}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
        >
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Đăng nhập với Google
        </button>

        <p className="text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-[#FF7F50] hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </main>
  );
}
