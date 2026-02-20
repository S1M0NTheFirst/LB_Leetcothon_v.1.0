"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, Terminal, Loader2, XCircle } from "lucide-react";
import { enrollUser } from "@/app/actions";

type EnrollmentResult = {
  success: boolean;
  message?: string;
  error?: string;
} | null;

export default function EnrollmentPage() {
  const [isPending, startTransition] = useTransition();
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResult>(null);

  const handleEnrollment = () => {
    startTransition(async () => {
      const result = await enrollUser();
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
      <div className="bg-amber-900/20 border border-amber-500/50 p-4 rounded mb-8">
        <p className="text-amber-500 font-mono text-xs flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          SYSTEM REWARD: 5 Points will be credited to your profile upon confirmation.
        </p>
      </div>
      <button
        onClick={handleEnrollment}
        disabled={isPending}
        className="w-full bg-amber-500 text-black font-bold py-4 rounded hover:bg-amber-400 transition-all active:scale-[0.98] font-mono tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
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
        Operative recognized. <span className="text-amber-400">5 Points</span> have been deposited to your ledger.
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

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white selection:bg-amber-500/30">
      <div className="max-w-xl w-full border border-amber-500/30 bg-zinc-900/50 p-8 rounded shadow-[0_0_40px_rgba(245,158,11,0.1)] backdrop-blur-sm relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/50" />

        {!enrollmentResult ? renderInitialState() : enrollmentResult.success ? renderSuccessState() : renderErrorState()}
      </div>
    </main>
  );
}
