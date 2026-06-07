"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function AnimatedBackButton() {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={() => router.back()}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTapStart={() => setHovered(true)}
      onTap={() => setHovered(false)}
      layout
      transition={{ layout: { type: "spring", stiffness: 400, damping: 30 } }}
      className="flex items-center gap-2 h-9 px-2.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50 transition-shadow text-slate-600 hover:text-slate-900 select-none"
      style={{ minWidth: "2.25rem" }}
      aria-label="Quay lại"
    >
      <motion.span
        layout
        className="shrink-0 flex items-center justify-center w-4 h-4"
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
      </motion.span>

      <AnimatePresence>
        {hovered && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0, x: -4 }}
            animate={{ opacity: 1, width: "auto", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden whitespace-nowrap text-sm font-medium pr-1"
          >
            Quay lại
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
