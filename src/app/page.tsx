"use client"

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, LayoutDashboard, List, User } from "lucide-react";
import { ChatTab } from "@/components/ChatTab";
import { OverviewTab } from "@/components/OverviewTab";
import { TransactionListTab } from "@/components/TransactionListTab";
import { ProfileTab } from "@/components/ProfileTab";
import { LoginPage } from "@/components/LoginPage";

export default function Home() {
    const [activeTab, setActiveTab] = useState("overview");
    const { data: session, status } = useSession();

    useEffect(() => {
        const savedTab = localStorage.getItem("activeTab");
        if (savedTab && ["chat", "overview", "transactions", "profile"].includes(savedTab)) {
            setActiveTab(savedTab);
        }
    }, []);

    useEffect(() => {
        if (session) {
            localStorage.setItem("activeTab", activeTab);
        }
    }, [activeTab, session]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
        localStorage.removeItem("activeTab");
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-black animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <LoginPage onLogin={() => {}} />;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                    <h1 className="text-black">รายรับ-รายจ่าย</h1>
                    <div className="text-sm text-gray-500">
                        {session.user?.name || session.user?.email}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="pb-20">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsContent value="chat" className="mt-0">
                        <ChatTab />
                    </TabsContent>
                    <TabsContent value="overview" className="mt-0">
                        <OverviewTab />
                    </TabsContent>
                    <TabsContent value="transactions" className="mt-0">
                        <TransactionListTab />
                    </TabsContent>
                    <TabsContent value="profile" className="mt-0">
                        <ProfileTab onLogout={handleLogout} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="flex items-center justify-around px-2 py-3">
                    <button
                        onClick={() => handleTabChange("chat")}
                        className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors cursor-pointer ${activeTab === "chat" ? "text-black" : "text-gray-400"
                            }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-xs">Chat</span>
                    </button>
                    <button
                        onClick={() => handleTabChange("overview")}
                        className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors cursor-pointer ${activeTab === "overview" ? "text-black" : "text-gray-400"
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-xs">Overview</span>
                    </button>
                    <button
                        onClick={() => handleTabChange("transactions")}
                        className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors cursor-pointer ${activeTab === "transactions" ? "text-black" : "text-gray-400"
                            }`}
                    >
                        <List className="w-5 h-5" />
                        <span className="text-xs">Transactions</span>
                    </button>
                    <button
                        onClick={() => handleTabChange("profile")}
                        className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors cursor-pointer ${activeTab === "profile" ? "text-black" : "text-gray-400"
                            }`}
                    >
                        <User className="w-5 h-5" />
                        <span className="text-xs">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}