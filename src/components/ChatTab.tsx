import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Mic, Square } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { CheckCheck } from "lucide-react"

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    length: number;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

const QUICK_EXAMPLES = [
    "แม่โอนเงินให้ 500",
    "จ่ายค่าอาหาร 120 บาท",
    "ได้เงินเดือน 25000",
    "ซื้อของชำ 350 บาท",
    "ได้รับโบนัส 5000",
    "จ่ายค่าไฟเดือนนี้ 850 บาท"
];

export function ChatTab() {
    const [inputValue, setInputValue] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const [interimText, setInterimText] = useState("");
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, isProcessing, sendMessage } = useChat();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            console.warn("Web Speech API is not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        // ตั้งค่าให้ continuous เป็น true เพื่อรับเสียงต่อเนื่อง
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'th-TH';

        recognition.onstart = () => {
            setIsListening(true);
            setInputValue("");
            setInterimText("");
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                setInterimText(interimTranscript);
            }

            if (finalTranscript) {
                setInputValue(prev => {
                    const newValue = prev ? `${prev} ${finalTranscript}` : finalTranscript;
                    return newValue.trim();
                });
                setInterimText("");
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setInterimText("");

            if (event.error === 'not-allowed') {
                console.error('กรุณาอนุญาตการใช้งานไมโครโฟนใน browser');
            }
        };

        recognition.onend = () => {
            if (isListening) {
                console.log('Speech recognition ended unexpectedly');
                setIsListening(false);
                setInterimText("");
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (!speechSupported) {
            console.error("Browser นี้ไม่รองรับการจดจำเสียงพูด");
            return;
        }

        if (isListening || !recognitionRef.current) return;

        try {
            setInputValue("");
            setInterimText("");
            recognitionRef.current.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            setIsListening(false);
            setInterimText("");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
                setIsListening(false);
                
                if (interimText.trim()) {
                    setInputValue(prev => {
                        const newValue = prev ? `${prev} ${interimText}` : interimText;
                        return newValue.trim();
                    });
                }
                setInterimText("");
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
                setIsListening(false);
                setInterimText("");
            }
        }
    };

    const handleSend = async (textToSend: string) => {
        if (!textToSend.trim()) return;

        await sendMessage(textToSend);
        setInputValue("");
        setInterimText("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(inputValue);
        }
    };

    const handleQuickExampleClick = (example: string) => {
        setInputValue(example);
        setInterimText("");
    };

    const displayText = interimText ? `${inputValue} ${interimText}`.trim() : inputValue;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && !isProcessing ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">เริ่มต้นการสนทนา</p>
                        <p className="text-sm text-gray-500 mt-1 mb-6">
                            พิมพ์รายรับหรือรายจ่าย หรือใช้เสียงพูดเพื่อบันทึกข้อมูล
                        </p>
                        
                        {/* Quick Section */}
                        <div className="max-w-md mx-auto">
                            <p className="text-sm text-gray-500 mb-3">ลองใช้ข้อความเหล่านี้:</p>
                            <div className="grid grid-cols-1 gap-2">
                                {QUICK_EXAMPLES.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickExampleClick(example)}
                                        className="text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 transition-colors duration-200 text-left"
                                        disabled={isProcessing || isListening}
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex flex-col ${message.isUser ? "items-end" : "items-start"}`}
                        >
                            {/* Message Bubble */}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 mb-1 ${message.isUser
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-black"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{message.text}</p>
                            </div>
                            <div className="flex items-center gap-1 px-1">
                                <span className="text-xs text-muted-foreground">
                                    {message.timestamp.toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                                {message.isUser && (
                                    <CheckCheck className="w-3 h-3 text-primary" />
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-black">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                    {/* Voice Input Button */}
                    {speechSupported && (
                        <Button
                            onClick={isListening ? stopListening : startListening}
                            size="icon"
                            variant={isListening ? "destructive" : "outline"}
                            className={`shrink-0 ${isListening
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            disabled={isProcessing}
                        >
                            {isListening ? (
                                <Square className="w-4 h-4" />
                            ) : (
                                <Mic className="w-4 h-4" />
                            )}
                        </Button>
                    )}

                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <Input
                            value={displayText}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setInterimText("");
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder={
                                isListening
                                    ? "กำลังฟังเสียง... พูดได้เลย"
                                    : speechSupported
                                        ? "พิมพ์รายรับหรือรายจ่าย หรือกดไมค์เพื่อพูด..."
                                        : "พิมพ์รายรับหรือรายจ่าย..."
                            }
                            className="border-gray-200 pr-12"
                            disabled={isListening || isProcessing}
                        />
                        {isListening && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Send Button */}
                    <Button
                        onClick={() => handleSend(displayText)}
                        disabled={!displayText.trim() || isListening || isProcessing}
                        size="icon"
                        className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                {/* Status Message */}
                {isListening && (
                    <div className="mt-2 text-center">
                        <p className="text-sm text-red-500 animate-pulse">
                            🎤 กำลังฟังเสียง... กดปุ่มหยุดเมื่อพูดเสร็จ
                        </p>
                    </div>
                )}

                {/* Browser Support Warning */}
                {!speechSupported && (
                    <div className="mt-2 text-center">
                        <p className="text-sm text-amber-600">
                            ⚠️ Browser นี้ไม่รองรับการจดจำเสียงพูด
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}