import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError, PrismaClientValidationError, PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { getAllAgents, getPaginatedAgents, searchAgents } from '@/hooks/myAgent';

export async function POST(req: Request) {
  try {
    // Add validation for request body
    if (!req.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object' },
        { status: 400 }
      );
    }

    const requiredFields = ['name', 'ticker', 'address', 'curveAddress', 'owner'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name: body.name,
        description: body.description,
        ticker: body.ticker,
        systemType: body.systemType,
        imageUrl: body.imageUrl,
        agentLore: body.agentLore,
        personality: body.personality,
        communicationStyle: body.communicationStyle,
        knowledgeAreas: body.knowledgeAreas,
        tools: body.tools || [],
        examples: body.examples,
        twitterUsername: body.twitterUsername,
        twitterEmail: body.twitterEmail,
        twitterPassword: body.twitterPassword,
        address: body.address,
        curveAddress: body.curveAddress,
        owner: body.owner
      },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      switch (error.code) {
        case 'P2002':
          return NextResponse.json(
            { error: 'An agent with this ticker already exists' },
            { status: 400 }
          );
        case 'P2003':
          return NextResponse.json(
            { error: 'Invalid data provided' },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            { error: `Database error: ${error.code}` },
            { status: 500 }
          );
      }
    } else if (error instanceof PrismaClientValidationError) {
      // Handle validation errors
      return NextResponse.json(
        { error: 'Invalid data format provided' },
        { status: 400 }
      );
    } else if (error instanceof PrismaClientInitializationError) {
      // Handle database connection errors
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }
    
    // Handle any other errors
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// GET /api/agent - Get all agents or search agents
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Handle search query
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const agents = await searchAgents(searchTerm);
      return NextResponse.json({ success: true, data: agents });
    }

    // Handle pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    if (searchParams.has('page') || searchParams.has('pageSize')) {
      const { agents, total } = await getPaginatedAgents(page, pageSize);
      return NextResponse.json({ 
        success: true, 
        data: agents, 
        metadata: {
          currentPage: page,
          pageSize,
          totalItems: total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    }

    // Get all agents if no query parameters
    const agents = await getAllAgents();
    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
} 