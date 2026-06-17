"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const BANNER_URL =
  "https://res.cloudinary.com/dsorisxxs/image/upload/q_auto,f_auto,w_1000/v1781709196/iMapping.png";

export default function BannerPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("banner_seen")) return;
    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("banner_seen", "1");
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-999 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-1000 flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative pointer-events-auto max-w-lg w-full">
              {/* Glow ring */}
              <div className="absolute -inset-0.5 rounded-3xl bg-linear-to-br from-accent/60 via-[#008080]/40 to-accent/60 blur-sm" />

              {/* Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
                <Image
                  src={BANNER_URL}
                  alt="iMapping banner"
                  width={1000}
                  height={616}
                  className="w-full h-auto block"
                  priority
                />

                {/* Bottom bar */}
                <div className="px-5 py-4 flex items-center justify-between bg-white">
                  <p className="text-sm font-semibold text-gray-700">
                    ✨ Khám phá iMapping ngay hôm nay!
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-xs font-bold text-white bg-linear-to-r from-accent to-[#008080] px-4 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all"
                  >
                    Bắt đầu →
                  </button>
                </div>
              </div>

              {/* X button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-800 hover:scale-110 active:scale-95 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
