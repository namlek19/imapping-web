"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { spaceGrotesk } from "@/components/fonts";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, dob, phone: phone || undefined, password }),
      });

      const body = await res.json();

      if (body.status !== 200) {
        setError(body.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
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
          <p className="mt-2 text-sm text-gray-500">Tạo tài khoản mới</p>
        </div>

        {success ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="rounded-xl bg-green-50 px-4 py-4 text-sm text-green-700">
              Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.
            </div>
            <Link
              href="/login"
              className="w-full rounded-xl bg-[#FF7F50] py-2.5 text-sm font-semibold text-white text-center transition hover:bg-[#e86e3f]"
            >
              Đến trang đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="dob" className="text-sm font-medium text-gray-700">
                Ngày sinh
              </label>
              <input
                id="dob"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <span className="text-xs text-gray-400">(không bắt buộc)</span>
              </div>
              <input
                id="phone"
                type="text"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
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
                  autoComplete="new-password"
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              {loading ? "Đang đăng ký…" : "Đăng ký"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-[#FF7F50] hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
