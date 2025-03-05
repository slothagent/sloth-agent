import { NextResponse } from 'next/server';
import { AgentModel } from '@/models/agent';
import { TwitterAuthModel } from '@/models/twitterAuth';
import { Agent } from '@/models/agent';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = ['name','description','owner'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Prepare the data object with required fields
    const agentData: Agent = {
      name: body.name,
      slug: body.slug,
      ticker: body.ticker,
      tokenAddress: body.tokenAddress,
      network: body.network,
      owner: body.owner,
      description: body.description || '',
      imageUrl: body.imageUrl || '',
      agentLore: body.agentLore || '',
      personality: body.personality || '',
      knowledgeAreas: body.knowledgeAreas || '',
      categories: body.categories || [],
      twitterAuth: body.twitterAuth ? {
        accessToken: body.twitterAuth.accessToken || null,
        refreshToken: body.twitterAuth.refreshToken || null,
        expiresAt: body.twitterAuth.expiresAt || null,
        tokenType: body.twitterAuth.tokenType || null,
        scope: body.twitterAuth.scope || null
      } : undefined
    };

    // Create the agent
    const agentResult = await AgentModel.create(agentData);
    // Get the created agent with its Twitter auth
    const agent = await AgentModel.findById(agentResult.insertedId.toString());

    if (!agent) {
      throw new Error('Failed to create agent');
    }

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    
    // Handle MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key error')) {
        return NextResponse.json(
          { error: 'An agent with this ticker already exists' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const id = searchParams.get('id');
    const owner = searchParams.get('owner');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search');

    console.log('Fetching agents with params:', { symbol, id, owner, page, pageSize, search });

    // Get agent by ID
    if (id) {
      try {
        const agent = await AgentModel.findById(id);
        
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ 
          data: agent,
          metadata: {
            currentPage: 1,
            pageSize: 1,
            totalPages: 1,
            totalCount: 1
          }
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid agent ID' },
          { status: 400 }
        );
      }
    }

    // Get agent by symbol/ticker
    if (symbol) {
      const agent = await AgentModel.findByTicker(symbol);
      
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        data: agent,
        metadata: {
          currentPage: 1,
          pageSize: 1,
          totalPages: 1,
          totalCount: 1
        }
      });
    }

    // Get agents by owner
    if (owner) {
      const collection = await AgentModel.getCollection();
      const skip = (page - 1) * pageSize;
      
      // Count total agents for this owner
      const totalCount = await collection.countDocuments({ owner });
      
      if (totalCount === 0) {
        return NextResponse.json({
          data: [],
          metadata: {
            currentPage: page,
            pageSize,
            totalPages: 0,
            totalCount: 0
          }
        });
      }
      
      // Validate pagination
      if (skip >= totalCount) {
        return NextResponse.json({
          data: [],
          metadata: {
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            totalCount
          }
        });
      }
      
      // Get paginated agents for this owner
      const agents = await collection.find({ owner })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray();
      
      return NextResponse.json({
        data: agents,
        metadata: {
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount
        }
      });
    }

    // Search agents
    if (search) {
      const result = await AgentModel.findAll({
        page,
        limit: pageSize,
        search
      });
      
      return NextResponse.json({
        data: result.agents,
        metadata: result.metadata
      });
    }

    // Get all agents with pagination
    const result = await AgentModel.findAll({
      page,
      limit: pageSize
    });
    
    // If no agents found
    if (result.agents.length === 0) {
      return NextResponse.json({
        data: [],
        metadata: result.metadata
      });
    }
    
    return NextResponse.json({
      data: result.agents,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agents' },
      { status: 500 }
    );
  }
} 