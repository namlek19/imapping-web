"use client";

import { useState, useEffect } from "react";
import { plusJakarta, spaceGrotesk } from "@/components/fonts";

interface PersonalityTag {
  emoji: string;
  label: string;
}

interface BookingItem {
  id: number;
  locationId: number;
  locationName: string;
  bookingDate: string;
  numberOfPeople: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  note: string;
  createdAt: string;
}

interface ProfileData {
  userId: string;
  name: string;
  email: string;
  dob: string;
  phone?: string;
  userCode: string;
  avatarUrl: string | null;
  personality: {
    tags: PersonalityTag[];
    analysis: string;
    selfNote: string;
  };
}

function asUTC(iso: string) {
  if (!iso) return new Date(NaN);
  return new Date(/Z|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + "Z");
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "Chưa cập nhật";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const TAG_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-green-100 text-green-700",
  "bg-sky-100 text-sky-700",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [selfNote, setSelfNote] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  useEffect(() => {
    fetch("/api/v1/users/profile")
      .then((r) => r.json())
      .then((body) => {
        if (body.status === 200) {
          setProfile(body.data);
          setSelfNote(body.data.personality.selfNote ?? "");
        } else {
          setError(body.message ?? "Không thể tải profile.");
        }
      })
      .catch(() => setError("Không thể kết nối đến máy chủ."))
      .finally(() => setLoading(false));

    fetch("/api/v1/bookings")
      .then((r) => r.json())
      .then((body) => { if (body.status === 200 && Array.isArray(body.data)) setBookings(body.data); })
      .catch(() => {});
  }, []);

  async function saveNote() {
    setSavingNote(true);
    setFetchingProfile(true);
    try {
      const resPatch = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfNote }),
      });
      const bodyPatch = await resPatch.json();
      
      if (bodyPatch.status === 200) {
        // Refetch profile data to load the new AI analysis
        const resProfile = await fetch("/api/v1/users/profile");
        const bodyProfile = await resProfile.json();
        if (bodyProfile.status === 200) {
          setProfile(bodyProfile.data);
          setSelfNote(bodyProfile.data.personality.selfNote ?? "");
        }
      }
      setEditingNote(false);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch (e) {
      console.error("Error saving note or fetching profile:", e);
    } finally {
      setSavingNote(false);
      setFetchingProfile(false);
    }
  }


  function copyCode() {
    if (!profile) return;
    navigator.clipboard.writeText(profile.userCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#FF7F50] animate-spin" />
          <p className="text-sm">Đang tải hồ sơ…</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex-1 flex items-center justify-center py-32">
        <p className="text-sm text-red-500">{error || "Không tìm thấy dữ liệu."}</p>
      </main>
    );
  }

  return (
    <main className={`${plusJakarta.className} flex-1 px-4 py-12`}>
      <div className="max-w-5xl mx-auto">

        {/* Page title */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#008080] mb-1">
            ✦ Hồ sơ cá nhân
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">
            Của tôi
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">

          {/* ── Cột trái ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FF7F50] to-[#008080] flex items-center justify-center shadow-lg">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className={`${spaceGrotesk.className} text-3xl font-bold text-white`}>
                      {getInitials(profile.name)}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
              </div>

              {/* Tên */}
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{profile.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Thành viên iMapping</p>
              </div>

              {/* Thông tin chi tiết */}
              <div className="w-full flex flex-col gap-3 pt-3 border-t border-gray-100">
                <InfoRow icon="✉️" label="Email" value={profile.email} />
                <InfoRow icon="🎂" label="Ngày sinh" value={formatDate(profile.dob)} />
                {profile.phone && (
                  <InfoRow icon="📱" label="Điện thoại" value={profile.phone} />
                )}
              </div>
            </div>

            {/* Mã người dùng */}
            <div className="bg-orange-50 rounded-3xl shadow-sm border border-dashed border-orange-200 p-6 flex flex-col gap-3">
              <p className="text-xs font-bold tracking-widest uppercase text-orange-400">
                Mã của tôi
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className={`${spaceGrotesk.className} text-4xl font-black tracking-widest text-[#FF6B6B]`}>
                  {profile.userCode}
                </span>
                <button
                  onClick={copyCode}
                  title="Sao chép mã"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    copied
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-white border-orange-200 text-orange-500 hover:bg-orange-100"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      Đã copy!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M10.986 3H12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1.014A1 1 0 0 1 6 2h4a1 1 0 0 1 .986 1ZM6 3.25a.25.25 0 0 0 .25.25h3.5a.25.25 0 0 0 .25-.25V3a.25.25 0 0 0-.25-.25h-3.5A.25.25 0 0 0 6 3v.25Z" clipRule="evenodd" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Gửi mã này cho bạn bè để được thêm vào kế hoạch chuyến đi trên iMapping.
              </p>
            </div>
          </div>

          {/* ── Cột phải ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Bức tranh cá tính */}
            <div className="bg-white rounded-3xl shadow-sm p-7">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">🎨</span>
                <h2 className="text-base font-black text-gray-900 tracking-tight">
                  Bức tranh cá tính
                </h2>
                <a
                  href="/quiz"
                  className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 4.75a.75.75 0 0 1 .75.75v2.69l1.03 1.03a.75.75 0 1 1-1.06 1.06l-1.25-1.25a.75.75 0 0 1-.22-.53V5.5A.75.75 0 0 1 8 4.75Z" clipRule="evenodd" />
                  </svg>
                  Đổi câu trả lời
                </a>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                {profile.personality.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold ${
                      TAG_COLORS[i % TAG_COLORS.length]
                    }`}
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>

              {/* Tự cá nhân hóa */}
              <div className="border-t border-gray-100 pt-5 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
                      ✍️ Ghi chú của tôi
                    </p>
                  </div>
                  {!editingNote && (
                    <button
                      onClick={() => setEditingNote(true)}
                      className="text-[11px] font-semibold text-[#008080] hover:underline transition-colors"
                    >
                      {selfNote ? "Chỉnh sửa" : "Thêm ghi chú"}
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                  Viết bất cứ điều gì bạn thích — sở thích, phong cách du lịch, điều muốn tránh…
                  <span className="text-[#008080] font-medium"> AI sẽ đọc phần này để cá nhân hóa gợi ý cho bạn.</span>
                </p>

                {editingNote ? (
                  <div className="flex flex-col gap-2.5">
                    <textarea
                      value={selfNote}
                      onChange={(e) => setSelfNote(e.target.value)}
                      rows={4}
                      placeholder="Vd: Tôi thích đi biển vào buổi sáng sớm, không thích chỗ đông người, hay bị say xe nên ưu tiên điểm gần, thích ăn đồ địa phương hơn nhà hàng sang..."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none resize-none leading-relaxed transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditingNote(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={saveNote}
                        disabled={savingNote}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#008080] text-white hover:bg-teal-700 disabled:opacity-50 transition-all"
                      >
                        {savingNote ? "Đang lưu…" : "Lưu lại"}
                      </button>
                    </div>
                  </div>
                ) : selfNote ? (
                  <div className="relative group">
                    <p className="text-sm text-gray-600 leading-relaxed bg-teal-50/60 border border-teal-100 rounded-2xl px-4 py-3">
                      {selfNote}
                    </p>
                    {noteSaved && (
                      <span className="absolute -top-2 right-3 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        ✓ Đã lưu
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingNote(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-gray-200 text-gray-300 text-sm cursor-pointer hover:border-[#008080]/40 hover:text-gray-400 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                      <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474ZM4.75 7.5A.75.75 0 0 0 4 8.25v.5h-.5a.75.75 0 0 0-.75.75v.5h-.5A.75.75 0 0 0 1.5 10.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .53-.22l4.23-4.23-.53-.53-3.23 3.23Z" />
                    </svg>
                    Nhấn để thêm ghi chú cá nhân…
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-5 relative">
                <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3">
                  Phân tích cá tính sâu từ AI
                </p>
                {fetchingProfile ? (
                  <div className="py-4 flex flex-col gap-2.5 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded-md w-full" />
                    <div className="h-4 bg-gray-100 rounded-md w-11/12" />
                    <div className="h-4 bg-gray-100 rounded-md w-4/5" />
                    <div className="h-4 bg-gray-100 rounded-md w-5/6" />
                  </div>
                ) : (
                  <p className="text-sm font-light text-gray-600 leading-8 tracking-wide">
                    {profile.personality.analysis || "Chưa có phân tích từ AI. Hãy điền ghi chú hoặc làm trắc nghiệm để AI phân tích nhé!"}
                  </p>
                )}
              </div>
            </div>

            {/* Lịch sử đặt chỗ */}
            <div className="bg-white rounded-3xl shadow-sm p-7">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🏷️</span>
                <h2 className="text-base font-black text-gray-900 tracking-tight">Đơn đặt chỗ</h2>
                <span className="ml-auto text-xs text-gray-400 font-medium">{bookings.length} đơn</span>
              </div>
              {bookings.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
                  <p className="text-sm text-gray-400">Bạn chưa có đơn đặt chỗ nào.</p>
                </div>
              ) : (
                <BookingTimeline bookings={bookings} />
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

const BOOKING_STATUS = {
  PENDING:   { label: "Chờ duyệt",   dot: "border-amber-400",   fill: "bg-amber-400",   badge: "bg-amber-50 text-amber-600" },
  ACCEPTED:  { label: "Xác nhận",    dot: "border-[#008080]",   fill: "bg-[#008080]",   badge: "bg-teal-50 text-[#008080]" },
  REJECTED:  { label: "Từ chối",     dot: "border-red-400",     fill: "bg-red-400",     badge: "bg-red-50 text-red-500" },
  CANCELLED: { label: "Đã huỷ",      dot: "border-slate-300",   fill: "bg-slate-300",   badge: "bg-slate-100 text-slate-400" },
};

function BookingTimeline({ bookings }: { bookings: BookingItem[] }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col">
      {sorted.map((b, idx) => {
        const isLast    = idx === sorted.length - 1;
        const isHovered = hoveredId === b.id;
        const st        = BOOKING_STATUS[b.status];
        const dateStr   = asUTC(b.bookingDate).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

        return (
          <div
            key={b.id}
            className="flex gap-4"
            onMouseEnter={() => setHoveredId(b.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={`mt-3.5 w-3 h-3 rounded-full border-2 shrink-0 transition-all duration-200 ${st.dot} ${isHovered ? `${st.fill} scale-125` : "bg-white"}`} />
              {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-5 min-w-0">
              <div className="flex items-center gap-2 py-2 min-w-0">
                <span className="text-xs font-bold text-[#008080] shrink-0">{dateStr}</span>
                <span className="text-xs text-gray-300">·</span>
                <a
                  href={`/locations/${b.locationId}`}
                  className="text-sm font-semibold text-gray-700 truncate flex-1 hover:text-[#008080] transition-colors"
                >
                  {b.locationName}
                </a>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${st.badge}`}>
                  {st.label}
                </span>
              </div>

              {/* Hover reveal: created at + people + note */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHovered ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-2 flex flex-col gap-1">
                  <p className="text-xs text-gray-400">
                    Đặt lúc <span className="font-medium text-gray-600">{asUTC(b.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" })}</span>
                    {" · "}<span className="font-semibold text-gray-600">{b.numberOfPeople}</span> người
                    {b.note && <> · <span className="italic">"{b.note}"</span></>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-sm mt-0.5">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}</span>
      </div>
    </div>
  );
}
