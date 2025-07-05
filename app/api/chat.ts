// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Only POST allowed");
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Brak wiadomości" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // albo "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content: `Jesteś pomocnym asystentem dietetycznym. Odpowiadasz krótko, podajesz szacunkową wartość kalorii na podstawie opisu posiłku. Gdy to możliwe, zwracasz również obiekt JSON posiłku w formacie:
{
  "nazwa": "...",
  "waga": ...,
  "kcalNa100g": ...,
  "kcal": ...
}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const odpowiedz = response.choices[0].message.content || "";

    // Spróbuj wyciągnąć JSON z odpowiedzi (jeśli jest)
    const regex = /{[\s\S]*}/;
    const jsonMatch = odpowiedz.match(regex);

    let mealData = null;
    if (jsonMatch) {
      try {
        mealData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn("Nie udało się sparsować JSONa", e);
      }
    }

    res.status(200).json({
      answer: odpowiedz,
      meal: mealData,
    });
  } catch (err: any) {
    console.error("Błąd API GPT:", err);
    res.status(500).json({ error: "Błąd AI" });
  }
}
