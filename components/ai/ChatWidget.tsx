import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ChatWidget() {
  return (
    <Card className="bg-indigo-900 text-white p-4">
      <CardContent className="space-y-2 p-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span className="text-xs font-bold">Hostel AI Assistant</span>
        </div>
        <p className="text-xs text-indigo-200">
          Need immediate guidance on hostel rules or mess timing?
        </p>
        <Link href="/student/ai" className="inline-block pt-1">
          <Button size="sm" className="text-xs bg-white text-indigo-900 hover:bg-slate-100 gap-1">
            <span>Ask AI</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
