"use client";

import { Banknote } from "lucide-react";

interface PriceEstimateCardProps {
  priceText: string;
}

export default function PriceEstimateCard({ priceText }: PriceEstimateCardProps) {
  return (
    <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Banknote size={14} className="text-gray-400 shrink-0" strokeWidth={2} />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Giá tham khảo
        </span>
      </div>
      <p className="text-xl font-bold text-[#008080] leading-snug break-words">
        {priceText}
      </p>
    </div>
  );
}
