"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "Create a workout plan for weight loss",
  "What should I eat before a workout?",
  "How can I improve my running endurance?",
  "Tips for building muscle mass",
  "Healthy meal ideas for busy days",
];

export default function CoachPage() {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi ${userProfile?.displayName || "there"}! 👋 I'm your AI fitness coach. I'm here to help you with workout advice, nutrition tips, and answer any fitness-related questions you have. What would you like to know today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userProfile: {
            goals: userProfile?.goals,
            fitnessLevel: userProfile?.fitnessLevel,
            dietaryPreferences: userProfile?.dietaryPreferences,
          },
          conversationHistory: messages.slice(-5).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response from AI coach");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Coach</h1>
              <p className="text-gray-600">Your personal fitness assistant</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-primary-600"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`flex-1 max-w-2xl ${
                  message.role === "user" ? "flex justify-end" : ""
                }`}
              >
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl">
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="mt-8">
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Suggested questions:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="text-left p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:shadow-md transition disabled:opacity-50"
                  >
                    <p className="text-sm text-gray-700">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fitness and nutrition..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
