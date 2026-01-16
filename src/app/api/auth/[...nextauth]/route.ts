import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { CustomMongoDBAdapter } from "@/lib/custom-mongodb-adapter";
import clientPromise from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: CustomMongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const allowedEmails = [
        "vmcleese@web3audience.io",
        "lchemla@web3audience.io",
        "dragon.steal75@gmail.com",
      ];

      if (profile?.email && allowedEmails.includes(profile?.email)) {
        return true;
      } else {
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to the admin page after login
      // return `${baseUrl}/gas-fee/report`; // Adjust if your admin main page differs
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    async session({ session, token, user }) {
      session.userId = token.sub;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
