"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
// import { useEffect, useState } from "react"; // Removed useState and useEffect

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function Digit({ value }: { value: string }) {
  return (
    <div className="relative w-10 h-16 bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
      {/* Horizontal split line for mechanical look */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/50 z-10" />
      
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="text-4xl font-mono font-bold text-blue-500"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function RegistrationCounter() {
  const { data, error } = useSWR("/api/user-count", fetcher, {
    refreshInterval: 5000,
  });

  const count = data && typeof data.count === "number" ? data.count : 0;
  const digits = count.toString().padStart(3, "0").split("");

  if (error) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">
        Live Registrations
      </p>
      <div className="flex gap-2">
        {digits.map((digit, idx) => (
          <Digit key={`${idx}-${digit}`} value={digit} />
        ))}
      </div>
    </div>
  );
}
