import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User as UserIcon, ArrowLeft, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import ProfileEditor from "@/components/ProfileEditor";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="bg-[#111] border-2 border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] -z-10" />
          
          <div className="flex flex-col items-center text-center">
            <ProfileEditor user={session.user} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1">Status</p>
                <p className="font-semibold text-lg">Active Participant</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1">Role</p>
                <p className="font-semibold text-lg">Leetcothoner</p>
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut();
              }}
              className="mt-10 w-full"
            >
              <button className="w-full py-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-white/60 hover:text-red-500 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group">
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 text-center">
          <p className="text-sm text-yellow-500/80 font-medium">
            Keep practicing! Your stats will update automatically as you solve challenges.
          </p>
        </div>
      </div>
    </main>
  );
}

