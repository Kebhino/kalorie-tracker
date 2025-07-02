import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
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

const nazwaTabeli = process.env.DYNAMO_TABLE!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data"); // format: "2025-07-02"

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

    return new Response(JSON.stringify(wynik.Items ?? []));
  } catch (e) {
    console.error("Błąd pobierania:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nazwa, kalorie, data } = body;

  if (!nazwa || !kalorie || !data) {
    return new Response(
      JSON.stringify({ error: "Brakuje wymaganych pól (nazwa, kalorie, data)" }),
      { status: 400 }
    );
  }

  const nowyPosilek = {
    id: uuidv4(),
    nazwa,
    kalorie,
    data,
  };

  try {
    await klientDynamo.send(
      new PutCommand({
        TableName: nazwaTabeli,
        Item: nowyPosilek,
      })
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error("Błąd dodawania:", e);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
    });
  }
}
