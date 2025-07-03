import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "BRAK",
    OPENAI_PROJECT_ID: process.env.OPENAI_PROJECT_ID || "BRAK",
  });
}
