import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Logowanie",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "demo@kebe.pl" &&
          credentials?.password === "123456"
        ) {
          return {
            id: "1",
            name: "Kebe User",
            email: "demo@kebe.pl",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/logowanie",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
