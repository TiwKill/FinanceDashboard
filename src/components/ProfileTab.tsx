"use client";

import { useEffect, useState } from "react";
import { useSession } from 'next-auth/react'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
    Camera,
    Trash2,
    LogOut,
    Check,
    Loader2,
    AlertCircle,
    RefreshCw,
    CreditCard
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { useProfile } from "@/hooks/useProfile";
import { useChat } from "@/hooks/useChat";
import { type UserProfile } from "@/hooks/useProfile";

interface ProfileTabProps {
    onLogout: () => void;
}

const PRESET_AVATARS = [
    "/avatars/01.png",
    "/avatars/02.png",
    "/avatars/03.png",
    "/avatars/04.png",
    "/avatars/05.png",
    "/avatars/06.png",
    "/avatars/07.png",
    "/avatars/08.png",
];

function useCooldown(initial = 0) {
    const [value, setValue] = useState(initial);

    useEffect(() => {
        if (value <= 0) return;
        const timer = setInterval(() => setValue((v) => Math.max(0, v - 1)), 1000);
        return () => clearInterval(timer);
    }, [value]);

    return { value, start: (sec: number) => setValue(sec) };
}

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <p className="mt-4">กำลังโหลดข้อมูล...</p>
    </div>
);

const ErrorState = ({ error, onRetry, onLogout }: { error: string, onRetry: () => void, onLogout: () => void }) => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-red-600">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Button onClick={onRetry} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                ลองอีกครั้ง
            </Button>
            <Button
                onClick={onLogout}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
            </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
            หากปัญหาไม่หายไป<br />กรุณาลองล็อกอินใหม่
        </p>
    </div>
);

const FinanceIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-9 h-9 opacity-80 text-white"
        {...props}
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M8 8h4M8 16h6" />
        <path d="M16 4v2M16 18v2" />
    </svg>
)

const CreditCardSheet = ({ user }: { user: UserProfile | null }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const cardHolderName = user
        ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim().toUpperCase()
        : 'USER NAME';

    const cardLastTwo = (() => {
        const raw = user ? String(user.id ?? '99') : '99'
        const digits = raw.replace(/\D/g, '') || '99'
        if (digits.length === 1) return digits.padStart(2, '0')
        return digits.slice(-2)
    })()

    return (
        <>
            {/* CSS สำหรับการ Flip */}
            <style>{`
                .flip-card { background-color: transparent; width: 320px; height: 200px; perspective: 1000px; color: white; margin: 0 auto; }
                .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.8s; transform-style: preserve-3d; }
                .flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }
                .flip-card-front, .flip-card-back { box-shadow: 0 8px 14px 0 rgba(0,0,0,0.2); position: absolute; display: flex; flex-direction: column; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 1rem; background-color: #171717; }
                .flip-card-back { transform: rotateY(180deg); }
            `}</style>

            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-black"
                    >
                        <CreditCard className="w-4 h-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-white rounded-t-2xl">
                    <SheetHeader>
                        <SheetTitle className="text-black">บัตรชำระเงิน</SheetTitle>
                        <SheetDescription>
                            บัตรสำหรับการชำระเงิน (คลิกที่บัตรเพื่อพลิก)
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 flex justify-center items-center">
                        {/* บัตรเครดิต */}
                        <div
                            className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="flip-card-inner">
                                {/* ด้านหน้าบัตร */}
                                <div className="flip-card-front p-5 flex flex-col justify-between text-left">
                                    <div className="flex justify-between items-start">
                                        <FinanceIllustration />
                                        <p className="font-semibold text-lg tracking-widest opacity-80">SBM</p>
                                    </div>
                                    <div className="text-center text-xl font-mono tracking-widest my-4">
                                        **** **** **** 90{cardLastTwo}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-400">VALID THRU</p>
                                            <p className="text-sm font-medium">** / **</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Mastercard Logo SVG */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 48 48">
                                                <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"></path>
                                                <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"></path>
                                                <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium tracking-wide mt-2">
                                        {cardHolderName}
                                    </div>
                                </div>

                                {/* ด้านหลังบัตร */}
                                <div className="flip-card-back p-5 flex flex-col justify-start">
                                    <div className="w-full h-10 bg-black mt-3"></div>
                                    <div className="flex justify-end items-center mt-4 bg-gray-300 h-8 px-2 rounded-sm">
                                        <p className="text-black text-sm italic mr-2">568</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 text-left">
                                        This card is the property of SBM. Misuse is criminal offense.
                                        If found, please return to SBM HQ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

export function ProfileTab({ onLogout }: ProfileTabProps) {
    const { user, isLoading, isUpdating, error, refetch, updateSettings } = useProfile();
    const { data: session } = useSession();
    const { clearMessages } = useChat();

    const [savingsGoal, setSavingsGoal] = useState([0]);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

    const { value: avatarCooldown, start: startAvatarCooldown } = useCooldown(0);
    const { value: saveCooldown, start: startSaveCooldown } = useCooldown(0);
    const { value: clearCooldown, start: startClearCooldown } = useCooldown(0);

    const getCurrentAvatar = () => {
        return user?.avatar || session?.user?.image || PRESET_AVATARS[0];
    };

    const isSameAvatar = (avatar1: string, avatar2: string) => {
        if (!avatar1 || !avatar2) return false;
        const cleanAvatar1 = avatar1.split('?')[0];
        const cleanAvatar2 = avatar2.split('?')[0];
        return cleanAvatar1 === cleanAvatar2;
    };

    useEffect(() => {
        if (user) {
            setSavingsGoal([user.savings_percentage ?? 20]);
            const currentAvatar = getCurrentAvatar();
            setSelectedAvatar(currentAvatar);
        }
    }, [user, session]);

    useEffect(() => {
        if (isAvatarDialogOpen) {
            const currentAvatar = getCurrentAvatar();
            setSelectedAvatar(currentAvatar);
            console.log("Dialog opened, current avatar:", currentAvatar);
            console.log("Selected avatar set to:", currentAvatar);
        }
    }, [isAvatarDialogOpen]);

    const handleChangeAvatar = async () => {
        startAvatarCooldown(5);
        const success = await updateSettings({ avatar: selectedAvatar });
        if (success) {
            setIsAvatarDialogOpen(false);
            try {
                await refetch();
            } catch (e) {
                // ignore refetch errors
            }
        }
    };
    const handleSave = async () => {
        startSaveCooldown(5);
        await updateSettings({ savings_percentage: savingsGoal[0] });
    };

    const handleClear = () => {
        startClearCooldown(5);
        clearMessages();
    };

    const getAvatarFallback = () => {
        if (!user || !user.first_name) return "U";
        return user.first_name.charAt(0).toUpperCase();
    }

    if (isLoading) {
        return <LoadingState />;
    }

    if (error || !user) {
        return <ErrorState
            error={error || "ไม่พบข้อมูล"}
            onRetry={refetch}
            onLogout={onLogout}
        />;
    }

    return (
        <div className="px-4 py-6 space-y-4">
            {error && (
                <Card className="border-red-200 bg-red-50 p-4 text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </Card>
            )}

            {/* Profile Card */}
            <Card className="border border-gray-200 p-6">
                <div className="mb-4">
                    <h2 className="text-black mb-1">โปรไฟล์</h2>
                    <p className="text-gray-500 text-sm">
                        จัดการข้อมูลโปรไฟล์และรูปภาพของคุณ
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                        <AvatarImage src={getCurrentAvatar()} alt="avatar" />
                        <AvatarFallback className="bg-indigo-500 text-white text-2xl">
                            {getAvatarFallback()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="text-black mb-1">
                            {user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '...'}
                        </div>
                        <div className="text-gray-500 text-sm mb-3">
                            {user ? user.email : '...'}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Avatar Change Dialog */}
                            <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-black"
                                        disabled={avatarCooldown > 0 || isUpdating}
                                    >
                                        <Camera className="w-4 h-4 mr-2" />
                                        {avatarCooldown > 0 ? `รอ ${avatarCooldown}s` : "เปลี่ยนรูปภาพ"}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>เปลี่ยนรูปโปรไฟล์</DialogTitle>
                                    </DialogHeader>

                                    <div className="grid grid-cols-4 gap-3">
                                        {/* Google Session Avatar */}
                                        <button
                                            onClick={() => {
                                                const googleAvatar = session?.user?.image || PRESET_AVATARS[0];
                                                setSelectedAvatar(googleAvatar);
                                            }}
                                            className={`relative rounded-full overflow-hidden border-2 ${isSameAvatar(selectedAvatar, session?.user?.image || "")
                                                ? "border-indigo-500"
                                                : "border-transparent"
                                                }`}
                                        >
                                            <img
                                                src={session?.user?.image || PRESET_AVATARS[0]}
                                                alt="google-avatar"
                                                className="w-full h-full object-cover aspect-square"
                                            />
                                            {isSameAvatar(selectedAvatar, session?.user?.image || "") && (
                                                <div className="absolute inset-0 bg-white-50 bg-opacity-40 flex items-center justify-center">
                                                    <Check className="text-white w-6 h-6" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Preset Avatars */}
                                        {PRESET_AVATARS.map((avatar, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSelectedAvatar(avatar);
                                                }}
                                                className={`relative rounded-full overflow-hidden border-2 ${isSameAvatar(selectedAvatar, avatar)
                                                    ? "border-indigo-500"
                                                    : "border-transparent"
                                                    }`}
                                            >
                                                <img
                                                    src={avatar}
                                                    alt={`avatar-${i}`}
                                                    className="w-full h-full object-cover aspect-square"
                                                />
                                                {isSameAvatar(selectedAvatar, avatar) && (
                                                    <div className="absolute inset-0 bg-white-50 bg-opacity-40 flex items-center justify-center">
                                                        <Check className="text-white w-6 h-6" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            onClick={handleChangeAvatar}
                                            className="w-full bg-black text-white hover:bg-gray-800"
                                            disabled={avatarCooldown > 0 || isUpdating}
                                        >
                                            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            {avatarCooldown > 0 ? `รอ ${avatarCooldown}s` : (isUpdating ? "กำลังบันทึก..." : "บันทึกรูปภาพ")}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Credit Card Button */}
                            <CreditCardSheet user={user} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Financial Settings */}
            <Card className="border border-gray-200 p-6">
                <div className="mb-4">
                    <h2 className="text-black mb-1">การตั้งค่าการเงิน</h2>
                    <p className="text-gray-500 text-sm">
                        ตั้งค่าเป้าหมายการออมเงินตัวของคุณ
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="text-black text-sm mb-3">
                            เป้าหมายการออม ({savingsGoal[0]}%)
                        </div>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={savingsGoal}
                                onValueChange={setSavingsGoal}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <div className="w-16 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-black">
                                {savingsGoal[0]}
                            </div>
                        </div>

                    </div>

                    <Button
                        onClick={handleSave}
                        className="w-full bg-black text-white hover:bg-gray-800"
                        disabled={saveCooldown > 0 || isUpdating}
                    >
                        {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {saveCooldown > 0 ? `รอ ${saveCooldown}s` : (isUpdating ? "กำลังบันทึก..." : "บันทึก")}
                    </Button>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-red-200 p-6">
                <div className="mb-4">
                    <h2 className="text-red-600 mb-1">การดำเนินการบัญชี</h2>
                    <p className="text-gray-500 text-sm">ไม่สามารถย้อนกลับได้</p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="w-full bg-red-600 text-white hover:bg-red-700"
                            disabled={clearCooldown > 0}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {clearCooldown > 0 ? `รอ ${clearCooldown}s` : "ล้างประวัติการสนทนา"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการล้างประวัติ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                ประวัติการสนทนาใน Chat Tab จะถูกลบออกจากเครื่องนี้ทั้งหมด
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleClear}
                                disabled={clearCooldown > 0}
                            >
                                {clearCooldown > 0 ? `รอ ${clearCooldown}s` : "ยืนยัน"}
                            </AlertDialogAction>

                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>

            {/* Logout Button */}
            <Button
                onClick={onLogout}
                variant="outline"
                className="w-full border-gray-300 text-black hover:bg-gray-50"
            >
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
            </Button>
        </div>
    );
}