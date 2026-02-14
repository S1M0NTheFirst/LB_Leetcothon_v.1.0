"use server";

import { signIn } from "@/auth";

export async function loginWithAzure() {
  await signIn("microsoft-entra-id");
}
