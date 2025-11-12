import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        backendAccessToken?: string
        backendUser?: {
            id: number
            email: string
            first_name: string
            last_name: string
            avatar: string | null
            is_google_login: boolean
            created_at: string
            updated_at: string
        }
    }

    interface User {
        backendAccessToken?: string
        backendUser?: {
            id: number
            email: string
            first_name: string
            last_name: string
            avatar: string | null
            is_google_login: boolean
            created_at: string
            updated_at: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendAccessToken?: string
        backendUser?: {
            id: number
            email: string
            first_name: string
            last_name: string
            avatar: string | null
            is_google_login: boolean
            created_at: string
            updated_at: string
        }
    }
}