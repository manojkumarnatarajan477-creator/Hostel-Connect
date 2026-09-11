import { NextRequest, NextResponse } from "next/server";
import { processHostelAIQuery } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query string is required" }, { status: 400 });
    }

    // Call encapsulated logic inside lib/ai.ts
    const result = await processHostelAIQuery(query);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process AI query" },
      { status: 500 }
    );
  }
}
