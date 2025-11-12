import { getCookie, setCookie, removeCookie } from "typescript-cookie"

const COOKIE_OPTIONS = {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/"
}

export interface BackendUser {
    id: number
    email: string
    first_name: string
    last_name: string
    avatar: string | null
    is_google_login: boolean
    created_at: string
    updated_at: string
}

// ===== Access Token =====
export const saveAccessToken = (token: string) => {
    if (typeof window === "undefined") return
    setCookie("accessToken", token, COOKIE_OPTIONS)
}

export const getAccessToken = (): string | undefined => {
    if (typeof window === "undefined") return undefined
    return getCookie("accessToken")
}

export const removeAccessToken = () => {
    if (typeof window === "undefined") return
    removeCookie("accessToken")
}

// ===== User Data =====
export const saveUserData = (user: BackendUser) => {
    if (typeof window === "undefined") return
    setCookie("userData", JSON.stringify(user), COOKIE_OPTIONS)
}

export const getUserData = (): BackendUser | null => {
    if (typeof window === "undefined") return null
    try {
        const userDataStr = getCookie("userData")
        return userDataStr ? JSON.parse(userDataStr) : null
    } catch (error) {
        console.error("Error parsing user data from cookie:", error)
        return null
    }
}

export const removeUserData = () => {
    if (typeof window === "undefined") return
    removeCookie("userData")
}

// ===== Clear All =====
export const clearAuthCookies = () => {
    if (typeof window === "undefined") return
    removeAccessToken()
    removeUserData()
}

// ===== Check Auth =====
export const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") return false
    return !!getAccessToken()
}
