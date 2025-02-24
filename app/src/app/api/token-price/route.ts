import { NextRequest, NextResponse } from "next/server";
import { createTokenPrice, getTokenPriceHistory, getLatestTokenPrice } from "@/app/models/tokenPrice";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAddress, price, transactionType, transactionHash } = body;

    if (!tokenAddress || !price || !transactionType || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createTokenPrice({
      tokenAddress,
      price,
      transactionType,
      transactionHash,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating token price:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tokenAddress = searchParams.get("tokenAddress");
    const timeRange = searchParams.get("timeRange");
    const latest = searchParams.get("latest");

    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    if (latest === "true") {
      const latestPrice = await getLatestTokenPrice(tokenAddress);
      return NextResponse.json({ success: true, data: latestPrice });
    }

    const prices = await getTokenPriceHistory(tokenAddress, timeRange || undefined);
    return NextResponse.json({ success: true, data: prices });
  } catch (error) {
    console.error("Error getting token price history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 