"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { spaceGrotesk } from "@/components/fonts";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  async function handleGoogleSuccess(credentialResponse: any) {
    const idToken = credentialResponse.credential;
    if (!idToken) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const body = await res.json();

      if (body.status !== 200) {
        setError(body.message ?? "Đăng nhập bằng Google thất bại.");
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Đăng nhập bằng Google thất bại.");
            }}
            text="signin_with"
            width="280px"
          />
        </div>

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
