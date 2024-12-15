import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth"
import { prismaClient } from "@/app/lib/db";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    async signIn(params) {
      if (!params?.user?.email) {
        return false;
      }
      try {
        // Try to find an existing user first
        const existingUser = await prismaClient.user.findUnique({
          where: { email: params.user.email }
        });

        // If user doesn't exist, create a new one
        if (!existingUser) {
          await prismaClient.user.create({
            data: {
              email: params.user.email,
              provider: "Google"
            }
          });
        }
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
      return true;
    }
  }
})

export { handler as GET, handler as POST }