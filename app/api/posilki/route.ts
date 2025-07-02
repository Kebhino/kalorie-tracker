import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const klientDynamo = new DynamoDBClient({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
  },
});

const nazwaTabeli = process.env.DYNAMO_TABLE!;

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

    const items = (wynik.Items || []).map((item) => ({
      id: item.id?.S,
      nazwa: item.nazwa?.S,
      data: item.data?.S,
      waga: Number(item.waga?.N),
      kcalNa100g: Number(item.kcalNa100g?.N),
      kcalRazem: Number(item.kcalRazem?.N),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Błąd API posiłków (GET):", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nazwa, data, waga, kcalNa100g, kcalRazem } = body;

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
