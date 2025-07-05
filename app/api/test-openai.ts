// pages/api/test-openai.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4", // lub "gpt-3.5-turbo"
      messages: [{ role: "user", content: "Ile kcal ma 100g ryżu?" }],
    });

    const answer = chat.choices[0].message.content;
    res.status(200).json({ ok: true, answer });
  } catch (err) {
    console.error("Błąd testu OpenAI:", err);
    res.status(500).json({ ok: false, error: "Nie udało się połączyć z OpenAI" });
  }
}
