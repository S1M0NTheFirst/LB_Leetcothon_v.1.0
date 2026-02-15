"use server";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(userId: string, data: { name?: string; image?: string }) {
  try {
    const updateExpression: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
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
