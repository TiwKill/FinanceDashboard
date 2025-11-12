"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect, type ReactNode } from "react"
import { setCookie, removeCookie } from "typescript-cookie"
import { UserProvider } from "@/lib/UserContext"

function CookieManager() {
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.backendAccessToken) {

            setCookie("accessToken", session.backendAccessToken, {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/"
            })

        } else if (status === "unauthenticated") {
            removeCookie("accessToken")
        }
    }, [session, status])

    return null
}

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <CookieManager />
            <UserProvider>{children}</UserProvider>
        </SessionProvider>
    )
}