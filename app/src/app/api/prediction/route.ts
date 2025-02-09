import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch data from the external prediction service
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PREDICTION}/prediction`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
        console.log(response);
      throw new Error('Failed to fetch prediction data');
    }

    const data = await response.json();

    // Return the prediction data
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching prediction data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prediction data' },
      { status: 500 }
    );
  }
}
