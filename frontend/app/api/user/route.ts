import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const database = require('@/lib/database');

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ authenticated: false });
    }

    const userId = (session.user as any).id;
    
    const twitterAccount = await database.getTwitterAccount(userId);
    const instagramAccount = await database.getInstagramAccount(userId);
    const facebookAccount = await database.getFacebookAccount(userId);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId,
        email: session.user.email,
        name: session.user.name,
        avatar_url: session.user.image
      },
      twitterLinked: !!twitterAccount,
      twitterAccount: twitterAccount ? {
        username: twitterAccount.username,
        display_name: twitterAccount.display_name
      } : null,
      instagramLinked: !!instagramAccount,
      instagramAccount: instagramAccount ? {
        username: instagramAccount.username,
        account_type: instagramAccount.account_type
      } : null,
      facebookLinked: !!facebookAccount,
      facebookAccount: facebookAccount ? {
        facebook_name: facebookAccount.facebook_name,
        instagram_accounts: facebookAccount.instagram_accounts || []
      } : null
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
