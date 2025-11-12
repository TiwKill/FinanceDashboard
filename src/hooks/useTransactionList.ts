import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Transaction {
    id: number;
    type: "รายรับ" | "รายจ่าย";
    amount: number;
    category: string;
    description: string;
    date: string;
}

interface UseTransactionListReturn {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    deleteTransaction: (id: number) => Promise<boolean>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const API_LIST_URL = `${API_URL}/api/finance/list`;
const API_DELETE_URL = `${API_URL}/api/finance/delete`;

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

export const useTransactionList = (): UseTransactionListReturn => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    const fetchTransactions = useCallback(async () => {
        const token = session?.backendAccessToken;

        if (!token) {
            let errMsg = 'ไม่พบ token การยืนยันตัวตน';
            setError(errMsg);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get(API_LIST_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data;
            if (data.data && Array.isArray(data.data)) {
                setTransactions(data.data);
            } else {
                throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
            }
        } catch (err: any) {
            // ใช้ Standard Error Handler
            setError(handleApiError(err, 'เกิดข้อผิดพลาดในการดึงข้อมูล'));
        } finally {
            setIsLoading(false);
        }
    }, [session?.backendAccessToken]);

    const deleteTransaction = async (id: number): Promise<boolean> => {
        const token = session?.backendAccessToken;
        if (!token) {
            setError('ไม่พบ token การยืนยันตัวตน');
            return false;
        }

        try {
            await axios.delete(`${API_DELETE_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setTransactions(prev => prev.filter(transaction => transaction.id !== id));
            return true;
        } catch (err: any) {
            // ใช้ Standard Error Handler
            setError(handleApiError(err, 'ลบรายการไม่สำเร็จ'));
            return false;
        }
    };

    useEffect(() => {
        if (session?.backendAccessToken) {
            fetchTransactions();
        }
    }, [fetchTransactions, session?.backendAccessToken]);

    return {
        transactions,
        isLoading,
        error,
        refresh: fetchTransactions,
        deleteTransaction,
    };
};