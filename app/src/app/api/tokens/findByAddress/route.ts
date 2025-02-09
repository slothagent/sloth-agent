import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { address } = await request.json();
    const client = await clientPromise;
    const db = client.db("tokens_db");
    const tokens = await db.collection('tokens').find({ tokenAddress: address }).toArray();
    return NextResponse.json(tokens);
}   