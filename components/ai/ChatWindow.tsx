"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, RefreshCw, CornerDownLeft, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChatMessage, ChatMessageData } from "./ChatMessage";

interface ChatWindowProps {
  className?: string;
  initialMessage?: string;
}

export function ChatWindow({ className, initialMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: "initial-bot",
      sender: "bot",
      text:
        initialMessage ||
        "Hello! I am your Hostel AI Assistant. I can answer hostel rules, mess schedules, medical emergency protocols, and guide you directly to services like leave requests and maintenance tickets.",
      suggestions: [
        "I want to apply for leave",
        "Take me to complaints",
        "What is on today's mess menu?",
        "Where do I collect my parcel?",
      ],
      sources: ["Hostel Knowledge Base"],
      timestamp: "Just now",
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
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessageData = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      const botMessage: ChatMessageData = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: data.answer || "I received your request.",
        suggestions: data.suggestions,
        sources: data.sources,
        actionLink: data.actionLink,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-err-" + Date.now(),
          sender: "bot",
          text: "I am temporarily unable to consult the knowledge base. For urgent assistance, please contact the Chief Warden office.",
          suggestions: ["Check mess timings", "Call campus ambulance"],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "reset-" + Date.now(),
        sender: "bot",
        text: "Conversation refreshed. What would you like to check in the hostel directory?",
        suggestions: [
          "Hostel curfew hours",
          "Mess timetable & special menu",
          "Leave application steps",
        ],
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <Card className={`flex flex-col h-[640px] shadow-lg border-slate-200 dark:border-slate-800 ${className || ""}`}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between py-3.5 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Hostel AI Knowledge Assistant
              </CardTitle>
              <Badge variant="success" className="text-[10px] py-0 px-2">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span>Isolated Knowledge Base • Privacy Guard Active</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>

      {/* Messages Feed */}
      <CardContent className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onSelectSuggestion={(s) => handleSendMessage(s)}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-slate-400 pl-1 animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <span>Consulting `ai_knowledge` table...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about gate curfew, mess timetable, parcel pickup, medical emergency..."
            className="flex-1 h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || loading}
            isLoading={loading}
            className="h-11 px-5 gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <span>Ask</span>
            <CornerDownLeft className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
