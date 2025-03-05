import { NextRequest, NextResponse } from "next/server";
import { createTransaction, getTransactionHistory, getLatestTransaction, getPaginatedTransactions, calculateTotalVolume } from "@/models/transactions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAddress, userAddress, price, amountToken, transactionType, transactionHash, totalSupply, marketCap, network, fundingRaised } = body;

    if (!tokenAddress || !userAddress || !price || !amountToken || !transactionType || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createTransaction({
      from: tokenAddress,
      to: userAddress,
      amount: amountToken,
      price,
      transactionType,
      transactionHash,
      timestamp: new Date(),
      totalValue: price * amountToken,
      supply: totalSupply,
      marketCap: marketCap,
      network: network,
      fundingRaised: fundingRaised
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
    const totalVolume = searchParams.get("totalVolume");

    if (totalVolume) {
      const allTransactions = await calculateTotalVolume(timeRange || undefined);
      return NextResponse.json({ success: true, data: allTransactions });
    }
    
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
