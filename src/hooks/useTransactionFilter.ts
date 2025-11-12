import { useMemo, useState } from 'react';

interface Transaction {
    id: number;
    type: "รายรับ" | "รายจ่าย";
    amount: number;
    category: string;
    description: string;
    date: string;
}

interface UseTransactionFilterReturn {
    filteredTransactions: Transaction[];
    filter: "all" | "income" | "expense";
    setFilter: React.Dispatch<React.SetStateAction<"all" | "income" | "expense">>;
    selectedCategories: string[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
    selectedMonth: string;
    setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
    allCategories: string[];
    months: { value: string; label: string }[];
    clearFilters: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
}

export const useTransactionFilter = (transactions: Transaction[]): UseTransactionFilterReturn => {
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>("all");

    // Extract all unique categories
    const allCategories = useMemo(() => {
        const validCategories = transactions
            .map(t => t.category)
            .filter((c): c is string => c != null && c.trim() !== '');
        return Array.from(new Set(validCategories)).sort();
    }, [transactions]);

    // Generate months from transactions
    const months = useMemo(() => {
        const monthSet = new Set<string>();

        transactions.forEach(transaction => {
            // 4. เพิ่มการตรวจสอบวันที่
            if (!transaction.date) return;
            const date = new Date(transaction.date);
            if (isNaN(date.getTime())) return;

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthValue = `${year}-${month.toString().padStart(2, '0')}`;
            monthSet.add(monthValue);
        });

        const monthOptions = Array.from(monthSet)
            .sort((a, b) => b.localeCompare(a))
            .map(monthValue => {
                const [year, month] = monthValue.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                const label = date.toLocaleDateString('th-TH', {
                    month: 'long',
                    year: 'numeric'
                });

                return { value: monthValue, label };
            });

        return [{ value: "all", label: "ทุกเดือน" }, ...monthOptions];
    }, [transactions]);

    // Filter transactions based on current filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            // Filter by type
            if (filter !== "all") {
                const expectedType = filter === "income" ? "รายรับ" : "รายจ่าย";
                if (transaction.type !== expectedType) return false;
            }

            // Filter by category
            if (selectedCategories.length > 0 && !selectedCategories.includes(transaction.category)) {
                return false;
            }

            // Filter by month
            if (selectedMonth !== "all") {
                const [year, month] = selectedMonth.split('-').map(Number);
                const transactionDate = new Date(transaction.date);
                if (transactionDate.getFullYear() !== year || transactionDate.getMonth() + 1 !== month) {
                    return false;
                }
            }

            return true;
        });
    }, [transactions, filter, selectedCategories, selectedMonth]);

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedMonth("all");
        setFilter("all");
    };

    const activeFilterCount = useMemo(() => {
        const monthCount = selectedMonth !== "all" ? 1 : 0;
        const typeCount = filter !== "all" ? 1 : 0;
        return selectedCategories.length + monthCount + typeCount;
    }, [selectedCategories, selectedMonth, filter]);

    const hasActiveFilters = activeFilterCount > 0;

    return {
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
    };
};