import { NextResponse } from "next/server";
import { getUserCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getUserCount();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}
