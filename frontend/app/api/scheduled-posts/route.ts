import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const database = require('@/lib/database');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { platforms, caption, imageUrl, s3Url, scheduledTime } = body;
    
    const scheduledPost = await database.createScheduledPost(userId, {
      platforms,
      caption,
      imageUrl,
      s3Url,
      scheduledTime
    });
    
    return NextResponse.json({ success: true, post: scheduledPost });
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    return NextResponse.json({ 
      error: 'Failed to create scheduled post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const posts = await database.getScheduledPosts(userId, startDate, endDate);
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch scheduled posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }
    
    await database.deleteScheduledPost(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
    return NextResponse.json({ 
      error: 'Failed to delete scheduled post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
