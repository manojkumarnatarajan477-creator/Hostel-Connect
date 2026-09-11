import React from "react";
import Link from "next/link";
import { Bot, User, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessageData {
  id: string;
  sender: "user" | "bot";
  text: string;
  suggestions?: string[];
  sources?: string[];
  actionLink?: {
    label: string;
    href: string;
  };
  timestamp?: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onSelectSuggestion?: (suggestion: string) => void;
}

export function ChatMessage({ message, onSelectSuggestion }: ChatMessageProps) {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 transition-all",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-xs",
          isUser
            ? "bg-slate-800 text-white"
            : "bg-indigo-600 text-white shadow-indigo-600/30 shadow-md"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[84%] space-y-2.5 rounded-2xl p-4 text-sm leading-relaxed",
          isUser
            ? "bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/20"
            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700 shadow-xs"
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Interactive Navigation Action Button */}
        {!isUser && message.actionLink && (
          <div className="pt-1">
            <Link
              href={message.actionLink.href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <span>{message.actionLink.label}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Cited Sources from ai_knowledge */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Source:
            </span>
            {message.sources.map((src, i) => (
              <span
                key={i}
                className="text-[10px] rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-900/40"
              >
                {src}
              </span>
            ))}
          </div>
        )}

        {/* Suggestion Chips */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="pt-1.5 flex flex-wrap gap-1.5">
            {message.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion?.(suggestion)}
                className="rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-slate-900 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 transition-all hover:bg-indigo-100 hover:border-indigo-300 dark:hover:bg-slate-800 active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {message.timestamp && (
          <span
            className={cn(
              "block text-[10px] pt-0.5",
              isUser ? "text-indigo-200 text-right" : "text-slate-400 text-left"
            )}
          >
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
