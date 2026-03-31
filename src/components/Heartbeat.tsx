"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

export default function Heartbeat() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  useEffect(() => {
    if (!userEmail) return;

    const sendHeartbeat = async () => {
      // Only track time if document is visible
      if (document.visibilityState !== "visible") return;

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        await fetch(`${baseUrl}/api/user/heartbeat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: userEmail,
            interval_ms: HEARTBEAT_INTERVAL_MS,
          }),
        });
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    };

    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    
    // Send immediate heartbeat on mount if visible
    sendHeartbeat();

    return () => clearInterval(interval);
  }, [userEmail]);

  return null;
}
