"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { loginWithAzure } from "@/lib/actions";
import { updateProfile } from "@/app/actions";
import Logo from "./Logo";
import { User, LogOut, Settings, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.email) return;

    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const image = formData.get("image") as string;

    const result = await updateProfile(session.user.email, { name, image });
    if (result.success) {
      setIsModalOpen(false);
    }
    setIsUpdating(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
          <Logo className="w-8 h-8" />
          <span className="font-bold tracking-tight hidden sm:block">LB_Leetcodethonv1.0</span>
        </div>

        {/* Right: User Menu */}
        <div className="relative">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors"
              >
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl p-2 z-20"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{session.user?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </button>
                      
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Edit Profile</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Username</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={session?.user?.name || ""}
                    placeholder="Your display name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Avatar URL</label>
                  <input
                    name="image"
                    type="url"
                    defaultValue={session?.user?.image || ""}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  disabled={isUpdating}
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl mt-4 transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
