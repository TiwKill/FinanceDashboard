import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react'

interface OverviewSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

interface SalaryPattern {
    frequency: string;
    amount: number;
    nextExpectedDate: string;
}

interface FinancialPlan {
    savingsTargetPercentage: number;
    weeklySavings: number;
    monthlySavings: number;
    dailySpending: number;
    weeklySpending: number;
    recommendedDailyBudget: number;
    projectedBalanceBeforeNextSalary: number;
    daysUntilNextSalary: number;
}

interface TopCategory {
    category: string;
    amount: number;
    count: number;
    percentage: number;
}

interface LatestTransaction {
    id: number;
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
}

export interface OverviewApiResponse {
    summary: OverviewSummary;
    salaryPattern: SalaryPattern;
    financialPlan: FinancialPlan;
    topCategories: TopCategory[];
    latestTransactions: LatestTransaction[];
}

interface UseOverviewReturn {
    data: OverviewApiResponse | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const API_URL = `${API_URL_BASE}/api/finance/overview`;

const handleApiError = (err: any, defaultMessage: string): string => {
    console.error('API Error:', err);
    let errMsg = defaultMessage;
    if (err.message === 'No access token found' || err.message.includes('Placeholder token')) {
        errMsg = '❌ กรุณาตั้งค่า Token หรือล็อกอินก่อน';
    } else if (err.response) {
        if (err.response.status === 401) {
            errMsg = '❌ การยืนยันตัวตนล้มเหลว กรุณาล็อกอินใหม่';
        } else if (err.response.status === 400) {
            errMsg = '❌ ข้อมูลที่ส่งไปไม่ถูกต้อง';
        } else if (err.response.status === 500) {
            errMsg = '❌ เกิดข้อผิดพลาดบนเซิร์ฟเวอร์';
        }
    } else if (err.request) {
        errMsg = '❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    }
    return errMsg;
};

export const useOverview = (): UseOverviewReturn => {
    const { data: session } = useSession();
    const [data, setData] = useState<OverviewApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        const token = session?.backendAccessToken;
        if (!token) {
            setError('ไม่พบ token การยืนยันตัวตน');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get<OverviewApiResponse>(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setData(response.data);

        } catch (err: any) {
            setError(handleApiError(err, 'เกิดข้อผิดพลาดในการดึงข้อมูล'));
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (session?.backendAccessToken) {
            refetch();
        }
    }, [refetch, session?.backendAccessToken]);

    return {
        data,
        isLoading,
        error,
        refetch
    };
};