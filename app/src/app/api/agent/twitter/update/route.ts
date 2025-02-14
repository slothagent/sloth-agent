import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { agentId, twitterAuth } = await request.json();

    if (!agentId || !twitterAuth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update or create Twitter auth data
    const updatedTwitterAuth = await prisma.twitterAuth.upsert({
      where: {
        agentId: agentId,
      },
      update: {
        accessToken: twitterAuth.accessToken,
        refreshToken: twitterAuth.refreshToken,
        expiresAt: new Date(twitterAuth.expiresAt),
      },
      create: {
        agentId: agentId,
        accessToken: twitterAuth.accessToken,
        refreshToken: twitterAuth.refreshToken,
        expiresAt: new Date(twitterAuth.expiresAt),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTwitterAuth
    });

  } catch (error) {
    console.error('Error updating Twitter auth:', error);
    return NextResponse.json({ error: 'Failed to update Twitter auth' }, { status: 500 });
  }
} 