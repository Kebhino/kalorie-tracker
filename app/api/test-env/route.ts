import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openaiKey: process.env.OPENAI_API_KEY ? 'OK' : 'MISSING',
  });
}
