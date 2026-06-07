"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const total = images.length;

  // Close on backdrop click, not on image click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Keyboard navigation
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") onNext();
    else if (e.key === "ArrowLeft") onPrev();
    else if (e.key === "Escape") onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md"
        onClick={handleBackdrop}
        onKeyDown={handleKey}
        tabIndex={0}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Counter */}
        {total > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {index + 1} / {total}
          </div>
        )}

        {/* Prev */}
        {total > 1 && (
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Image */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Use a regular img tag so aspect ratio is preserved naturally */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={`Ảnh ${index + 1}`}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            draggable={false}
          />
        </motion.div>

        {/* Next */}
        {total > 1 && (
          <button
            onClick={onNext}
            disabled={index === total - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Thumbnail strip — only if 3+ images */}
        {total >= 3 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); }}
                className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                  i === index ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-90"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Polaroid card rotations ───────────────────────────────────────────────────

const STACK_ROTATIONS = [-6, 3, -1, 5];

const SPREAD_OFFSETS = [
  { x: -180, y: 12,  rotate: -18 },
  { x: -60,  y: -8,  rotate: -4  },
  { x: 60,   y: -8,  rotate: 4   },
  { x: 180,  y: 12,  rotate: 18  },
];

// ── Main component ────────────────────────────────────────────────────────────

interface HeroPhotoStackProps {
  images?: string[];
  locationName?: string;
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
];

export default function HeroPhotoStack({
  images = PLACEHOLDER_IMAGES,
  locationName = "Địa điểm",
}: HeroPhotoStackProps) {
  const [hovered, setHovered] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Cap at 4 photos for the stack display
  const stackImgs = images.slice(0, 4);
  const total = stackImgs.length;

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevLightbox = useCallback(
    () => setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : 0)),
    []
  );
  const nextLightbox = useCallback(
    () => setLightboxIndex((i) => (i !== null ? Math.min(images.length - 1, i + 1) : 0)),
    [images.length]
  );

  if (total === 0) return null;

  // Single image: show plain card, no stack UI
  if (total === 1) {
    return (
      <div className="flex justify-center my-10">
        <div
          className="relative w-72 cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <div className="bg-white p-3 pb-10 rounded-xl shadow-xl shadow-slate-300/50 rotate-0 transition-transform duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <Image src={stackImgs[0]} alt={locationName} fill className="object-cover" />
            </div>
          </div>
          {lightboxIndex !== null && (
            <Lightbox
              images={images}
              index={lightboxIndex}
              onClose={closeLightbox}
              onPrev={prevLightbox}
              onNext={nextLightbox}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 my-10">
      {/* Stack container */}
      <div
        className="relative flex items-center justify-center cursor-pointer select-none"
        style={{ width: 288, height: 280 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => openLightbox(0)}
      >
        {stackImgs.map((src, i) => {
          const isTop = i === total - 1;
          const spread = SPREAD_OFFSETS[i] ?? SPREAD_OFFSETS[0];
          const stackRot = STACK_ROTATIONS[i] ?? 0;

          return (
            <motion.div
              key={src}
              className="absolute"
              style={{ zIndex: i + 1 }}
              animate={
                hovered
                  ? { x: spread.x * (total <= 2 ? 0.5 : 1), y: spread.y, rotate: spread.rotate, scale: isTop ? 1.04 : 0.97 }
                  : { x: 0, y: 0, rotate: stackRot, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.03 }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Polaroid frame */}
              <div className="bg-white p-3 pb-9 rounded-xl shadow-xl shadow-slate-400/30 w-56">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={src}
                    alt={`${locationName} ảnh ${i + 1}`}
                    fill
                    className="object-cover"
                    priority={isTop}
                    sizes="224px"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Hover hint */}
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: hovered ? 0 : 1, y: hovered ? 4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path d="M13.407 6.25a5.002 5.002 0 0 0-9.397 1.75H2.75a.75.75 0 0 0 0 1.5h1.26a5.002 5.002 0 0 0 9.397 1.75h1.343a.75.75 0 0 0 0-1.5H14.5a4.99 4.99 0 0 0-.518-1.96.75.75 0 0 0 0-.032c-.017-.1-.039-.198-.067-.295a.75.75 0 0 0-.001-.028 5.046 5.046 0 0 0-.507-.885Z" />
            </svg>
            Di chuột vào để xem {total} ảnh
          </span>
        </motion.div>
      </div>

      {/* Thumbnail row (shows all images) */}
      {images.length > 1 && (
        <div className="flex gap-2.5 flex-wrap justify-center mt-6">
          {images.map((src, i) => (
            <motion.button
              key={src + i}
              onClick={() => openLightbox(i)}
              className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-transparent hover:border-[#008080] transition-all"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              title={`Xem ảnh ${i + 1}`}
            >
              <Image src={src} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="64px" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </div>
  );
}
