"use client";

import { useEffect, useState } from "react";
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
    RefreshCw
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
import { useProfile } from "@/hooks/useProfile";
import { useChat } from "@/hooks/useChat";

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

const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
     <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-red-600">{error}</p>
        <Button onClick={onRetry} variant="outline" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองอีกครั้ง
        </Button>
    </div>
);

export function ProfileTab({ onLogout }: ProfileTabProps) {
    const { user, isLoading, isUpdating, error, refetch, updateSettings } = useProfile();
    const { clearMessages } = useChat();

    const [savingsGoal, setSavingsGoal] = useState([20]);
    const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

    const { value: avatarCooldown, start: startAvatarCooldown } = useCooldown(0);
    const { value: saveCooldown, start: startSaveCooldown } = useCooldown(0);
    const { value: clearCooldown, start: startClearCooldown } = useCooldown(0);

    useEffect(() => {
        if (user) {
            setSavingsGoal([user.savings_percentage ?? 20]);
            setSelectedAvatar(user.avatar ?? PRESET_AVATARS[0]);
        }
    }, [user]);

    const handleChangeAvatar = async () => {
        startAvatarCooldown(5);
        const success = await updateSettings({ avatar: selectedAvatar });
        if (success) {
            setIsAvatarDialogOpen(false);
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
        return <ErrorState error={error || "ไม่พบข้อมูล"} onRetry={refetch} />;
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
                        {/* 11. ใช้ state ที่ sync กับ API */}
                        <AvatarImage src={user?.avatar ?? selectedAvatar} alt="avatar" />
                        <AvatarFallback className="bg-indigo-500 text-white text-2xl">
                            {getAvatarFallback()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        {/* 12. แสดงข้อมูลจาก API */}
                        <div className="text-black mb-1">
                            {user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '...'}
                        </div>
                        <div className="text-gray-500 text-sm mb-3">
                            {user ? user.email : '...'}
                        </div>

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
                                    {PRESET_AVATARS.map((avatar, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedAvatar(avatar)}
                                            className={`relative rounded-full overflow-hidden border-2 ${selectedAvatar === avatar
                                                ? "border-indigo-500"
                                                : "border-transparent"
                                                }`}
                                        >
                                            <img
                                                src={avatar}
                                                alt={`avatar-${i}`}
                                                className="rounded-full object-cover"
                                            />
                                            {selectedAvatar === avatar && (
                                                <Check className="absolute inset-0 text-white w-8 h-8 m-auto" />
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