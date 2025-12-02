require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { TwitterApi } = require('twitter-api-v2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./database');
require('dotenv').config();
const fetch = require('node-fetch');
const { Readable } = require('stream');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Helper function to upload image to S3
async function uploadToS3(imageBuffer, contentType = 'image/png') {
  const fileName = `social-genie/${crypto.randomBytes(16).toString('hex')}.png`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: imageBuffer,
    ContentType: contentType
    // Note: ACL removed - bucket uses bucket policy for public access instead
  });

  try {
    await s3Client.send(command);
    // Construct the public URL
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
    return s3Url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow both backend and frontend origins
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Passport Google Strategy (Primary Authentication)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Create or update user in database
    const user = await database.createOrUpdateUser(profile);
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Passport Twitter Strategy (Secondary Authorization)
passport.use('twitter-link', new TwitterStrategy({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL || "http://localhost:3000/auth/twitter/callback",
  passReqToCallback: true
}, async (req, token, tokenSecret, profile, done) => {
  try {
    // Get current user from session (must be logged in with Google)
    const currentUser = req.user;
    if (!currentUser) {
      return done(new Error('No authenticated user found'), null);
    }

    // Link Twitter account to current user
    await database.linkTwitterAccount(currentUser.id, profile, { token, tokenSecret });
    
    return done(null, { success: true, twitterProfile: profile });
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    return done(error, null);
  }
}));

// Passport Instagram Strategy - DEPRECATED (Instagram Basic Display API no longer supported)
// Keeping manual token approach and Facebook Graph API instead
// passport.use('instagram-link', new InstagramStrategy({...}));

// Passport Facebook Strategy (for Instagram Graph API access)
passport.use('facebook-link', new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email', 'photos'],
  scope: ['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish', 'pages_manage_posts'],
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Get current user from session (must be logged in with Google)
    const currentUser = req.user;
    if (!currentUser) {
      return done(new Error('No authenticated user found'), null);
    }

    // Get Facebook Pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesResponse.json();

    // Get Instagram Business Accounts connected to pages
    let instagramAccounts = [];
    if (pagesData.data && pagesData.data.length > 0) {
      for (const page of pagesData.data) {
        const igResponse = await fetch(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
        const igData = await igResponse.json();
        
        if (igData.instagram_business_account) {
          // Get Instagram account details
          const igDetailsResponse = await fetch(`https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=id,username,profile_picture_url&access_token=${page.access_token}`);
          const igDetails = await igDetailsResponse.json();
          
          instagramAccounts.push({
            instagram_id: igDetails.id,
            username: igDetails.username,
            profile_picture: igDetails.profile_picture_url,
            page_id: page.id,
            page_name: page.name,
            page_access_token: page.access_token
          });
        }
      }
    }

    // Link Facebook/Instagram account to current user
    await database.linkFacebookAccount(currentUser.id, {
      facebook_id: profile.id,
      facebook_name: profile.displayName,
      access_token: accessToken,
      instagram_accounts: instagramAccounts
    });
    
    return done(null, { success: true, facebookProfile: profile, instagramAccounts });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    return done(error, null);
  }
}));

// Manual Instagram OAuth (alternative to passport-instagram for Instagram Graph API)
app.get('/auth/instagram-manual', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/?error=not_authenticated');
  
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_CALLBACK_URL)}&scope=user_profile,user_media&response_type=code`;
  res.redirect(authUrl);
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
// Google OAuth (Primary Authentication)
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account' // Force account selection every time
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed` }),
  async (req, res) => {
    // Check if user has completed onboarding (has brand profile)
    const brandProfile = await database.getBrandProfile(req.user.id);
    
    if (brandProfile) {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/onboarding`);
    }
  }
);

// Twitter OAuth (Secondary Authorization)
app.get('/auth/twitter', passport.authenticate('twitter-link'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter-link', { failureRedirect: `${process.env.FRONTEND_URL}/connect?error=twitter_auth_failed` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/connect?twitter_linked=true`);
  }
);

// Facebook OAuth (for Instagram Graph API access)
app.get('/auth/facebook', 
  passport.authenticate('facebook-link', { 
    scope: ['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish', 'pages_manage_posts']
  })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook-link', { failureRedirect: `${process.env.FRONTEND_URL}/connect?error=facebook_auth_failed` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/connect?facebook_linked=true`);
  }
);

// Instagram OAuth (Secondary Authorization)
app.get('/auth/instagram', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect(`${process.env.FRONTEND_URL}/?error=not_authenticated`);
  
  // Use Instagram Basic Display API
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_CALLBACK_URL)}&scope=user_profile,user_media&response_type=code`;
  res.redirect(authUrl);
});

app.get('/auth/instagram/callback', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.redirect(`${process.env.FRONTEND_URL}/?error=not_authenticated`);
    
    const code = req.query.code;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/connect?error=instagram_auth_failed`);

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_CALLBACK_URL,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Instagram token exchange failed:', tokenData);
      return res.redirect(`${process.env.FRONTEND_URL}/connect?error=instagram_token_failed`);
    }

    // Get user profile
    const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type&access_token=${tokenData.access_token}`);
    const profile = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('Instagram profile fetch failed:', profile);
      return res.redirect(`${process.env.FRONTEND_URL}/connect?error=instagram_profile_failed`);
    }

    // Save to database
    await database.linkInstagramAccount(req.user.id, profile, { access_token: tokenData.access_token });

    res.redirect(`${process.env.FRONTEND_URL}/connect?instagram_linked=true`);
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/connect?error=instagram_auth_failed`);
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/?error=logout_failed`);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect(process.env.FRONTEND_URL);
    });
  });
});

// Logout endpoint (POST for API calls)
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Protected route to check authentication
app.get('/api/user', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const twitterAccount = await database.getTwitterAccount(req.user.id);
      const instagramAccount = await database.getInstagramAccount(req.user.id);
      const facebookAccount = await database.getFacebookAccount(req.user.id);
      
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          avatar_url: req.user.avatar_url
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
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } else {
    res.json({ authenticated: false });
  }
});

// Brand Profile endpoints
app.post('/api/brand-profile', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const profileData = req.body;
    const result = await database.saveBrandProfile(req.user.id, profileData);
    
    res.json({ success: true, profile: result });
  } catch (error) {
    console.error('Error saving brand profile:', error);
    res.status(500).json({ error: 'Failed to save brand profile' });
  }
});

app.get('/api/brand-profile', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const profile = await database.getBrandProfile(req.user.id);
    
    if (profile) {
      res.json({
        organizationName: profile.organization_name,
        shortDescription: profile.short_description,
        targetDemographics: profile.target_demographics,
        targetPsychographics: profile.target_psychographics,
        marketingGoals: profile.marketing_goals,
        plan: profile.plan || 'premium'
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error fetching brand profile:', error);
    res.status(500).json({ error: 'Failed to fetch brand profile' });
  }
});

// Scheduled Posts endpoints
app.post('/api/scheduled-posts', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { platforms, caption, imageUrl, s3Url, scheduledTime } = req.body;
    
    const scheduledPost = await database.createScheduledPost(req.user.id, {
      platforms,
      caption,
      imageUrl,
      s3Url,
      scheduledTime
    });
    
    res.json({ success: true, post: scheduledPost });
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    res.status(500).json({ error: 'Failed to create scheduled post' });
  }
});

app.get('/api/scheduled-posts', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { startDate, endDate } = req.query;
    const posts = await database.getScheduledPosts(req.user.id, startDate, endDate);
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled posts' });
  }
});

app.get('/api/scheduled-posts/month/:year/:month', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    
    const posts = await database.getScheduledPosts(req.user.id, startDate, endDate);
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching monthly scheduled posts:', error);
    res.status(500).json({ error: 'Failed to fetch monthly scheduled posts' });
  }
});

app.delete('/api/scheduled-posts/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await database.deleteScheduledPost(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
    res.status(500).json({ error: 'Failed to delete scheduled post' });
  }
});

// Usage tracking endpoints
app.get('/api/usage', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const plan = await database.getUserPlan(req.user.id);
    const monthlyCount = await database.getMonthlyGenerationCount(req.user.id);
    
    const limits = {
      standard: 0,
      pro: 30,
      premium: 60
    };
    
    res.json({
      plan,
      used: monthlyCount,
      limit: limits[plan] || 60,
      remaining: (limits[plan] || 60) - monthlyCount
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
});

app.post('/api/track-generation', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { generationType } = req.body;
    await database.trackPostGeneration(req.user.id, generationType || 'ai');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking generation:', error);
    res.status(500).json({ error: 'Failed to track generation' });
  }
});

// Post tweet endpoint
app.post('/api/tweet', upload.single('image'), async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if Twitter account is linked
    const twitterAccount = await database.getTwitterAccount(req.user.id);
    if (!twitterAccount) {
      return res.status(400).json({ error: 'Twitter account not linked. Please link your Twitter account first.' });
    }

    const { text } = req.body;
    const imageFile = req.file;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Tweet text is required' });
    }

    if (text.length > 280) {
      return res.status(400).json({ error: 'Tweet text exceeds 280 characters' });
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
      const mediaUpload = await client.v1.uploadMedia(imageFile.buffer, {
        mimeType: imageFile.mimetype
      });
      mediaId = mediaUpload;
    }

    // Create tweet
    const tweetData = {
      text: text.trim()
    };

    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }

    const tweet = await client.v2.tweet(tweetData);

    // Save tweet to database
    await database.saveTweet(req.user.id, tweet.data);

    res.json({
      success: true,
      tweet: {
        id: tweet.data.id,
        text: tweet.data.text,
        created_at: tweet.data.created_at
      }
    });

  } catch (error) {
    console.error('Tweet posting error:', error);
    res.status(500).json({
      error: 'Failed to post tweet',
      details: error.message
    });
  }
});

// Get user's recent tweets
app.get('/api/tweets', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tweets = await database.getUserTweets(req.user.id, 10);
    res.json({
      success: true,
      tweets: tweets
    });

  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({
      error: 'Failed to fetch tweets',
      details: error.message
    });
  }
});

// Unlink Twitter account
app.post('/api/unlink-twitter', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await database.unlinkTwitterAccount(req.user.id);
    res.json({ success: true, message: 'Twitter account unlinked successfully' });

  } catch (error) {
    console.error('Error unlinking Twitter account:', error);
    res.status(500).json({
      error: 'Failed to unlink Twitter account',
      details: error.message
    });
  }
});

// Unlink Facebook account
app.post('/api/unlink-facebook', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await database.unlinkFacebookAccount(req.user.id);
    res.json({ success: true, message: 'Facebook account unlinked successfully' });

  } catch (error) {
    console.error('Error unlinking Facebook account:', error);
    res.status(500).json({
      error: 'Failed to unlink Facebook account',
      details: error.message
    });
  }
});

// Link Instagram account by accepting an Instagram access token (SSO-like)
// Expects: { access_token: "INSTAGRAM_ACCESS_TOKEN" }
app.post('/api/link-instagram', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: 'access_token is required' });

    // Fetch basic Instagram profile using Graph API
    // Docs: https://developers.facebook.com/docs/instagram-basic-display-api/reference/user
    const url = `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${encodeURIComponent(access_token)}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'Failed to fetch Instagram profile', details: text });
    }

    const profile = await resp.json();

    // Save to DB
    await database.linkInstagramAccount(req.user.id, profile, { access_token });

    return res.json({ success: true, instagram: profile });
  } catch (error) {
    console.error('Error /api/link-instagram:', error);
    return res.status(500).json({ error: 'Failed to link Instagram account', details: error.message });
  }
});

// Unlink Instagram account
app.post('/api/unlink-instagram', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    await database.unlinkInstagramAccount(req.user.id);
    res.json({ success: true, message: 'Instagram account unlinked' });
  } catch (error) {
    console.error('Error unlinking Instagram account:', error);
    res.status(500).json({ error: 'Failed to unlink Instagram account', details: error.message });
  }
});

// Get Instagram posts
app.get('/api/instagram-posts', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    const posts = await database.getUserInstagramPosts(req.user.id, 10);
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({ error: 'Failed to fetch Instagram posts', details: error.message });
  }
});

// Generate AI image with DALL-E and caption with GPT
app.post('/api/generate-content', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    // Check generation limits
    const userPlan = await database.getUserPlan(req.user.id);
    const monthlyCount = await database.getMonthlyGenerationCount(req.user.id);
    
    const limits = {
      standard: 0,
      pro: 30,
      premium: 60
    };
    
    const userLimit = limits[userPlan] || 60;
    
    if (monthlyCount >= userLimit) {
      return res.status(403).json({ 
        error: 'Generation limit reached', 
        message: `You have reached your monthly limit of ${userLimit} AI generations. Please upgrade your plan or wait until next month.`,
        plan: userPlan,
        used: monthlyCount,
        limit: userLimit
      });
    }

    const { prompt, caption_length } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const maxWords = caption_length || 30;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey || openaiKey === 'your_openai_api_key_here') {
      return res.status(500).json({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env file' });
    }

    // Check S3 configuration
    const hasAWSCreds = (process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) && 
                        (process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY);
    if (!process.env.S3_BUCKET_NAME || !hasAWSCreds) {
      return res.status(500).json({ error: 'S3 is not configured. Please add AWS credentials to .env file' });
    }

    // Generate image with DALL-E 3
    console.log('Generating image with DALL-E 3...');
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    const imageData = await imageResponse.json();
    
    if (!imageResponse.ok || !imageData.data || !imageData.data[0].url) {
      console.error('DALL-E error:', imageData);
      return res.status(500).json({ error: 'Failed to generate image', details: imageData.error?.message || 'Unknown error' });
    }

    const imageUrl = imageData.data[0].url;
    const revisedPrompt = imageData.data[0].revised_prompt || prompt;

    // Generate caption with GPT
    console.log('Generating caption with GPT...');
    const captionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a social media caption writer. Create an engaging caption in exactly ${maxWords} words or less. Include 3-5 relevant hashtags at the end. Make it catchy and engaging.`
          },
          {
            role: 'user',
            content: `Create a social media caption for this image: ${revisedPrompt}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const captionData = await captionResponse.json();
    
    if (!captionResponse.ok || !captionData.choices || !captionData.choices[0]) {
      console.error('GPT error:', captionData);
      return res.status(500).json({ error: 'Failed to generate caption', details: captionData.error?.message || 'Unknown error' });
    }

    const caption = captionData.choices[0].message.content.trim();

    // Track the generation
    await database.trackPostGeneration(req.user.id, 'ai');

    // Download image from OpenAI
    console.log('Downloading image from OpenAI...');
    const imageDownload = await fetch(imageUrl);
    if (!imageDownload.ok) {
      return res.status(500).json({ error: 'Failed to download generated image' });
    }

    const imageBuffer = await imageDownload.buffer();
    
    // Upload to S3
    console.log('Uploading image to S3...');
    const s3Url = await uploadToS3(imageBuffer, 'image/png');
    console.log('Image uploaded to S3:', s3Url);

    // Also convert to base64 for preview
    const imageBase64 = imageBuffer.toString('base64');

    // Return preview with S3 URL
    res.json({
      success: true,
      preview: true,
      image_url: s3Url, // S3 URL for permanent storage
      image_base64: `data:image/png;base64,${imageBase64}`, // For immediate preview
      caption: caption,
      revised_prompt: revisedPrompt,
      s3_url: s3Url // Store this for posting
    });

  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

// Confirm and post generated content
app.post('/api/post-generated', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    const { caption, image_base64, s3_url, platform, postAsStory } = req.body;
    
    if (!caption || (!image_base64 && !s3_url)) {
      return res.status(400).json({ error: 'Caption and image (base64 or S3 URL) are required' });
    }

    if (!platform || !['twitter', 'instagram', 'facebook'].includes(platform)) {
      return res.status(400).json({ error: 'Valid platform (twitter, instagram, or facebook) is required' });
    }

    // Get image buffer - either from base64 or download from S3
    let imageBuffer;
    if (image_base64) {
      // Remove data URL prefix if present
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (s3_url) {
      // Download from S3 URL
      const s3Download = await fetch(s3_url);
      if (!s3Download.ok) {
        return res.status(500).json({ error: 'Failed to download image from S3' });
      }
      imageBuffer = await s3Download.buffer();
    }

    if (platform === 'twitter') {
      // Post to Twitter
      const twitterAccount = await database.getTwitterAccount(req.user.id);
      if (!twitterAccount) {
        return res.status(400).json({ error: 'Twitter account not linked' });
      }

      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: twitterAccount.access_token,
        accessSecret: twitterAccount.access_token_secret,
      });

      // Upload media
      const mediaId = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });

      // Post tweet
      const tweet = await client.v2.tweet({
        text: caption.substring(0, 280), // Twitter limit
        media: { media_ids: [mediaId] }
      });

      // Save to database with S3 URL
      await database.saveTweet(req.user.id, {
        ...tweet.data,
        s3_url: s3_url || null
      });

      return res.json({
        success: true,
        platform: 'twitter',
        tweet: tweet.data,
        s3_url: s3_url
      });

    } else if (platform === 'instagram') {
      // Check for Instagram account (either via manual token or Facebook)
      const instagramAccount = await database.getInstagramAccount(req.user.id);
      const facebookAccount = await database.getFacebookAccount(req.user.id);
      
      if (!instagramAccount && !facebookAccount) {
        return res.status(400).json({ error: 'Instagram account not linked. Please connect via Facebook or manual token.' });
      }

      // If using Facebook Graph API, post via the API
      if (facebookAccount && facebookAccount.instagram_accounts && facebookAccount.instagram_accounts.length > 0) {
        const igAccount = facebookAccount.instagram_accounts[0]; // Use first Instagram account
        const pageAccessToken = igAccount.page_access_token;
        const igUserId = igAccount.instagram_id;

        try {
          // If no S3 URL, upload base64 image to S3 first
          let imageUrlToUse = s3_url;
          
          if (!imageUrlToUse && image_base64) {
            console.log('Uploading base64 image to S3 for Instagram...');
            const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            imageUrlToUse = await uploadToS3(imageBuffer, 'image/png');
            console.log('Image uploaded to S3:', imageUrlToUse);
          }

          if (!imageUrlToUse) {
            return res.status(400).json({ 
              error: 'No image URL available for Instagram. Please provide either s3_url or image_base64.' 
            });
          }

          // Check if posting as story
          if (postAsStory) {
            // Instagram Story API
            console.log('Posting Instagram Story...');
            
            // Step 1: Create story media container
            const storyPayload = {
              image_url: imageUrlToUse,
              media_type: 'STORIES',
              access_token: pageAccessToken
            };

            const containerResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igUserId}/media`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storyPayload)
              }
            );

            const containerData = await containerResponse.json();

            if (!containerResponse.ok || !containerData.id) {
              console.error('Instagram story container creation failed:', containerData);
              return res.status(500).json({ 
                error: 'Failed to create Instagram story container', 
                details: containerData.error?.message 
              });
            }

            // Step 2: Publish the story
            const publishResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  creation_id: containerData.id,
                  access_token: pageAccessToken
                })
              }
            );

            const publishData = await publishResponse.json();

            if (!publishResponse.ok || !publishData.id) {
              console.error('Instagram story publish failed:', publishData);
              return res.status(500).json({ 
                error: 'Failed to publish Instagram story', 
                details: publishData.error?.message 
              });
            }

            // Save to database with story flag
            await database.saveInstagramPost(req.user.id, {
              id: publishData.id,
              caption: caption,
              media_type: 'STORY',
              media_url: imageUrlToUse,
              permalink: `https://www.instagram.com/stories/${igAccount.instagram_username || 'story'}/${publishData.id}/`,
              is_story: true
            });

            return res.json({
              success: true,
              platform: 'instagram',
              message: 'Posted Instagram Story successfully!',
              post_id: publishData.id,
              s3_url: imageUrlToUse,
              isStory: true
            });

          } else {
            // Regular Instagram feed post
            // Step 1: Create media container
            const containerResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igUserId}/media`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  image_url: imageUrlToUse, // Use S3 URL
                  caption: caption,
                  access_token: pageAccessToken
                })
              }
            );

            const containerData = await containerResponse.json();

            if (!containerResponse.ok || !containerData.id) {
              console.error('Instagram container creation failed:', containerData);
              return res.status(500).json({ 
                error: 'Failed to create Instagram media container', 
                details: containerData.error?.message 
              });
            }

            // Step 2: Publish the container
            const publishResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  creation_id: containerData.id,
                  access_token: pageAccessToken
                })
              }
            );

            const publishData = await publishResponse.json();

            if (!publishResponse.ok || !publishData.id) {
              console.error('Instagram publish failed:', publishData);
              return res.status(500).json({ 
                error: 'Failed to publish to Instagram', 
                details: publishData.error?.message 
              });
            }

            // Save to database
            await database.saveInstagramPost(req.user.id, {
              id: publishData.id,
              caption: caption,
              media_type: 'IMAGE',
              media_url: imageUrlToUse,
              permalink: `https://www.instagram.com/p/${publishData.id}/`,
              is_story: false
            });

            return res.json({
              success: true,
              platform: 'instagram',
              message: 'Posted to Instagram successfully!',
              post_id: publishData.id,
              s3_url: imageUrlToUse
            });
          }

        } catch (error) {
          console.error('Instagram posting error:', error);
          return res.status(500).json({ 
            error: 'Failed to post to Instagram', 
            details: error.message 
          });
        }
      }

      // Fallback: Manual token (just save metadata)
      await database.saveInstagramPost(req.user.id, {
        id: `gen_${Date.now()}`,
        caption: caption,
        media_type: 'IMAGE',
        media_url: s3_url || null,
        permalink: null
      });

      return res.json({
        success: true,
        platform: 'instagram',
        message: 'Content saved. Note: Manual token accounts cannot post automatically - use Facebook connection for posting.',
        s3_url: s3_url
      });
    } else if (platform === 'facebook') {
      // Post to Facebook Page
      const facebookAccount = await database.getFacebookAccount(req.user.id);
      
      if (!facebookAccount) {
        return res.status(400).json({ error: 'Facebook account not linked. Please connect your Facebook account.' });
      }

      // Get the first Facebook page (you can modify this to let users select a page)
      const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${facebookAccount.access_token}`);
      const pagesData = await pagesResponse.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        return res.status(400).json({ 
          error: 'No Facebook pages found. You need to have a Facebook page to post.',
          hint: 'Create a Facebook page at https://www.facebook.com/pages/create'
        });
      }

      const page = pagesData.data[0]; // Use first page
      const pageAccessToken = page.access_token;
      const pageId = page.id;

      try {
        // If no S3 URL, we need to upload the base64 image to S3 first
        let imageUrlToUse = s3_url;
        
        if (!imageUrlToUse && image_base64) {
          console.log('Uploading base64 image to S3 for Facebook...');
          const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          imageUrlToUse = await uploadToS3(imageBuffer, 'image/png');
          console.log('Image uploaded to S3:', imageUrlToUse);
        }

        if (!imageUrlToUse) {
          return res.status(400).json({ 
            error: 'No image URL available. Please provide either s3_url or image_base64.' 
          });
        }

        // Check if posting as story
        if (postAsStory) {
          // Facebook Story API - Currently not supported, post as regular feed instead
          console.log('Note: Facebook Stories via API require specific page permissions. Posting as regular feed instead.');
          // Fall through to regular post logic below
        }
        
        // Regular Facebook feed post
        // Step 1: Upload photo to Facebook using the S3 URL
        console.log('Posting to Facebook page:', page.name, 'with image:', imageUrlToUse);
        const uploadResponse = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/photos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: imageUrlToUse, // Use S3 URL (Facebook requires publicly accessible URL)
              caption: caption,
              published: true,
              access_token: pageAccessToken
            })
          }
        );

        const uploadData = await uploadResponse.json();
        console.log('Facebook upload response:', uploadData);

        if (!uploadResponse.ok || !uploadData.id) {
          console.error('Facebook photo upload failed:', uploadData);
          return res.status(500).json({ 
            error: 'Failed to upload photo to Facebook', 
            details: uploadData.error?.message || 'Unknown error',
            fullError: uploadData.error
          });
        }

        console.log('Facebook post created successfully! Post ID:', uploadData.id);

        // Get the permalink for the post
        const postResponse = await fetch(
          `https://graph.facebook.com/v18.0/${uploadData.id}?fields=permalink_url&access_token=${pageAccessToken}`
        );
        const postData = await postResponse.json();

        // Save to database
        await database.saveFacebookPost(req.user.id, {
          id: uploadData.id,
          message: caption,
          permalink_url: postData.permalink_url || null,
          is_story: false
        });

        return res.json({
          success: true,
          platform: 'facebook',
          message: 'Posted to Facebook successfully!',
          post_id: uploadData.id,
          permalink: postData.permalink_url,
          page_name: page.name,
          s3_url: imageUrlToUse
        });

      } catch (error) {
        console.error('Facebook posting error:', error);
        return res.status(500).json({ 
          error: 'Failed to post to Facebook', 
          details: error.message 
        });
      }
    }

  } catch (error) {
    console.error('Error posting generated content:', error);
    res.status(500).json({ error: 'Failed to post content', details: error.message });
  }
});

// Get user stats
app.get('/api/stats', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const stats = await database.getUserStats(req.user.id);
    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to fetch user stats',
      details: error.message
    });
  }
});

// Get all user posts across all platforms
app.get('/api/posts', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const limit = parseInt(req.query.limit) || 50;
    const posts = await database.getAllUserPosts(req.user.id, limit);
    
    res.json({
      success: true,
      posts: posts,
      count: posts.length
    });

  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      error: 'Failed to fetch user posts',
      details: error.message
    });
  }
});

// Get analytics for a specific platform
app.get('/api/analytics/:platform', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { platform } = req.params;
    
    if (!['twitter', 'instagram', 'facebook'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    let analyticsData = {
      posts: 0,
      impressions: 0,
      engagements: 0,
      likes: 0,
      growthRate: '+0%',
      topPost: null
    };

    if (platform === 'twitter') {
      const twitterAccount = await database.getTwitterAccount(req.user.id);
      
      if (twitterAccount) {
        // Get user's tweets from database
        const tweets = await database.getUserTweets(req.user.id, 50);
        analyticsData.posts = tweets.length;

        // Fetch Twitter analytics from Twitter API
        try {
          const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: twitterAccount.access_token,
            accessSecret: twitterAccount.access_token_secret,
          });

          // Get user's own tweets with metrics
          const userTweets = await client.v2.userTimeline(twitterAccount.twitter_id, {
            max_results: 10,
            'tweet.fields': ['public_metrics', 'created_at']
          });

          let totalImpressions = 0;
          let totalLikes = 0;
          let totalRetweets = 0;
          let totalReplies = 0;
          let topPost = null;
          let maxEngagement = 0;

          for (const tweet of userTweets.data.data || []) {
            const metrics = tweet.public_metrics;
            const engagement = metrics.like_count + metrics.retweet_count + metrics.reply_count;
            
            totalImpressions += metrics.impression_count || 0;
            totalLikes += metrics.like_count;
            totalRetweets += metrics.retweet_count;
            totalReplies += metrics.reply_count;

            if (engagement > maxEngagement) {
              maxEngagement = engagement;
              topPost = {
                text: tweet.text,
                impressions: metrics.impression_count || 0,
                likes: metrics.like_count,
                retweets: metrics.retweet_count
              };
            }
          }

          analyticsData.impressions = totalImpressions;
          analyticsData.likes = totalLikes;
          analyticsData.retweets = totalRetweets;
          analyticsData.replies = totalReplies;
          analyticsData.engagements = totalLikes + totalRetweets + totalReplies;
          analyticsData.topPost = topPost;
        } catch (twitterError) {
          console.error('Twitter API error:', twitterError);
          // Use database data as fallback
        }
      }
    } else if (platform === 'instagram') {
      const facebookAccount = await database.getFacebookAccount(req.user.id);
      
      if (facebookAccount && facebookAccount.instagram_accounts && facebookAccount.instagram_accounts.length > 0) {
        const igAccount = facebookAccount.instagram_accounts[0];
        const pageAccessToken = igAccount.page_access_token;
        const igUserId = igAccount.instagram_id;

        try {
          // Get Instagram insights
          const mediaResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igUserId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=25&access_token=${pageAccessToken}`
          );
          const mediaData = await mediaResponse.json();

          if (mediaData.data) {
            analyticsData.posts = mediaData.data.length;
            
            let totalLikes = 0;
            let totalComments = 0;
            let topPost = null;
            let maxEngagement = 0;

            for (const post of mediaData.data) {
              const likes = post.like_count || 0;
              const comments = post.comments_count || 0;
              const engagement = likes + comments;

              totalLikes += likes;
              totalComments += comments;

              if (engagement > maxEngagement) {
                maxEngagement = engagement;
                topPost = {
                  caption: post.caption || '',
                  impressions: engagement * 10, // Estimate
                  likes: likes,
                  comments: comments
                };
              }
            }

            analyticsData.likes = totalLikes;
            analyticsData.comments = totalComments;
            analyticsData.shares = Math.floor(totalComments * 0.3); // Estimate
            analyticsData.engagements = totalLikes + totalComments;
            analyticsData.impressions = analyticsData.engagements * 10; // Estimate
            analyticsData.topPost = topPost;
          }
        } catch (igError) {
          console.error('Instagram API error:', igError);
        }
      }
    } else if (platform === 'facebook') {
      const facebookAccount = await database.getFacebookAccount(req.user.id);
      
      if (facebookAccount) {
        try {
          // Get Facebook pages
          const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${facebookAccount.access_token}`
          );
          const pagesData = await pagesResponse.json();

          if (pagesData.data && pagesData.data.length > 0) {
            const page = pagesData.data[0];
            const pageAccessToken = page.access_token;
            const pageId = page.id;

            // Get page posts
            const postsResponse = await fetch(
              `https://graph.facebook.com/v18.0/${pageId}/posts?fields=message,created_time,full_picture,likes.summary(true),comments.summary(true),shares&limit=25&access_token=${pageAccessToken}`
            );
            const postsData = await postsResponse.json();

            if (postsData.data) {
              analyticsData.posts = postsData.data.length;
              
              let totalLikes = 0;
              let totalComments = 0;
              let totalShares = 0;
              let topPost = null;
              let maxEngagement = 0;

              for (const post of postsData.data) {
                const likes = post.likes?.summary?.total_count || 0;
                const comments = post.comments?.summary?.total_count || 0;
                const shares = post.shares?.count || 0;
                const engagement = likes + comments + shares;

                totalLikes += likes;
                totalComments += comments;
                totalShares += shares;

                if (engagement > maxEngagement) {
                  maxEngagement = engagement;
                  topPost = {
                    text: post.message || '',
                    impressions: engagement * 15, // Estimate
                    likes: likes,
                    shares: shares
                  };
                }
              }

              analyticsData.likes = totalLikes;
              analyticsData.comments = totalComments;
              analyticsData.shares = totalShares;
              analyticsData.engagements = totalLikes + totalComments + totalShares;
              analyticsData.impressions = analyticsData.engagements * 15; // Estimate
              analyticsData.topPost = topPost;
            }
          }
        } catch (fbError) {
          console.error('Facebook API error:', fbError);
        }
      }
    }

    res.json({
      success: true,
      platform: platform,
      analytics: analyticsData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
});

// SPA routes
app.get(['/dashboard', '/link-accounts', '/link-twitter', '/link-instagram'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});
