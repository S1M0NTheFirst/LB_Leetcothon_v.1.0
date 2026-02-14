import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "@/lib/dynamodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) {
        console.error("Sign-in failed: No email provided by provider");
        return false;
      }

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
          // Update last login
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
        console.error("Error during sign-in callback in DynamoDB:", error);
        return false; 
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
