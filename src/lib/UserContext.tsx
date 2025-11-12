import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react"
import axios from "axios"
import { getAccessToken, isAuthenticated } from "@/lib/CookieUtils"
import { useSession } from "next-auth/react"

interface ProfileSettings {
    id: number
    email: string
    first_name: string
    last_name: string
    avatar: string
    savings_percentage: number
}

interface UserContextValue {
    profile: ProfileSettings | null
    loading: boolean
    error: string | null
    refreshProfile: () => Promise<void>
    setProfile: (p: ProfileSettings | null) => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

let inFlightFetch: Promise<void> | null = null

export function UserProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<ProfileSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { data: session, status: sessionStatus } = useSession()

    const fetchProfile = useCallback(async () => {
        if (inFlightFetch) return inFlightFetch

        const p = (inFlightFetch = (async () => {
            setLoading(true)
            setError(null)
            try {
                const token = getAccessToken()

                if (!token) {
                    setProfile(null)
                    setLoading(false)
                    return
                }

                const resp = await axios.get<ProfileSettings>(`${API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setProfile(resp.data)
            } catch (err: any) {
                setError(
                    err?.response?.data?.detail || err?.message || "เกิดข้อผิดพลาดในการโหลดโปรไฟล์",
                )
                setProfile(null)
            } finally {
                setLoading(false)
                inFlightFetch = null
            }
        })())
        return p
    }, [])

    const refreshProfile = useCallback(async () => {
        await fetchProfile()
    }, [fetchProfile])

    useEffect(() => {
        if (isAuthenticated()) {
            void fetchProfile()
            return
        }
    }, [fetchProfile])

    useEffect(() => {
        if (sessionStatus === "authenticated") {
            void fetchProfile()
        } else if (sessionStatus === "unauthenticated") {
            setProfile(null)
            setLoading(false)
        }
    }, [sessionStatus, fetchProfile])

    return (
        <UserContext.Provider
            value={{ profile, loading, error, refreshProfile, setProfile }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const ctx = useContext(UserContext)
    if (!ctx) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return ctx
}
