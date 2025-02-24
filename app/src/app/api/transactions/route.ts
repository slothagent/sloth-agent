import { NextRequest, NextResponse } from "next/server";
import { createTransaction, getTransactionHistory, getLatestTransaction, getPaginatedTransactions } from "@/models/transactions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAddress, userAddress, price, amountToken, transactionType, transactionHash } = body;

    if (!tokenAddress || !userAddress || !price || !amountToken || !transactionType || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createTransaction({
      tokenAddress,
      userAddress,
      price,
      amountToken,
      transactionType,
      transactionHash,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating transaction:", error);
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // If no specific filters are provided, return paginated transactions
    if (!tokenAddress && !timeRange && !latest) {
      const paginatedResult = await getPaginatedTransactions(page, limit);
      return NextResponse.json({ success: true, ...paginatedResult });
    }

    // Handle existing specific queries
    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    if (latest === "true") {
      const latestTransaction = await getLatestTransaction(tokenAddress);
      return NextResponse.json({ success: true, data: latestTransaction });
    }

    const transactions = await getTransactionHistory(tokenAddress, timeRange || undefined);
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error getting transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 