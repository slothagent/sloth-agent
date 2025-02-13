import { NextResponse } from 'next/server';
import { getAgentById } from '@/hooks/myAgent';

// GET /api/agent/[id] - Get a single agent by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAgentById(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
} 