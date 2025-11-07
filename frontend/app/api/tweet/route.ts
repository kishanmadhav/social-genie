import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const database = require('@/lib/database');
const { TwitterApi } = require('twitter-api-v2');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if Twitter account is linked
    const twitterAccount = await database.getTwitterAccount(userId);
    if (!twitterAccount) {
      return NextResponse.json({ 
        error: 'Twitter account not linked. Please link your Twitter account first.' 
      }, { status: 400 });
    }

    const formData = await req.formData();
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File | null;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Tweet text is required' }, { status: 400 });
    }

    if (text.length > 280) {
      return NextResponse.json({ 
        error: 'Tweet text exceeds 280 characters' 
      }, { status: 400 });
    }

    // Initialize Twitter client with stored tokens
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: twitterAccount.access_token,
      accessSecret: twitterAccount.access_token_secret,
    });

    let mediaId = null;

    // Upload image if provided
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const mediaUpload = await client.v1.uploadMedia(buffer, {
        mimeType: imageFile.type
      });
      mediaId = mediaUpload;
    }

    // Create tweet
    const tweetData: any = {
      text: text.trim()
    };

    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }

    const tweet = await client.v2.tweet(tweetData);

    // Save tweet to database
    await database.saveTweet(userId, tweet.data);

    return NextResponse.json({
      success: true,
      tweet: {
        id: tweet.data.id,
        text: tweet.data.text,
        created_at: tweet.data.created_at
      }
    });

  } catch (error) {
    console.error('Tweet posting error:', error);
    return NextResponse.json({
      error: 'Failed to post tweet',
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
    const tweets = await database.getUserTweets(userId, 10);
    
    return NextResponse.json({ tweets });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tweets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
