import { auth } from "@/auth";
import { db, TABLE_NAME } from "@/lib/db";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Terminal } from "lucide-react";

import { EnrollmentForm } from "./EnrollmentForm";

export default async function EnrollmentPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  let isEnrolled = false;
  try {
    const { Item } = await db.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { email: session.user.email },
      })
    );
    if (Item?.isEnrolled) {
      isEnrolled = true;
    }
  } catch (error) {
    console.error("Failed to fetch user enrollment status:", error);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white selection:bg-amber-500/30">
      <div className="max-w-xl w-full border border-amber-500/30 bg-zinc-900/50 p-8 rounded shadow-[0_0_40px_rgba(245,158,11,0.1)] backdrop-blur-sm relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/50" />

        {isEnrolled ? (
          <div className="animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-6 h-6 text-amber-500" />
              <h1 className="text-amber-500 font-mono text-xl uppercase tracking-wider">
                STATUS // ALREADY ENROLLED
              </h1>
            </div>
            <p className="text-zinc-400 mb-8 font-mono leading-relaxed text-sm">
              Operative, your ledger is already active. You cannot enroll twice.
            </p>
            <Link
              href="/arena"
              className="block w-full text-center border border-amber-500 text-amber-500 py-4 rounded hover:bg-amber-500 hover:text-black transition-all font-bold font-mono tracking-widest"
            >
              RETURN TO ARENA &gt;
            </Link>
          </div>
        ) : (
          <EnrollmentForm />
        )}
      </div>
    </main>
  );
}
