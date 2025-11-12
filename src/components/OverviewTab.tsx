import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Calendar, Target, TrendingUp, AlertCircle, PieChart, ChevronDown, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useOverview } from "@/hooks/useOverview";
import { Button } from "@/components/ui/button";

const getRelativeDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

        if (date.toDateString() === today.toDateString()) {
            return "วันนี้";
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "เมื่อวาน";
        }
        if (date.getFullYear() === today.getFullYear()) {
             return date.toLocaleDateString('th-TH', options);
        }
        return date.toLocaleDateString('th-TH', { ...options, year: '2-digit' });
    } catch (e) {
        console.error("Invalid date string:", dateString, e);
        return "-";
    }
};

const getFullDate = (dateString: string): string => {
     try {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
     } catch (e) {
         return "-";
     }
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


export function OverviewTab() {
    const { data, isLoading, error, refetch } = useOverview();
    const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);

    if (isLoading) {
        return <LoadingState />;
    }

    if (error || !data) {
        return <ErrorState error={error || "ไม่พบข้อมูล"} onRetry={refetch} />;
    }

    const { summary, salaryPattern, financialPlan, topCategories, latestTransactions } = data;

    const nextSalaryDate = getFullDate(salaryPattern.nextExpectedDate);

    return (
        <div className="px-4 py-6 space-y-6">
            {/* Balance Card */}
            <Card className="bg-black text-white border-0 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">ยอดคงเหลือ</span>
                </div>
                <div className="text-4xl">
                    ฿{summary.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </Card>

            {/* Income & Expense */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border border-gray-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                            <ArrowDownCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">รายรับ</div>
                    <div className="text-2xl text-black">
                        ฿{summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </Card>

                <Card className="border border-gray-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <ArrowUpCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">รายจ่าย</div>
                    <div className="text-2xl text-black">
                        ฿{summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </Card>
            </div>

            {/* AI Insights Section - Collapsible */}
            <Collapsible open={isAIInsightsOpen} onOpenChange={setIsAIInsightsOpen}>
                <Card className="border border-blue-200 bg-linear-to-br from-blue-50 to-purple-50 p-4 rounded-2xl">
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-black">AI Insights</h3>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                            Beta
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 text-xs">
                                        การวิเคราะห์โดย AI (ยังไม่เสถียร)
                                    </p>
                                </div>
                            </div>
                            <ChevronDown
                                className={`w-5 h-5 text-gray-600 transition-transform ${isAIInsightsOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4 space-y-4">
                        {/* Salary Pattern Card */}
                        <Card className="border border-gray-200 bg-white p-5 rounded-lg">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="text-black mb-1">รูปแบบเงินเดือน</h4>
                                    <p className="text-gray-500 text-xs">
                                        ระบบเรียนรู้รูปแบบการได้รับเงินเดือนอัตโนมัติ
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-gray-500 text-xs mb-1">ความถี่</div>
                                    <div className="text-purple-600 text-sm capitalize">{salaryPattern.frequency}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-gray-500 text-xs mb-1">ต่อไป</div>
                                    <div className="text-purple-600 text-sm">{nextSalaryDate}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-gray-500 text-xs mb-1">จำนวน</div>
                                    <div className="text-purple-600 text-sm">{salaryPattern.amount.toLocaleString()} บาท</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-gray-500 text-xs mb-1">อีก (วัน)</div>
                                    <div className="text-purple-600 text-sm">{financialPlan.daysUntilNextSalary} วัน</div>
                                </div>
                            </div>
                        </Card>

                        {/* Financial Plan Card */}
                        <Card className="border border-gray-200 bg-white p-5 rounded-lg">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-black mb-1">แผนการเงินแนะนำ</h4>
                                    <p className="text-gray-500 text-xs">
                                        คำแนะนำการออมและใช้จ่าย
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <TrendingUp className="w-3 h-3 text-gray-600" />
                                        <div className="text-gray-500 text-xs">เป้าหมายการออม</div>
                                    </div>
                                    <div className="text-black text-sm">รายเดือน: {financialPlan.monthlySavings.toLocaleString()} บาท</div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Calendar className="w-3 h-3 text-gray-600" />
                                        <div className="text-gray-500 text-xs">งบใช้จ่าย</div>
                                    </div>
                                    <div className="text-black text-sm">รายวัน: {financialPlan.dailySpending.toFixed(2)} บาท</div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-yellow-800 text-xs mb-0.5">
                                            คำแนะนำประหยัดรายวัน
                                        </div>
                                        <div className="text-yellow-900 text-sm">
                                            ใช้จ่ายไม่เกิน {financialPlan.recommendedDailyBudget.toLocaleString()} / วัน
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Top Spending Categories Card */}
                        <Card className="border border-gray-200 bg-white p-5 rounded-lg">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                                    <PieChart className="w-4 h-4 text-pink-600" />
                                </div>
                                <div>
                                    <h4 className="text-black mb-1">หมวดหมู่ที่ใช้จ่ายมากที่สุด</h4>
                                    <p className="text-gray-500 text-xs">
                                        หมวดหมู่ที่ใช้เงินมากที่สุด
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {topCategories.length > 0 ? topCategories.map((cat, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <div className="text-black text-sm">{cat.category}</div>
                                                <div className="text-gray-500 text-xs">{cat.count} รายการ</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-black text-sm">{cat.amount.toLocaleString()} บาท</div>
                                            <div className="text-gray-500 text-xs">{cat.percentage.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-sm text-center py-4">ไม่พบข้อมูลการใช้จ่าย</p>
                                )}
                            </div>
                        </Card>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Recent Activity */}
            <div>
                <h3 className="text-black mb-4">รายการล่าสุด</h3>
                <div className="space-y-3">
                    {latestTransactions.length > 0 ? latestTransactions.slice(0, 4).map((item) => (
                        <Card key={item.id} className="border border-gray-200 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-black">{item.description}</div>
                                    <div className="text-gray-500 text-sm">{getRelativeDate(item.date)}</div>
                                </div>
                                <div
                                    className={`${item.type === "รายรับ" ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {item.type === "รายรับ" ? "+" : "-"}฿{Math.abs(item.amount).toLocaleString()}
                                </div>
                            </div>
                        </Card>
                    )) : (
                         <p className="text-gray-500 text-sm text-center py-4">ไม่พบรายการล่าสุด</p>
                    )}
                </div>
            </div>
        </div>
    );
}