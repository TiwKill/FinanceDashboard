import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { signIn } from "next-auth/react";

interface LoginPageProps {
    onLogin: () => void;
}

const FinanceIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10 text-white"
        {...props}
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M8 8h4M8 16h6" />
        <path d="M16 4v2M16 18v2" />
    </svg>
)

export function LoginPage({ onLogin }: LoginPageProps) {
    const handleGoogleLogin = async () => {
        try {
            const result = await signIn('google', {
                callbackUrl: '/',
                redirect: true
            });
            
            if (result?.ok) {
                onLogin();
            }
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <Card className="w-full max-w-md border border-gray-200 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FinanceIllustration />
                    </div>
                    <h1 className="text-black mb-2">ยินดีต้อนรับ</h1>
                    <p className="text-gray-500">
                        เข้าสู่ระบบเพื่อจัดการรายรับรายจ่ายของคุณ
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full h-12 border-gray-200 hover:bg-gray-50 text-black"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        เข้าสู่ระบบด้วย Google
                    </Button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                        การเข้าสู่ระบบแสดงว่าคุณยินยอมตาม
                        <br />
                        <a href="#" className="text-black hover:underline">
                            ข้อกำหนดการให้บริการ
                        </a>{" "}
                        และ{" "}
                        <a href="#" className="text-black hover:underline">
                            นโยบายความเป็นส่วนตัว
                        </a>
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                        💡 คลิกปุ่ม Google เพื่อเข้าสู่ระบบ
                    </p>
                </div>
            </Card>
        </div>
    );
}