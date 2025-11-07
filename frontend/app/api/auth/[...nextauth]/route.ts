import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

const database = require('@/lib/database');

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile"
        }
      }
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "tweet.read tweet.write users.read offline.access"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      authorization: {
        params: {
          scope: "email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish"
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          // Check if user exists, create or update
          const existingUser = await database.findUserByEmail(user.email);
          
          if (existingUser) {
            // Update user info
            await database.updateUser(existingUser.id, {
              name: user.name,
              email: user.email,
              picture: user.image
            });
            user.id = existingUser.id;
          } else {
            // Create new user
            const newUser = await database.createUser({
              name: user.name,
              email: user.email,
              googleId: account.providerAccountId,
              picture: user.image
            });
            user.id = newUser.id;
          }
        } else if (account?.provider === 'twitter') {
          // For Twitter linking - user must be logged in first
          // This will be handled by a separate link flow
          return true;
        } else if (account?.provider === 'facebook') {
          // For Facebook linking - user must be logged in first
          return true;
        }
        
        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
          provider: account.provider
        };
      }
      
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string
        },
        accessToken: token.accessToken,
        provider: token.provider
      };
    }
  },
  
  pages: {
    signIn: '/connect',
    error: '/connect',
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
