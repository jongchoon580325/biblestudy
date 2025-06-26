"use client";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      aria-label="위로가기"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 bg-white/70 dark:bg-gray-900/80 border border-blue-400 shadow-lg rounded-full p-3 hover:bg-blue-500 hover:text-white transition-colors duration-200 flex items-center justify-center group"
      style={{ boxShadow: "0 4px 24px 0 rgba(59,130,246,0.25)" }}
    >
      <ArrowUp className="w-6 h-6 text-blue-500 group-hover:text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
    </button>
  );
} 