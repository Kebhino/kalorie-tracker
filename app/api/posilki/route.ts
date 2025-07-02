import { DynamoDBClient, QueryCommand, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const region = process.env.MY_AWS_REGION;
const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY;
const nazwaTabeli = process.env.DYNAMO_TABLE;

if (!region || !accessKeyId || !secretAccessKey || !nazwaTabeli) {
  console.log("Brakujące zmienne środowiskowe:");
  console.log("region:", region);
  console.log("accessKeyId:", accessKeyId);
  console.log("secretAccessKey:", secretAccessKey ? "***" : "brak");
  console.log("nazwaTabeli:", nazwaTabeli);
  throw new Error("❌ Brak wymaganych zmiennych środowiskowych");
}

const klientDynamo = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");

    if (!data) {
      return NextResponse.json({ error: "Brak daty w zapytaniu" }, { status: 400 });
    }

    const wynik = await klientDynamo.send(
      new QueryCommand({
        TableName: nazwaTabeli,
        KeyConditionExpression: "#d = :d",
        ExpressionAttributeNames: { "#d": "data" },
        ExpressionAttributeValues: { ":d": { S: data } },
      })
      
    );

    const items = Array.isArray(wynik.Items)
      ? wynik.Items.map((item) => ({
          id: item.id?.S,
          nazwa: item.nazwa?.S,
          data: item.data?.S,
          waga: item.waga ? Number(item.waga.N) : undefined,
          kcalNa100g: item.kcalNa100g ? Number(item.kcalNa100g.N) : undefined,
          kcalRazem: item.kcalRazem ? Number(item.kcalRazem.N) : undefined,
        }))
      : [];

    return NextResponse.json(items);
  } catch (e) {
    console.error("❌ Błąd API:", e); // <- tu pełny stacktrace
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Błąd serwera" }), {
      status: 500,
      });

  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nazwa, data, waga, kcalNa100g, kcalRazem } = body;

    if (!nazwa || !data || !waga || !kcalNa100g || !kcalRazem) {
      return NextResponse.json({ error: "Brakuje wymaganych pól" }, { status: 400 });
    }

    const id = uuidv4();

    await klientDynamo.send(
      new PutItemCommand({
        TableName: nazwaTabeli,
        Item: {
          id: { S: id },
          nazwa: { S: nazwa },
          data: { S: data },
          waga: { N: String(waga) },
          kcalNa100g: { N: String(kcalNa100g) },
          kcalRazem: { N: String(kcalRazem) },
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd API posiłków (POST):", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = searchParams.get("data");

    if (!id || !data) {
      return NextResponse.json({ error: "Brakuje ID lub daty" }, { status: 400 });
    }

    await klientDynamo.send(
      new DeleteItemCommand({
        TableName: nazwaTabeli,
        Key: {
          data: { S: data },
          id: { S: id },
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd API posiłków (DELETE):", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
