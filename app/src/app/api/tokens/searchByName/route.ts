import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name } = await request.json();
        
        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Invalid search term' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("tokens_db");
        
        // Create a case-insensitive regular expression for partial matches
        const searchRegex = new RegExp(name, 'i');
        
        const tokens = await db.collection('tokens')
            .find({ 
                name: searchRegex 
            })
            .limit(10) // Limit results to prevent overwhelming responses
            .toArray();

        return NextResponse.json({
            success: true,
            data: tokens
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search tokens' },
            { status: 500 }
        );
    }
}   