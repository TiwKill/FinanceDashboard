'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

const CHAT_STORAGE_KEY = 'chatMessages'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface ChatMessage {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
    error?: boolean
}

interface TransactionResponse {
    date: string
    amount: number
    transaction_type: string
    category: string
    description: string
    id: number
}

interface UseChatReturn {
    messages: ChatMessage[]
    isProcessing: boolean
    sendMessage: (text: string) => Promise<void>
    clearMessages: () => void
    retryLastMessage: () => void
}

const storage = {
    save: (key: string, data: any): void => {
        if (typeof window === 'undefined') return
        try {
            localStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
            console.error(`Failed to save ${key} to localStorage:`, error)
        }
    },
    load: <T,>(key: string): T | null => {
        if (typeof window === 'undefined') return null
        try {
            const item = localStorage.getItem(key)
            return item ? (JSON.parse(item) as T) : null
        } catch (error) {
            console.error(`Failed to load ${key} from localStorage:`, error)
            storage.remove(key)
            return null
        }
    },
    remove: (key: string): void => {
        if (typeof window === 'undefined') return
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error(`Failed to remove ${key} from localStorage:`, error)
        }
    },
}

const createMessage = (text: string, isUser: boolean, error = false): ChatMessage => ({
    id: `${Date.now()}_${isUser ? 'user' : 'ai'}`,
    text,
    isUser,
    timestamp: new Date(),
    error,
})

const formatTransactionDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

const formatAmount = (amount: number): string => `${amount.toFixed(2)} บาท`

const getTransactionTitle = (transactionType: string): string => {
    const titles: Record<string, string> = {
        'รายรับ': 'บันทึกรายรับสำเร็จ 🎉',
        'รายจ่าย': 'บันทึกรายจ่ายสำเร็จ ✨',
    }
    return titles[transactionType] || 'บันทึกข้อมูลสำเร็จ 🎉'
}

const formatTransactionResponse = (data: TransactionResponse): string => {
    const title = getTransactionTitle(data.transaction_type)
    const date = formatTransactionDate(data.date)
    const amount = formatAmount(data.amount)

    return `${title}\n` +
        `**รายการ:** ${data.description}\n` +
        `**ประเภท:** ${data.transaction_type}\n` +
        `**หมวดหมู่:** ${data.category}\n` +
        `**จำนวนเงิน:** ${amount}\n` +
        `**วันที่:** ${date}`
}

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

export const useChat = (): UseChatReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const { data: session } = useSession()
    const messagesRef = useRef<ChatMessage[]>([])
    const lastUserMessageRef = useRef<string>('')

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    useEffect(() => {
        const savedMessages = storage.load<ChatMessage[]>(CHAT_STORAGE_KEY)
        if (savedMessages?.length) {
            setMessages(savedMessages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
            })))
        }
    }, [])

    useEffect(() => {
        if (messages.length > 0) storage.save(CHAT_STORAGE_KEY, messages)
    }, [messages])

    const processTransaction = useCallback(async (text: string): Promise<string> => {
        const token = session?.backendAccessToken
        if (!token) throw new Error('ไม่พบ token การยืนยันตัวตน')

        try {
            const response = await axios.post<TransactionResponse>(
                `${API_URL}/api/transactions`,
                { text },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            )
            return formatTransactionResponse(response.data)
        } catch (err: any) {
            throw new Error(handleApiError(err, 'เกิดข้อผิดพลาดในการส่งข้อความ'));
        }
    }, [session])

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || isProcessing) return

        const userMessage = createMessage(trimmed, true)
        lastUserMessageRef.current = trimmed
        setMessages(prev => [...prev, userMessage])
        setIsProcessing(true)

        try {
            const responseText = await processTransaction(trimmed)
            const aiMessage = createMessage(responseText, false)
            setMessages(prev => [...prev, aiMessage])
        } catch (err: any) {
            const errorMessage = createMessage(err.message || '❌ เกิดข้อผิดพลาดที่ไม่คาดคิด', false, true)
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsProcessing(false)
        }
    }, [isProcessing, processTransaction])

    const retryLastMessage = useCallback(async () => {
        const lastMessage = lastUserMessageRef.current
        if (lastMessage && !isProcessing) {
            const filtered = messagesRef.current.filter(m => !m.error && m.text !== lastMessage)
            setMessages(filtered)
            await sendMessage(lastMessage)
        }
    }, [sendMessage, isProcessing])

    const clearMessages = useCallback(() => {
        setMessages([])
        lastUserMessageRef.current = ''
        storage.remove(CHAT_STORAGE_KEY)
    }, [])

    return {
        messages,
        isProcessing,
        sendMessage,
        clearMessages,
        retryLastMessage,
    }
}
