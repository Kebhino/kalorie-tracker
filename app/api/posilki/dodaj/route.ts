import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: "eu-central-1" });

export async function POST(req: Request) {
  const body = await req.json();
  const { produkty, kcalŁącznie, data } = body;

  if (!produkty || !kcalŁącznie || !data) {
    return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 });
  }

  const id = uuidv4();

  const item = {
    id: { S: id },
    data: { S: data },
    kcalŁącznie: { N: kcalŁącznie.toString() },
    produkty: { S: JSON.stringify(produkty) },
  };

  try {
    await client.send(new PutItemCommand({ TableName: "Posilki", Item: item }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Błąd zapisu do DynamoDB:", err);
    return NextResponse.json({ error: "Błąd zapisu" }, { status: 500 });
  }
}
