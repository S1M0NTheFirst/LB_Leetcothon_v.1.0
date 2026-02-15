"use client";

import { useSession } from "next-auth/react";
import { loginWithAzure } from "@/lib/actions";
import Logo from "./Logo";
import { User, Terminal, Coins, BarChart2, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "The Arena", href: "/arena", icon: Terminal },
    { name: "Prediction Pool", href: "/pool", icon: Coins },
    { name: "Live Intel", href: "/leaderboard", icon: BarChart2 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer shrink-0">
          <Logo className="w-8 h-8" />
          <span className="font-bold tracking-tight hidden lg:block">LB_Leetcodethonv1.0</span>
        </Link>

        {/* Center: Navigation Menu */}
        <div className="hidden md:flex items-center gap-1 lg:gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group hover:bg-white/5 ${
                  isActive ? "text-yellow-500" : "text-gray-400 hover:text-white"
                }`}
              >
                <link.icon className={`w-4 h-4 transition-all duration-300 ${
                  isActive ? "text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "group-hover:text-yellow-500"
                }`} />
                <span className="relative">
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-yellow-500 shadow-[0_0_10px_#eab308]" />
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right: User Menu */}
        <div className="relative">
          {status === "loading" ? (
            <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:border-yellow-500 transition-all group active:scale-95"
              >
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-full h-full bg-yellow-500/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-yellow-500" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] group-hover:shadow-[inset_0_0_0_2px_#eab308] transition-all" />
              </Link>
            </div>
          ) : (
            <button
              onClick={() => loginWithAzure()}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-white/90 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
