import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError, PrismaClientValidationError, PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { getAgentBySymbol, getAllAgents, getPaginatedAgents, searchAgents } from '@/hooks/myAgent';

interface TwitterAuthData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface AgentData {
  name: string;
  ticker: string;
  address: string;
  curveAddress: string;
  owner: string;
  description: string | null;
  systemType: string | null;
  imageUrl: string | null;
  agentLore: string | null;
  personality: string | null;
  communicationStyle: string | null;
  knowledgeAreas: string | null;
  tools: string[];
  examples: string | null;
  twitterAuth?: {
    create: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    }
  };
}

export async function POST(req: Request) {
  try {
    // Check if request body exists
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

    // Validate body is not null and is an object
    if (!body || typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['name', 'ticker', 'address', 'curveAddress', 'owner'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof body.name !== 'string' || 
        typeof body.ticker !== 'string' || 
        typeof body.address !== 'string' || 
        typeof body.curveAddress !== 'string' || 
        typeof body.owner !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types. All required fields must be strings.' },
        { status: 400 }
      );
    }

    // Prepare the data object with required fields
    const agentData: AgentData = {
      name: body.name,
      ticker: body.ticker,
      address: body.address,
      curveAddress: body.curveAddress,
      owner: body.owner,
      // Optional fields with null checks
      description: body.description || null,
      systemType: body.systemType || null,
      imageUrl: body.imageUrl || null,
      agentLore: body.agentLore || null,
      personality: body.personality || null,
      communicationStyle: body.communicationStyle || null,
      knowledgeAreas: body.knowledgeAreas || null,
      tools: Array.isArray(body.tools) ? body.tools : [],
      examples: body.examples || null,
    };

    // If twitterAuth is provided, include it in the create operation
    if (body.twitterAuth) {
      const { accessToken, refreshToken, expiresAt } = body.twitterAuth as TwitterAuthData;
      agentData.twitterAuth = {
        create: {
          accessToken,
          refreshToken,
          expiresAt: new Date(expiresAt),
        }
      };
    }

    const agent = await prisma.agent.create({
      data: agentData,
      include: {
        twitterAuth: true
      }
    });

    if (!agent) {
      throw new Error('Failed to create agent');
    }

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: unknown) {
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
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: errorMessage },
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
    const symbol = searchParams.get('symbol');

    if (symbol) {
      const agent = await getAgentBySymbol(symbol);
      return NextResponse.json({ success: true, data: agent });
    }

    if (searchTerm) {
      const agents = await searchAgents(searchTerm);
      return NextResponse.json({ success: true, data: agents });
    }

    // Handle pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    if (searchParams.has('page') || searchParams.has('pageSize')) {
      const { agents, total } = await getPaginatedAgents(page, pageSize);
      const response = NextResponse.json({ 
        success: true, 
        data: agents, 
        metadata: {
          currentPage: page,
          pageSize,
          totalItems: total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
      
      // Cache for 1 minute on client side
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
      
      return response;
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