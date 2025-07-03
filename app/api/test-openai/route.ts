// app/api/test-openai/route.ts
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

export async function GET() {
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Ile kalorii ma 100g ryżu?",
        },
      ],
    });

    const answer = chat.choices[0].message.content;
    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    console.error("Błąd API:", err);
    return NextResponse.json({ ok: false, error: "Błąd komunikacji z OpenAI" }, { status: 500 });
  }
}
