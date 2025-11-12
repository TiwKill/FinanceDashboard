import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowDownCircle, ArrowUpCircle, AlertCircle, Filter, X, Calendar, Loader2, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "./ui/sheet";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTransactionList } from "@/hooks/useTransactionList";
import { useTransactionFilter } from "@/hooks/useTransactionFilter";

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

export function TransactionListTab() {
    const { transactions, isLoading, error, refresh } = useTransactionList();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const {
        filteredTransactions,
        filter,
        setFilter,
        selectedCategories,
        setSelectedCategories,
        selectedMonth,
        setSelectedMonth,
        allCategories,
        months,
        clearFilters,
        hasActiveFilters,
        activeFilterCount,
    } = useTransactionFilter(transactions);

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "-";
            return date.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return "-";
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "-";
            return date.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return "-";
        }
    };

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error || "ไม่พบข้อมูล"} onRetry={refresh} />;
    }

    return (
        <div className="px-4 py-6">

            {/* Filter Header */}
            {!isLoading && (
                <div className="flex flex-col gap-4 mb-4">
                    {/* Month Filter */}
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-full border-gray-200">
                                <SelectValue placeholder="เลือกเดือน" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-full transition-colors ${filter === "all"
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            ทั้งหมด
                        </button>
                        <button
                            onClick={() => setFilter("income")}
                            className={`px-4 py-2 rounded-full transition-colors ${filter === "income"
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            รายรับ
                        </button>
                        <button
                            onClick={() => setFilter("expense")}
                            className={`px-4 py-2 rounded-full transition-colors ${filter === "expense"
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            รายจ่าย
                        </button>

                        {/* Filter Button */}
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <button className="ml-auto p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors relative">
                                    <Filter className="w-5 h-5" />
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="bg-white rounded-t-2xl max-h-[80vh]">
                                <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <SheetTitle className="text-black text-lg">ตัวกรอง</SheetTitle>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearFilters}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                ล้างทั้งหมด
                                            </Button>
                                        )}
                                    </div>
                                    <SheetDescription className="text-gray-500">
                                        เลือกหมวดหมู่และเดือนที่ต้องการแสดง
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="p-6 space-y-6">
                                    {/* Month Filter */}
                                    <div className="space-y-3">
                                        <label className="text-black text-base font-medium">เดือน</label>
                                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                            <SelectTrigger className="w-full border-gray-200">
                                                <SelectValue placeholder="เลือกเดือน" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem key={month.value} value={month.value}>
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Category Filter Grid */}
                                    <div className="space-y-4">
                                        <label className="text-black text-base font-medium">หมวดหมู่</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {allCategories.map((category) => {
                                                const isSelected = selectedCategories.includes(category);
                                                return (
                                                    <div
                                                        key={category}
                                                        onClick={() => toggleCategory(category)}
                                                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${isSelected
                                                            ? "border-black bg-black text-white"
                                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-sm">{category}</span>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                                ? "bg-white border-white"
                                                                : "border-gray-300"
                                                                }`}>
                                                                {isSelected && (
                                                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Selected Filters Preview */}
                                    {hasActiveFilters && (
                                        <div className="pt-6 border-t border-gray-100">
                                            <label className="text-black text-base font-medium mb-3 block">ตัวกรองที่เลือก</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedMonth !== "all" && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-blue-100 text-blue-700 pl-3 pr-2 py-2 flex items-center gap-1 rounded-lg border-0"
                                                    >
                                                        <Calendar className="w-3 h-3" />
                                                        {months.find(m => m.value === selectedMonth)?.label}
                                                        <button
                                                            onClick={() => setSelectedMonth("all")}
                                                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                )}
                                                {selectedCategories.map((category) => (
                                                    <Badge
                                                        key={category}
                                                        variant="secondary"
                                                        className="bg-gray-100 text-gray-700 pl-3 pr-2 py-2 flex items-center gap-1 rounded-lg border-0"
                                                    >
                                                        {category}
                                                        <button
                                                            onClick={() => toggleCategory(category)}
                                                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Apply Button */}
                                <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0">
                                    <Button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full bg-black text-white hover:bg-gray-800 py-3 rounded-xl text-base font-medium shadow-lg"
                                        size="lg"
                                    >
                                        ดูรายการ ({filteredTransactions.length} รายการ)
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            )}

            {/* Active Filters */}
            {!isLoading && hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedMonth !== "all" && (
                        <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 pl-3 pr-2 py-2 flex items-center gap-1 rounded-lg"
                        >
                            <Calendar className="w-3 h-3" />
                            {months.find(m => m.value === selectedMonth)?.label}
                            <button
                                onClick={() => setSelectedMonth("all")}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    )}
                    {selectedCategories.map((category) => (
                        <Badge
                            key={category}
                            variant="secondary"
                            className="bg-black text-white pl-3 pr-2 py-2 flex items-center gap-1 rounded-lg"
                        >
                            {category}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="ml-1 hover:bg-gray-700 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Transaction List */}
            {!isLoading && (
                <div className="space-y-3">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600">ไม่พบรายการที่ตรงกับตัวกรอง</p>
                            <p className="text-sm text-gray-500 mt-1">ลองเปลี่ยนตัวกรองหรือล้างตัวกรองทั้งหมด</p>
                            {hasActiveFilters && (
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="mt-4 border-gray-300 text-gray-700"
                                >
                                    ล้างตัวกรองทั้งหมด
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredTransactions.slice(0, 30).map((transaction) => (
                            <Card key={transaction.id} className="border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === "รายรับ"
                                                ? "bg-green-50"
                                                : "bg-red-50"
                                                }`}
                                        >
                                            {transaction.type === "รายรับ" ? (
                                                <ArrowDownCircle className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <ArrowUpCircle className="w-6 h-6 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-black font-medium">{transaction.description}</div>
                                            <Badge
                                                variant="secondary"
                                                className="mt-2 bg-gray-100 text-gray-600 rounded-lg px-2 py-1"
                                            >
                                                {transaction.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-start gap-2">
                                        <div
                                            className={`text-lg font-semibold ${transaction.type === "รายรับ"
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {transaction.type === "รายรับ" ? "+" : "-"}฿
                                            {transaction.amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-gray-500 text-sm mt-3">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(transaction.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formatTime(transaction.date)}
                                    </span>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}