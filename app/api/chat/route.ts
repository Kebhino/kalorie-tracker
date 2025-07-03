import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Brak wiadomości" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jesteś asystentem dietetycznym. Użytkownik podaje opis posiłku, a Twoim zadaniem jest:
- Obliczyć szacowaną kaloryczność.
- Zwrócić listę składników z wagą i kaloriami.
- NIE pokazuj JSON-a użytkownikowi.
- Odpowiedz miłym, ludzkim językiem.
- Zwróć dane przez function call do funkcji zapisz_posilek.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      tools: [
        {
          type: "function",
          function: {
            name: "zapisz_posilek",
            description: "Zapisz oszacowane kalorie posiłku i składniki",
            parameters: {
              type: "object",
              properties: {
                produkty: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nazwa: { type: "string" },
                      waga: { type: "number" },
                      kcalNa100g: { type: "number" },
                      kcal: { type: "number" },
                    },
                    required: ["nazwa", "waga", "kcalNa100g", "kcal"],
                  },
                },
                kcalŁącznie: { type: "number" },
              },
              required: ["produkty", "kcalŁącznie"],
            },
          },
        },
      ],
    });

    const fullText = response.choices[0].message.content ?? "";
    const functionCall = response.choices[0].message.tool_calls?.[0];
    let meal = null;

    if (functionCall?.function?.arguments) {
      try {
        meal = JSON.parse(functionCall.function.arguments);
      } catch (err) {
        console.warn("⚠️ Nie udało się sparsować danych z function call:", err);
      }
    }

    return NextResponse.json({
      answer: fullText.trim(),
      meal,
    });
  } catch (err) {
    console.error("🔥 Błąd w /api/chat:", err);
    return NextResponse.json({ error: "Błąd AI" }, { status: 500 });
  }
}
