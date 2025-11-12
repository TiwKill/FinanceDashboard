import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import axios from "axios"
import type { NextAuthOptions } from "next-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "openid email profile",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google" && user) {
                try {
                    const nameParts = user.name?.split(" ") || ["", ""]
                    const firstName = nameParts[0] || ""
                    const lastName = nameParts.slice(1).join(" ") || ""

                    const response = await axios.post(
                        `${API_URL}/api/auth/login/google`,
                        {
                            email: user.email,
                            first_name: firstName,
                            last_name: lastName,
                            avatar: user.image || null,
                        },
                        { withCredentials: true }
                    )

                    if (response.data && response.data.access_token) {
                        (user as any).backendAccessToken = response.data.access_token;
                        (user as any).backendUser = response.data.user;
                        return true
                    }
                    return false
                } catch (error) {
                    console.error("Error syncing user with backend:", error)
                    return false
                }
            }
            return true
        },

        async jwt({ token, user }) {
            if (user && (user as any).backendAccessToken) {
                token.backendAccessToken = (user as any).backendAccessToken;
                token.backendUser = (user as any).backendUser;
            }
            return token;
        },

        async session({ session, token }) {
            (session as any).backendAccessToken = token.backendAccessToken;
            (session as any).backendUser = token.backendUser;
            return session;
        },

        async redirect({ url, baseUrl }) {
            try {
                const requested = new URL(url, baseUrl).href
                if (requested.startsWith(baseUrl)) {
                    return `${baseUrl}/`
                }
            } catch (e) {
                // ถ้า url ไม่ parse ได้ ให้ fallback ไป baseUrl/
            }
            return `${baseUrl}/`
        },
    },

    pages: {
        error: "/",
    },
    debug: process.env.NODE_ENV !== "production",
}

const handler = NextAuth(options)

export { handler as GET, handler as POST }
