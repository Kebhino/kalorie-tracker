import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

// 🔍 Debug – logujemy zmienne środowiskowe w czasie builda
console.log("ENV DYNAMO_WAGA_TABLE:", process.env.DYNAMO_WAGA_TABLE);
console.log("ENV REGION:", process.env.MY_AWS_REGION);
console.log("ENV KEY:", process.env.MY_AWS_ACCESS_KEY_ID ? "✅" : "❌");
console.log("ENV SECRET:", process.env.MY_AWS_SECRET_ACCESS_KEY ? "✅" : "❌");

const region = process.env.MY_AWS_REGION;
const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY;
const nazwaTabeli = process.env.DYNAMO_WAGA_TABLE;

if (!region || !accessKeyId || !secretAccessKey || !nazwaTabeli) {
  console.log("❌ Brakujące zmienne środowiskowe:");
  console.log("region:", region);
  console.log("accessKeyId:", accessKeyId);
  console.log("secretAccessKey:", secretAccessKey ? "***" : "brak");
  console.log("nazwaTabeli:", nazwaTabeli);
  throw new Error("❌ Brak wymaganych zmiennych środowiskowych");
}

const klientDynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
);

// GET – Pobiera wszystkie wpisy wagi
export async function GET() {
  try {
    const wynik = await klientDynamo.send(
      new ScanCommand({
        TableName: nazwaTabeli,
      })
    );

    const posortowane = Array.isArray(wynik.Items)
      ? wynik.Items.sort((a, b) => (a.data ?? "").localeCompare(b.data ?? ""))
      : [];

    return new Response(JSON.stringify(posortowane));
  } catch (e) {
    console.error("❌ Błąd pobierania wagi:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Błąd serwera" }),
      { status: 500 }
    );
  }
}

// POST – Dodaje nowy wpis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, waga } = body;

    if (!data || !waga) {
      return new Response(
        JSON.stringify({ error: "Brakuje wymaganych pól (data, waga)" }),
        { status: 400 }
      );
    }

    const nowyPomiar = {
      id: uuidv4(),
      data,
      waga: Number(waga),
    };

    await klientDynamo.send(
      new PutCommand({
        TableName: nazwaTabeli,
        Item: nowyPomiar,
      })
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error("❌ Błąd dodawania wagi:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Błąd serwera" }),
      { status: 500 }
    );
  }
}

// DELETE – Usuwa wpis na podstawie ID i daty
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = searchParams.get("data");

    if (!id || !data) {
      return new Response(
        JSON.stringify({ error: "Brak wymaganych parametrów (id, data)" }),
        { status: 400 }
      );
    }

    await klientDynamo.send(
      new DeleteCommand({
        TableName: nazwaTabeli,
        Key: {
          data,
          id,
        },
      })
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error("❌ Błąd usuwania wagi:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Błąd serwera" }),
      { status: 500 }
    );
  }
}
