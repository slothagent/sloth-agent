import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { name } = await request.json();
    const client = await clientPromise;
    const db = client.db("tokens_db");
    const tokens = await db.collection('tokens').find({ name: name }).toArray();
    return NextResponse.json(tokens);
}   