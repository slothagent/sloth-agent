import { NextResponse } from 'next/server';
import { TokenModel } from '@/models/token';

interface CreateTokenData {
  name: string;
  address: string;
  curveAddress: string;
  owner: string;
  description?: string;
  ticker: string;
  imageUrl?: string;
  totalSupply: string;
  twitterUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  categories?: string[];
  network?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'address', 'owner', 'ticker', 'totalSupply', 'curveAddress'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Prepare the data object with required fields
    const tokenData: CreateTokenData = {
      name: body.name,
      address: body.address,
      owner: body.owner,
      ticker: body.ticker,
      totalSupply: "800000000",
      curveAddress: body.curveAddress,
      network: body.network,
      // Optional fields
      description: body.description || undefined,
      imageUrl: body.imageUrl || undefined,
      twitterUrl: body.twitterUrl || undefined,
      telegramUrl: body.telegramUrl || undefined,
      websiteUrl: body.websiteUrl || undefined,
      categories: body.categories || [],
    };

    // Create the token
    const tokenResult = await TokenModel.create(tokenData);

    // Get the created token
    const token = await TokenModel.findById(tokenResult.insertedId.toString());

    if (!token) {
      throw new Error('Failed to create token');
    }

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error('Error creating token:', error);
    
    // Handle MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key error')) {
        return NextResponse.json(
          { error: 'A token with this ticker already exists' },
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
    const address = searchParams.get('address');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search');

    console.log('Fetching tokens with params:', { address, page, pageSize, search });

    const collection = await TokenModel.getCollection();
    
    // First check if we have any tokens at all
    const totalCount = await collection.countDocuments();
    console.log('Total tokens in database:', totalCount);

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

    if (address) {
      // Get token by address
      const token = await TokenModel.findByAddress(address);
      console.log('Found token by address:', token ? 'yes' : 'no');
      
      if (!token) {
        return NextResponse.json(
          { error: 'Token not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        data: token,
        metadata: {
          currentPage: 1,
          pageSize: 1,
          totalPages: 1,
          totalCount: 1
        }
      });
    }

    if (search) {
      // Search tokens by name or ticker
      const tokens = await collection.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { ticker: { $regex: search, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 }).toArray();

      console.log('Found tokens by search:', tokens.length);

      return NextResponse.json({ 
        data: tokens,
        metadata: {
          currentPage: 1,
          pageSize: tokens.length,
          totalPages: 1,
          totalCount: tokens.length
        }
      });
    }

    // Get paginated tokens
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

    const tokens = await collection.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    console.log('Found paginated tokens:', tokens.length);

    return NextResponse.json({
      data: tokens,
      metadata: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount: totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
