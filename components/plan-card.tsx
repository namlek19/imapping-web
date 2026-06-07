import Link from "next/link";
import type { Plan } from "@/app/api/v1/plans/route";

export type PlanVariant = "week" | "month" | "year" | "beyond" | "past";

const VARIANT_STYLES: Record<PlanVariant, {
  stripe:     string;
  titleHover: string;
  badge:      string;
  avatarRing: string;
}> = {
  week:   { stripe: "bg-[#008080]",  titleHover: "group-hover:text-[#008080]",  badge: "bg-teal-50 text-[#008080] border-teal-200",     avatarRing: "ring-white" },
  month:  { stripe: "bg-orange-500", titleHover: "group-hover:text-orange-500", badge: "bg-orange-50 text-orange-600 border-orange-200",  avatarRing: "ring-white" },
  year:   { stripe: "bg-violet-500", titleHover: "group-hover:text-violet-600", badge: "bg-violet-50 text-violet-600 border-violet-200",  avatarRing: "ring-white" },
  beyond: { stripe: "bg-sky-400",    titleHover: "group-hover:text-sky-500",    badge: "bg-sky-50 text-sky-500 border-sky-200",           avatarRing: "ring-white" },
  past:   { stripe: "bg-gray-300",   titleHover: "group-hover:text-gray-500",   badge: "bg-gray-100 text-gray-400 border-gray-200",       avatarRing: "ring-white" },
};

const AVATAR_COLORS = [
  "bg-[#003e3e]", "bg-[#008080]", "bg-[#FF7F50]",
  "bg-amber-500",  "bg-purple-500", "bg-emerald-600",
];

function formatDate(iso: string) {
  const d = /Z|[+-]\d{2}:?\d{2}$/.test(iso) ? new Date(iso) : new Date(iso + "Z");
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
}

interface PlanCardProps {
  plan: Plan;
  variant?: PlanVariant;
}

export default function PlanCard({ plan, variant = "week" }: PlanCardProps) {
  const s = VARIANT_STYLES[variant];
  const MAX_SHOW = 4;
  const shown = plan.members.slice(0, MAX_SHOW);
  const extra = plan.members.length - MAX_SHOW;

  return (
    <Link
      href={`/plans/${plan.planId}`}
      className="group bg-surface rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm shadow-slate-300/40 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-300/50 transition-all duration-300 flex flex-col"
    >
      <div className={`h-1 w-full ${s.stripe}`} />

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-bold text-gray-900 text-base leading-snug ${s.titleHover} transition-colors`}>
            {plan.name}
          </h3>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.badge}`}>
            {plan.members.length} TV
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-gray-400">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.31-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.387 1.445-.99 2.274-1.813C15.302 15.125 17 12.745 17 9A7 7 0 103 9c0 3.745 1.698 6.125 3.352 7.536.83.823 1.654 1.426 2.274 1.813.311.193.571.337.757.433a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{plan.destination}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
            </svg>
            {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {shown.map((m, i) => (
            <div
              key={m.userId}
              title={m.name}
              style={{ zIndex: shown.length - i }}
              className={`relative -ml-1.5 first:ml-0 w-7 h-7 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-[10px] font-bold ring-2 ${s.avatarRing}`}
            >
              {m.initials}
            </div>
          ))}
          {extra > 0 && (
            <div className="relative -ml-1.5 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] font-bold ring-2 ring-white">
              +{extra}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
