"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, Terminal, Loader2, XCircle } from "lucide-react";
import { enrollUser } from "@/app/actions";
import clsx from "clsx";

type EnrollmentResult = {
  success: boolean;
  message?: string;
  error?: string;
} | null;

type Level = "beginner" | "experienced";

export function EnrollmentForm() {
  const [isPending, startTransition] = useTransition();
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResult>(null);
  const [level, setLevel] = useState<Level | null>(null);

  const handleEnrollment = () => {
    if (!level) return;
    startTransition(async () => {
      const result = await enrollUser(level);
      setEnrollmentResult(result);
    });
  };

  const renderInitialState = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-amber-500" />
        <h1 className="text-amber-500 font-mono text-xl uppercase tracking-wider">
          SECURITY CLEARANCE REQUIRED // ENROLLMENT
        </h1>
      </div>
      <p className="text-zinc-400 mb-8 font-mono leading-relaxed text-sm">
        By proceeding, you commit to the LB Leetcothon protocols. You will be held accountable for the 7-Day Sprint. Cowardice is not an option.
      </p>

      <div className="mb-8">
        <p className="text-zinc-400 font-mono mb-4">SELECT YOUR PROTOCOL PATH:</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div
            onClick={() => setLevel("beginner")}
            className={clsx(
              "border p-4 rounded cursor-pointer transition-all",
              level === "beginner"
                ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                : "border-amber-900/50 hover:bg-zinc-800"
            )}
          >
            <p className="font-bold text-lg text-amber-500">NOVICE</p>
            <p className="text-sm text-zinc-400">Standard algorithms. Guided learning.</p>
          </div>
          <div
            onClick={() => setLevel("experienced")}
            className={clsx(
              "border p-4 rounded cursor-pointer transition-all",
              level === "experienced"
                ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                : "border-amber-900/50 hover:bg-zinc-800"
            )}
          >
            <p className="font-bold text-lg text-amber-500">VETERAN</p>
            <p className="text-sm text-zinc-400">Advanced gauntlet. No hand-holding.</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/50 p-4 rounded mb-8">
        <p className="text-amber-500 font-mono text-xs flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          SYSTEM REWARD: 5 Points will be credited to your profile upon confirmation.
        </p>
      </div>
      <button
        onClick={handleEnrollment}
        disabled={isPending || !level}
        className="w-full bg-amber-500 text-black font-bold py-4 rounded hover:bg-amber-400 transition-all active:scale-[0.98] font-mono tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> PROCESSING...</> : 'CONFIRM_ENROLLMENT'}
      </button>
    </>
  );

  const renderSuccessState = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle2 className="w-6 h-6 text-amber-500" />
        <h2 className="text-amber-500 font-mono text-xl uppercase tracking-wider">
          UPLINK ESTABLISHED // SUCCESS
        </h2>
      </div>
      <p className="text-zinc-300 mb-8 font-mono leading-relaxed">
        Operative recognized. <span className="text-amber-400">5 Points</span> have been deposited to your ledger. Your chosen path is <span className="text-amber-400">{level}</span>.
      </p>
      <Link
        href="/arena"
        className="block w-full text-center border border-amber-500 text-amber-500 py-4 rounded hover:bg-amber-500 hover:text-black transition-all font-bold font-mono tracking-widest"
      >
        ENTER THE ARENA &gt;
      </Link>
    </div>
  );
  
  const renderErrorState = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <XCircle className="w-6 h-6 text-red-500" />
        <h2 className="text-red-500 font-mono text-xl uppercase tracking-wider">
          ENROLLMENT FAILED
        </h2>
      </div>
      <p className="text-zinc-300 mb-8 font-mono leading-relaxed">
        There was an error processing your enrollment: <span className="text-red-400">{enrollmentResult?.error}</span>
      </p>
      <Link
        href="/profile"
        className="block w-full text-center border border-zinc-500 text-zinc-300 py-4 rounded hover:bg-zinc-700 hover:text-white transition-all font-bold font-mono tracking-widest"
      >
        RETURN TO PROFILE
      </Link>
    </div>
  )

  return !enrollmentResult ? renderInitialState() : enrollmentResult.success ? renderSuccessState() : renderErrorState();
}
