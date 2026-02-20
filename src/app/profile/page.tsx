import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import ProfileEditor from "@/components/ProfileEditor";
import { db, TABLE_NAME } from "@/lib/db";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  let user = session.user;
  let points = 0;
  let isEnrolled = false;

  try {
    const { Item } = await db.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { email: session.user.email },
      })
    );

    if (Item) {
      user = { ...user, name: Item.name, image: Item.image };
      points = Item.points ?? 0;
      isEnrolled = Item.isEnrolled ?? false;
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-16 px-6 selection:bg-amber-500/30">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="bg-zinc-900 border border-amber-500/30 rounded-lg p-8 md:p-12 shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center">
            <ProfileEditor user={user} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-10">
              <div className="p-5 rounded-md bg-zinc-950/50 border border-amber-500/20 text-left">
                <p className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-2">Rank</p>
                <p className="font-semibold text-lg text-zinc-300">Unranked</p>
              </div>
              <div className="p-5 rounded-md bg-zinc-950/50 border border-amber-500/20 text-left">
                <p className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-2">Points</p>
                {isEnrolled ? (
                  <p className="font-semibold text-2xl text-amber-400">{points}</p>
                ) : (
                  <Link href="/enroll" className="font-semibold text-amber-500 hover:text-amber-400 transition-colors animate-pulse hover:animate-none">
                    Enroll to claim 5 free points &gt;
                  </Link>
                )}
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut();
              }}
              className="mt-12 w-full"
            >
              <button className="w-full py-3 bg-zinc-800/50 hover:bg-red-900/50 border border-zinc-700 hover:border-red-700 text-zinc-300 hover:text-red-400 font-bold rounded-md transition-all flex items-center justify-center gap-2 group">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
