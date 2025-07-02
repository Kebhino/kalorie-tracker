import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const klientDynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.MY_AWS_REGION,
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
    },
  })
);

const nazwaTabeli = process.env.DYNAMO_TABLE!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return new Response(JSON.stringify({ error: "Brak daty w zapytaniu" }), {
      status: 400,
    });
  }

  try {
    const wynik = await klientDynamo.send(
      new QueryCommand({
        TableName: nazwaTabeli,
        KeyConditionExpression: "#d = :d",
        ExpressionAttributeNames: { "#d": "data" },
        ExpressionAttributeValues: { ":d": data },
      })
    );

    const dane = Array.isArray(wynik.Items) ? wynik.Items : [];
    return new Response(JSON.stringify(dane));
  } catch (e) {
    console.error("❌ Błąd pobierania:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nazwa, waga, kcalNa100g, kcalRazem, data } = body;

    if (!nazwa || !waga || !kcalNa100g || !kcalRazem || !data) {
      return new Response(
        JSON.stringify({
          error: "Brakuje wymaganych pól (nazwa, waga, kcalNa100g, kcalRazem, data)",
        }),
        { status: 400 }
      );
    }

    const nowyPosilek = {
      id: uuidv4(),
      nazwa,
      waga: Number(waga),
      kcalNa100g: Number(kcalNa100g),
      kcalRazem: Number(kcalRazem),
      data,
    };

    await klientDynamo.send(
      new PutCommand({
        TableName: nazwaTabeli,
        Item: nowyPosilek,
      })
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error("❌ Błąd dodawania:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const data = searchParams.get("data");

  if (!id || !data) {
    return new Response(
      JSON.stringify({ error: "Brakuje parametrów 'id' lub 'data'" }),
      { status: 400 }
    );
  }

  try {
    await klientDynamo.send(
      new DeleteCommand({
        TableName: nazwaTabeli,
        Key: { data, id },
      })
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error("❌ Błąd usuwania:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
  }
}
