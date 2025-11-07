import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const database = require('@/lib/database');

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    // Get stats from database
    const totalPosts = await database.getTotalPosts(userId);
    const scheduledPosts = await database.getScheduledPostsCount(userId);
    const monthlyGenerations = await database.getMonthlyGenerationCount(userId);
    const engagement = await database.getTotalEngagement(userId);
    
    return NextResponse.json({
      totalPosts,
      scheduledPosts,
      monthlyGenerations,
      engagement
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
