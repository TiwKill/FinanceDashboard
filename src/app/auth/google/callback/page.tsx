"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { setCookie } from "typescript-cookie"
import axios from "axios"
import { BookText } from "lucide-react"

export default function GoogleCallbackPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const processGoogleLogin = async () => {
            if (status === "loading") return

            if (!session?.user) {
                setError("ไม่พบข้อมูลผู้ใช้จาก Google")
                setTimeout(() => router.push("/"), 2000)
                return
            }

            try {
                // เตรียมข้อมูลสำหรับส่งไป backend
                const payload = {
                    avatar: session.user.image || "/avatars/default.jpg",
                    first_name: session.user.name?.split(" ")[0] || "",
                    last_name: session.user.name?.split(" ").slice(1).join(" ") || "",
                    email: session.user.email || "",
                }

                console.log("Sending Google login payload:", payload)

                // เรียก API backend
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/google`, payload)
                console.log("Google login response:", response.data)

                const { access_token, user } = response.data

                if (access_token && user) {
                    // เก็บ token ใน cookie
                    setCookie("accessToken", access_token, {
                        expires: 7,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    })

                    // เก็บข้อมูลผู้ใช้ใน localStorage ชั่วคราว
                    localStorage.setItem("user", JSON.stringify(user))
                    localStorage.setItem("isGoogleLogin", "true")

                    console.log("Google login successful, redirecting to home")

                    // รอสักครู่แล้วค่อย redirect
                    setTimeout(() => {
                        router.push("/")
                    }, 1000)
                } else {
                    throw new Error("ไม่ได้รับ access token จาก server")
                }
            } catch (error: any) {
                console.error("Google login error:", error)
                console.error("Error response:", error.response?.data)
                setError(error.response?.data?.detail || error.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
                setTimeout(() => router.push("/"), 3000)
            } finally {
                setIsProcessing(false)
            }
        }

        processGoogleLogin()
    }, [session, status, router])

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-br from-purple-50 to-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                        <BookText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-700 mb-2">เกิดข้อผิดพลาด</h1>
                    <p className="text-red-600 mb-4">{error}</p>
                    <p className="text-gray-600">กำลังนำคุณกลับไปหน้าเข้าสู่ระบบ...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-purple-50 to-white flex items-center justify-center p-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                    <BookText className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-purple-700 mb-2">กำลังเข้าสู่ระบบ</h1>
                <p className="text-purple-600 mb-4">กำลังประมวลผลข้อมูลจาก Google...</p>
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
    )
}
