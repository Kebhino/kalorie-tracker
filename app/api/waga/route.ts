import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const klientDynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
);

const nazwaTabeli = process.env.DYNAMO_WAGA_TABLE ?? "Waga";

// GET – Pobiera wszystkie wpisy wagi
export async function GET() {
  try {
    const wynik = await klientDynamo.send(
      new ScanCommand({
        TableName: nazwaTabeli,
      })
    );

    const posortowane = (wynik.Items ?? []).sort((a, b) =>
      a.data.localeCompare(b.data)
    );

    return new Response(JSON.stringify(posortowane));
  } catch (e) {
    console.error("Błąd pobierania wagi:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
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
    console.error("Błąd dodawania wagi:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
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
    console.error("Błąd usuwania wagi:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
  }
}
