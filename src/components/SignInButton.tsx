"use client";

import { loginWithAzure } from "@/lib/actions";
import { LogIn } from "lucide-react";

export default function SignInButton() {
  return (
    <button
      onClick={() => loginWithAzure()}
      className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/25"
    >
      <LogIn className="w-5 h-5" />
      Sign in with CSULB
    </button>
  );
}
