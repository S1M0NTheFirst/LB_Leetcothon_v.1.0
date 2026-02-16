"use client";

import { Github, MessageCircle, UserPlus, Zap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-amber-900/20 py-12 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-center gap-8">
        
        {/* Section 1: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400 text-sm font-mono uppercase tracking-widest">
          <Link href="#" className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2">
            <UserPlus size={14} />
            Enroll
          </Link>
          <span className="text-zinc-800">•</span>
          <Link href="https://github.com/S1M0NTheFirst/LB_Leetcothon_v.1.0/tree/main" target="_blank" className="hover:text-amber-400 transition-colors">
            GitHub Repo
          </Link>
          <span className="text-zinc-800">•</span>
          <Link href="https://discord.gg" target="_blank" className="hover:text-amber-400 transition-colors">
            Discord Community
          </Link>
        </div>

        {/* Section 2: Social Icons */}
        <div className="flex items-center gap-6">
          <Link href="https://github.com/S1M0NTheFirst/LB_Leetcothon_v.1.0" target="_blank">
            <Github className="w-6 h-6 text-zinc-500 hover:text-amber-500 hover:scale-110 transition-all cursor-pointer" />
          </Link>
          <Link href="https://discord.gg" target="_blank">
            <MessageCircle className="w-6 h-6 text-zinc-500 hover:text-amber-500 hover:scale-110 transition-all cursor-pointer" />
          </Link>
        </div>

        {/* Section 3: Copyright */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-zinc-700 text-sm font-mono flex items-center gap-2 tracking-tighter uppercase">
            Powered by <span className="text-zinc-500 font-bold">S1M0N</span>
            <Zap size={14} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-[10px] text-zinc-800 font-mono tracking-[0.2em] uppercase">
            © 2026 LB Leetcothon // All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
