import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "@/lib/dynamodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        // Check if user exists in DynamoDB
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { email: user.email },
          })
        );

        // If user doesn't exist, create a new record
        if (!Item) {
          await db.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: {
                email: user.email,
                name: user.name,
                image: user.image,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              },
            })
          );
        } else {
          // Optionally update last login
          await db.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: {
                ...Item,
                lastLogin: new Date().toISOString(),
              },
            })
          );
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in callback:", error);
        return false;
      }
    },
  },
});
