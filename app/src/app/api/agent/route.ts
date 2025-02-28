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

    // If twitterAuth is provided, create it
    // if (body.twitterAuth) {
    //   const { accessToken, refreshToken, expiresAt } = body.twitterAuth;
    //   if (accessToken && refreshToken && expiresAt) {
    //     await TwitterAuthModel.create({
    //       agentId: agentResult.insertedId.toString(),
    //       accessToken,
    //       refreshToken,
    //       expiresAt: new Date(expiresAt),
    //     });
    //   }
    // }

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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search');

    console.log('Fetching agents with params:', { symbol, page, pageSize, search });

    const collection = await AgentModel.getCollection();
    
    // First check if we have any agents at all
    const totalCount = await collection.countDocuments();
    console.log('Total agents in database:', totalCount);

    if (totalCount === 0) {
      return NextResponse.json({
        data: [],
        metadata: {
          currentPage: 1,
          pageSize,
          totalPages: 0,
          totalCount: 0
        }
      });
    }

    if (symbol) {
      // Get agent by symbol/ticker
      const agent = await collection.findOne({ ticker: symbol.toUpperCase() });
      console.log('Found agent by symbol:', agent ? 'yes' : 'no');
      
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }
      // Get Twitter auth information
      const twitterAuth = await TwitterAuthModel.findByAgentId(agent._id.toString());
      return NextResponse.json({ 
        data: { ...agent, twitterAuth },
        metadata: {
          currentPage: 1,
          pageSize: 1,
          totalPages: 1,
          totalCount: 1
        }
      });
    }

    if (search) {
      // Search agents by name or ticker
      const agents = await collection.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { ticker: { $regex: search, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 }).toArray();

      console.log('Found agents by search:', agents.length);

      // Get Twitter auth for each agent
      const agentsWithTwitterAuth = await Promise.all(
        agents.map(async (agent) => {
          const twitterAuth = await TwitterAuthModel.findByAgentId(agent._id.toString());
          return { ...agent, twitterAuth };
        })
      );

      return NextResponse.json({ 
        data: agentsWithTwitterAuth,
        metadata: {
          currentPage: 1,
          pageSize: agents.length,
          totalPages: 1,
          totalCount: agents.length
        }
      });
    }

    // Get paginated agents
    const skip = (page - 1) * pageSize;
    
    // Validate pagination
    if (skip >= totalCount) {
      return NextResponse.json({
        data: [],
        metadata: {
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount: totalCount
        }
      });
    }

    const agents = await collection.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    console.log('Found paginated agents:', agents.length);

    // Get Twitter auth for each agent
    const agentsWithTwitterAuth = await Promise.all(
      agents.map(async (agent) => {
        const twitterAuth = await TwitterAuthModel.findByAgentId(agent._id.toString());
        return { ...agent, twitterAuth };
      })
    );

    return NextResponse.json({
      data: agentsWithTwitterAuth,
      metadata: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount: totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agents' },
      { status: 500 }
    );
  }
} 