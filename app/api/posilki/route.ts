import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

function getKonfiguracjaAWS() {
  const region = process.env.MY_AWS_REGION;
  const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY;
  const nazwaTabeli = process.env.DYNAMO_TABLE;

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

  return { klientDynamo, nazwaTabeli };
}

export async function GET(request: Request) {
  try {
    const { klientDynamo, nazwaTabeli } = getKonfiguracjaAWS();
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");

    if (!data) {
      return NextResponse.json({ error: "Brak daty w zapytaniu" }, { status: 400 });
    }

    const wynik = await klientDynamo.send(
      new ScanCommand({
        TableName: nazwaTabeli,
      })
    );

    const items = (wynik.Items || []).filter((item) => item.data === data);

    return NextResponse.json(items);
  } catch (e) {
    console.error("❌ Błąd pobierania posiłków:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Błąd serwera" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const { klientDynamo, nazwaTabeli } = getKonfiguracjaAWS();
    const body = await request.json();
    const { nazwa, data, waga, kcalNa100g, kcalRazem } = body;

    if (!nazwa || !data || !waga || !kcalNa100g || !kcalRazem) {
      return NextResponse.json({ error: "Brakuje wymaganych pól" }, { status: 400 });
    }

    const nowyPosilek = {
      id: uuidv4(),
      nazwa,
      data,
      waga,
      kcalNa100g,
      kcalRazem,
    };

    await klientDynamo.send(
      new PutCommand({
        TableName: nazwaTabeli,
        Item: nowyPosilek,
      })
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("❌ Błąd dodawania posiłku:", e);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { klientDynamo, nazwaTabeli } = getKonfiguracjaAWS();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = searchParams.get("data");

    if (!id || !data) {
      return NextResponse.json({ error: "Brak wymaganych parametrów (id, data)" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("❌ Błąd usuwania posiłku:", e);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
