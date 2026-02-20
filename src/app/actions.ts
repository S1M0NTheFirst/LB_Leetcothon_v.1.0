"use server";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function enrollUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { email: session.user.email },
        UpdateExpression: "SET points = :p, isEnrolled = :e, enrolledAt = :d",
        ExpressionAttributeValues: {
          ":p": 5,
          ":e": true,
          ":d": new Date().toISOString(),
        },
      })
    );

    revalidatePath("/profile");
    revalidatePath("/leaderboard");
    return { success: true, message: "Enrollment successful" };
  } catch (error) {
    console.error("Error in enrollUser:", error);
    return { success: false, error: "Failed to enroll user." };
  }
}

export async function updateProfile(userId: string, data: { name?: string; image?: string }) {
  try {
    const updateExpression: string[] = [];
    const expressionAttributeValues: Record<string, string> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (data.name) {
      updateExpression.push("#n = :name");
      expressionAttributeValues[":name"] = data.name;
      expressionAttributeNames["#n"] = "name";
    }

    if (data.image) {
      updateExpression.push("#i = :image");
      expressionAttributeValues[":image"] = data.image;
      expressionAttributeNames["#i"] = "image";
    }

    if (updateExpression.length === 0) return { success: true };

    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { email: userId },
        UpdateExpression: `SET ${updateExpression.join(", ")}, lastUpdated = :now`,
        ExpressionAttributeValues: {
          ...expressionAttributeValues,
          ":now": new Date().toISOString(),
        },
        ExpressionAttributeNames: expressionAttributeNames,
      })
    );

    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
