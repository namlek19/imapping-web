"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

type ChatMode = "ai" | "support" | null;

interface Message {
  from: "user" | "bot";
  text: string;
}

interface SupportMsg {
  id: number;
  userId: number;
  message: string;
  fromAdmin: boolean;
  createdAt: string;
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-700 shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export default function ChatFab() {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [pathname]);

  // Listen for external open-chat events (e.g. from location detail page)
  useEffect(() => {
    function handler(e: Event) {
      const mode = (e as CustomEvent<{ mode: "ai" | "support" }>).detail?.mode ?? "support";
      openChat(mode);
    }
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (mode) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [mode]);

  // Auto-poll new messages for support mode every 8s
  useEffect(() => {
    if (mode !== "support") return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const poll = () => {
      fetch(`/api/v1/support/messages?userId=${userId}`)
        .then((r) => r.json())
        .then((body) => {
          if (body.status === 200 && Array.isArray(body.data) && body.data.length > 0) {
            const welcome = "Xin chào! Bạn cần giúp gì ạ? 😊 Hãy để lại tin nhắn, nhân viên sẽ phản hồi sớm nhất có thể.";
            const history: Message[] = (body.data as SupportMsg[]).map((m) => ({
              from: m.fromAdmin ? "bot" : "user",
              text: m.message,
            }));
            setMessages([{ from: "bot", text: welcome }, ...history]);
          }
        })
        .catch(() => {});
    };

    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, [mode]);

  async function openChat(m: "ai" | "support") {
    setMode(m);
    setFabOpen(false);

    if (m === "support") {
      const userId = localStorage.getItem("userId");
      const welcome: Message = { from: "bot", text: "Xin chào! Bạn cần giúp gì ạ? 😊 Hãy để lại tin nhắn, nhân viên sẽ phản hồi sớm nhất có thể." };
      if (!userId) { setMessages([welcome]); return; }

      try {
        const res = await fetch(`/api/v1/support/messages?userId=${userId}`);
        const body = await res.json();
        if (body.status === 200 && Array.isArray(body.data) && body.data.length > 0) {
          const history: Message[] = (body.data as SupportMsg[]).map((m) => ({
            from: m.fromAdmin ? "bot" : "user",
            text: m.message,
          }));
          setMessages([welcome, ...history]);
        } else {
          setMessages([welcome]);
        }
      } catch {
        setMessages([welcome]);
      }
    } else {
      setMessages([{ from: "bot", text: "Xin chào! Tôi là trợ lý AI của iMapping 🌏 Bạn muốn khám phá địa điểm nào hôm nay?" }]);
    }
  }

  function closeChat() {
    setMode(null);
    setMessages([]);
    setInput("");
    setSending(false);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setSending(true);

    if (mode === "ai") {
      const userId = localStorage.getItem("userId");
      try {
        const res = await fetch("/api/v1/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, userId }),
        });
        const body = await res.json();
        if (body.status !== 200 || !body.data) {
          const rawMsg = (body.message as string) ?? "";
          const errMsg = rawMsg.toLowerCase().includes("quiz") || rawMsg.toLowerCase().includes("preference")
            ? "Bạn chưa hoàn thành bài trắc nghiệm. Vui lòng làm quiz trước để tôi có thể gợi ý địa điểm phù hợp nhé! 🎯"
            : "AI đang bận xíu, bạn thử lại sau nhé! 🙏";
          setMessages((prev) => [...prev, { from: "bot", text: errMsg }]);
        } else {
          setMessages((prev) => [...prev, { from: "bot", text: body.data }]);
        }
      } catch {
        setMessages((prev) => [...prev, { from: "bot", text: "Không thể kết nối AI lúc này, thử lại sau nhé!" }]);
      }
    } else {
      const userId = localStorage.getItem("userId");
      try {
        const res = await fetch("/api/v1/support/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: Number(userId), message: text, fromAdmin: false }),
        });
        const body = await res.json();
        if (body.status === 200) {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: "Đã nhận tin nhắn! Nhân viên CSKH sẽ phản hồi sớm nhất có thể 🙏" },
          ]);
        } else {
          setMessages((prev) => [...prev, { from: "bot", text: "Không thể gửi tin nhắn, thử lại sau nhé!" }]);
        }
      } catch {
        setMessages((prev) => [...prev, { from: "bot", text: "Không thể kết nối, thử lại sau nhé!" }]);
      }
    }

    setSending(false);
  }

  if (pathname.startsWith("/admin") || !isLoggedIn) return null;

  const gradientHeader =
    mode === "ai"
      ? "bg-gradient-to-r from-[#008080] to-teal-400"
      : "bg-gradient-to-r from-[#FF7F50] to-orange-400";

  return (
    <>
      {/* Backdrop when chat is open */}
      {mode && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={closeChat}
        />
      )}

      {/* Large chat panel — ~2/3 viewport, anchored bottom-right */}
      {mode && (
        <div
          className="fixed bottom-5 right-5 z-50 flex flex-col rounded-3xl shadow-2xl border border-gray-100 bg-white overflow-hidden"
          style={{
            width: "min(66vw, 900px)",
            height: "min(66vh, 780px)",
            minWidth: "340px",
            minHeight: "400px",
            animation: "chatSlideUp 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          {/* Header */}
          <div className={`flex items-center gap-3 px-5 py-4 shrink-0 ${gradientHeader}`}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              {mode === "ai" ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                  <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">
                {mode === "ai" ? "Trợ lý AI iMapping" : "Chat với nhân viên CSKH"}
              </p>
              <p className="text-xs text-white/75 truncate">
                {mode === "ai"
                  ? sending
                    ? "Đang phân tích…"
                    : "Gợi ý địa điểm thông minh · Trả lời tức thì"
                  : "Thường phản hồi trong vài phút làm việc"}
              </p>
            </div>
            {/* Quick mode switch */}
            <button
              onClick={() => openChat(mode === "ai" ? "support" : "ai")}
              className="text-white/80 hover:text-white transition-colors text-xs font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full whitespace-nowrap"
            >
              {mode === "ai" ? "Gọi nhân viên" : "Chat AI"}
            </button>
            <button
              onClick={closeChat}
              className="text-white/70 hover:text-white transition-colors ml-1 p-1"
              aria-label="Đóng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "bot" && (
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${
                      mode === "ai" ? "bg-teal-500" : "bg-orange-400"
                    }`}
                  >
                    {mode === "ai" ? "AI" : "CS"}
                  </div>
                )}
                <div
                  className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.from === "user"
                      ? "bg-accent text-white rounded-br-sm"
                      : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-end gap-2 justify-start">
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${
                    mode === "ai" ? "bg-teal-500" : "bg-orange-400"
                  }`}
                >
                  {mode === "ai" ? "AI" : "CS"}
                </div>
                <TypingDots />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={
                mode === "ai"
                  ? "Hỏi về địa điểm, hoạt động, gợi ý…"
                  : "Nhắn tin cho nhân viên CSKH…"
              }
              disabled={sending}
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition disabled:opacity-40 hover:brightness-110 active:scale-90 ${
                mode === "ai" ? "bg-[#008080]" : "bg-accent"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 translate-x-px">
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Speed-dial — only when chat panel is closed */}
      {!mode && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
          {/* Option: Chat với nhân viên */}
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${
              fabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
            style={{ transitionDelay: fabOpen ? "0ms" : "60ms" }}
          >
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow border border-gray-100 whitespace-nowrap">
              Chat với nhân viên
            </span>
            <button
              onClick={() => openChat("support")}
              className="w-11 h-11 rounded-full bg-accent text-white shadow-lg shadow-orange-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
              </svg>
            </button>
          </div>

          {/* Option: Chat với AI */}
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${
              fabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
            style={{ transitionDelay: fabOpen ? "60ms" : "0ms" }}
          >
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow border border-gray-100 whitespace-nowrap">
              Chat với AI
            </span>
            <button
              onClick={() => openChat("ai")}
              className="w-11 h-11 rounded-full bg-[#008080] text-white shadow-lg shadow-teal-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10 1a6 6 0 0 1 3.872 10.632A3.993 3.993 0 0 1 14 14H6a3.993 3.993 0 0 1 .128-2.368A6 6 0 0 1 10 1ZM8 15h4v.5a2.5 2.5 0 0 1-5 0V15Z" />
              </svg>
            </button>
          </div>

          {/* Main FAB */}
          <button
            onClick={() => setFabOpen((v) => !v)}
            aria-label="Chat"
            className={`w-14 h-14 rounded-full bg-linear-to-br from-accent to-[#008080] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
              fabOpen ? "rotate-45" : "rotate-0"
            }`}
          >
            {fabOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Entrance animation */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(48px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>
  );
}
