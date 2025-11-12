import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface UserProfile {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
    savings_percentage: number | null;
}

interface UserUpdatePayload {
    savings_percentage?: number;
    avatar?: string;
}

interface UseProfileReturn {
    user: UserProfile | null;
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updateSettings: (settings: UserUpdatePayload) => Promise<boolean>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

const API_URL_ME = `${API_URL}/api/users/me`;
const API_URL_SETTINGS = `${API_URL}/api/users/me/settings`;

export const useProfile = (): UseProfileReturn => {
    const { data: session } = useSession();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const refetch = useCallback(async () => {
        const token = session?.backendAccessToken;
        if (!token) {
            let errMsg = 'ไม่พบ token การยืนยันตัวตน';
            setError(errMsg);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get<UserProfile>(API_URL_ME, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(response.data);
            setError(null);
        } catch (err: any) {
            setError(handleApiError(err, 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'));
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    // Fetch user data on initial load
    useEffect(() => {
        if (session?.backendAccessToken) {
            refetch();
        }
    }, [session, refetch]);

    const updateSettings = async (settings: UserUpdatePayload): Promise<boolean> => {
        const token = session?.backendAccessToken;
        if (!token) {
            setError("ไม่พบ token การยืนยันตัวตน");
            return false;
        }

        setIsUpdating(true);
        setError(null);
        try {
            const response = await axios.put<UserProfile>(API_URL_SETTINGS, settings, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setUser(response.data);
            return true;
        } catch (err: any) {
            setError(handleApiError(err, 'อัปเดตการตั้งค่าไม่สำเร็จ'));
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        user,
        isLoading,
        isUpdating,
        error,
        refetch,
        updateSettings
    };
};