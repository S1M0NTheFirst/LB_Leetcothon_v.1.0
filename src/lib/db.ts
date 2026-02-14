import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const db = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Users";

export async function getUserCount() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      Select: "COUNT",
    });

    const response = await db.send(command);
    return response.Count || 0;
  } catch (error) {
    console.error("Error fetching user count:", error);
    return 0;
  }
}
