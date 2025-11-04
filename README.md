# Social Genie - AI-Powered Social Media Management Platform

**A product by Agentic Genie**

Social Genie is a comprehensive social media management platform that enables users to schedule posts, generate AI-powered content, and manage multiple social media accounts from a single dashboard.

## Features

- 🔐 **Google OAuth Authentication** - Sign in with your Google account
- 🐦 **X Account Linking** - Authorize access to your X (Twitter) account
- 📸 **Instagram Integration** - Connect and manage your Instagram account
- 📝 **Text Posting** - Post tweets up to 280 characters
- 🖼️ **Image Upload** - Upload and post images with your content
- 🎨 **AI Image Generation** - Generate images using DALL-E 3 with GPT-4o-mini captions
- ☁️ **AWS S3 Storage** - Store generated images permanently in S3
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔗 **Unified Dashboard** - Manage multiple social accounts in one place
- 🛡️ **Security Features** - Rate limiting, CSRF protection, secure sessions
- 📊 **Tweet Analytics** - View likes, retweets, and replies
- ⚡ **Real-time Updates** - See your recent tweets instantly
- 🗄️ **Supabase Database** - Secure data storage and management
- 🔄 **Preview Before Posting** - Review AI-generated content before publishing

## Authentication Flow (Buffer.com Style)

1. **Sign in with Google** - Primary authentication using your Google account
2. **Link X Account** - Authorize access to your X (Twitter) account
3. **Start Posting** - Post tweets and images seamlessly

This approach provides better security and user experience compared to direct social media authentication.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v14 or higher) installed
2. **Google Cloud Console Account** for OAuth setup
3. **Twitter Developer Account** with API access
4. **Supabase Account** for database management
5. **OpenAI API Key** for AI image and caption generation
6. **AWS Account** for S3 storage (see `AWS_S3_SETUP_GUIDE.md`)

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
7. Copy your Client ID and Client Secret

### 2. Twitter API Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account if you don't have one
3. Create a new app in the Twitter Developer Portal
4. Fill in the required information:
   - **App Name**: Your app name (e.g., "Social Media Manager")
   - **App Description**: Brief description of your app
   - **Website URL**: Your website or `http://localhost:3000` for development
   - **Callback URL**: `http://localhost:3000/auth/twitter/callback`
5. Get your API credentials:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Bearer Token** (for API v2)
6. Configure app permissions to "Read and write"

### 3. Supabase Database Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. In your Supabase dashboard, go to the SQL Editor
3. Run the SQL commands from `supabase-schema.sql` to create the required tables
4. Go to Settings → API to get your project credentials:
   - **Project URL**
   - **Anon Key**
   - **Service Role Key**

### 4. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key and copy it
5. Add it to your `.env` file as `OPENAI_API_KEY`

### 5. AWS S3 Setup

**Follow the detailed guide in `AWS_S3_SETUP_GUIDE.md`**

Quick steps:
1. Create an AWS account at https://aws.amazon.com
2. Create an S3 bucket
3. Configure bucket for public read access
4. Create IAM user with S3 permissions
5. Generate access keys
6. Add credentials to `.env` file:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`

## Installation

### 1. Clone or Download

```bash
# If using git
git clone <your-repo-url>
cd twitter-posting-app

# Or download and extract the files
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your credentials:
   ```env
   # Google OAuth Configuration (Primary Authentication)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

   # Twitter API Configuration (Secondary Authorization)
   TWITTER_API_KEY=your_api_key_here
   TWITTER_API_SECRET=your_api_secret_here
   TWITTER_BEARER_TOKEN=your_bearer_token_here

   # Twitter OAuth Configuration (for account linking)
   TWITTER_CLIENT_ID=your_client_id_here
   TWITTER_CLIENT_SECRET=your_client_secret_here
   TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback

   # Instagram Configuration (Manual Token)
   INSTAGRAM_CLIENT_ID=your_instagram_client_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
   INSTAGRAM_CALLBACK_URL=http://localhost:3000/auth/instagram/callback

   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # OpenAI Configuration (for AI generation)
   OPENAI_API_KEY=your_openai_api_key_here

   # AWS S3 Configuration (for storing images)
   AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your_s3_bucket_name_here

   # Session Configuration
   SESSION_SECRET=your_very_secure_session_secret_here

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

### 4. Generate Session Secret

Generate a secure session secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any secure random string generator
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### 1. Sign In with Google

1. Open your browser and go to `http://localhost:3000`
2. Click "Sign in with Google"
3. Authorize the application with your Google account
4. You'll be redirected to the account linking page

### 2. Link Your X Account

1. On the "Connect Your X Account" page, click "Connect X Account"
2. Authorize the application on X (Twitter)
3. You'll be redirected back to the dashboard

### 3. Post Content

1. **Option A: Generate AI Content**
   - Enter a prompt in the "AI Image Generator" section
   - Set caption length (default: 30 words)
   - Click "Generate" to create an image with caption
   - Review the preview
   - Click "Post to X" or "Post to Instagram"

2. **Option B: Manual Post**
   - In the "Create New Post" section, type your tweet (up to 280 characters)
   - Optionally, click "Choose Image" to upload an image (max 5MB)
   - Click "Post Tweet" to publish

### 4. Manage Your Account

- View your recent tweets with engagement metrics
- Unlink your X account if needed
- View posting statistics and analytics

## Security Features

- **Google OAuth 2.0 Authentication** - Primary authentication with Google
- **X Account Linking** - Secure secondary authorization
- **Session Management** - Secure session handling with Supabase
- **Rate Limiting** - Prevents abuse and spam
- **File Upload Validation** - Image type and size validation
- **CSRF Protection** - Cross-site request forgery protection
- **Helmet.js** - Security headers
- **Input Validation** - Character limits and content validation
- **Row Level Security** - Database-level security with Supabase

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/twitter` - Initiate X account linking
- `GET /auth/twitter/callback` - X OAuth callback
- `GET /logout` - Logout user

### API
- `GET /api/user` - Get current user info and linked accounts
- `POST /api/tweet` - Post a new tweet
- `GET /api/tweets` - Get user's recent tweets
- `POST /api/unlink-twitter` - Unlink X account
- `GET /api/stats` - Get user posting statistics

## File Structure

```
social-media-manager/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   └── app.js              # Frontend JavaScript
├── server.js               # Express server
├── database.js             # Supabase database service
├── supabase-schema.sql     # Database schema
├── package.json            # Dependencies
├── env.example             # Environment variables template
└── README.md               # This file
```

## Troubleshooting

### Common Issues

1. **"Invalid Google Client ID" Error**
   - Verify your Google OAuth credentials in the `.env` file
   - Ensure your Google Cloud Console project has the correct redirect URIs

2. **"Invalid Twitter API Key" Error**
   - Verify your Twitter API keys in the `.env` file
   - Ensure your Twitter app has the correct permissions and callback URLs

3. **"Supabase Connection Failed" Error**
   - Check your Supabase URL and keys in the `.env` file
   - Ensure you've run the SQL schema in your Supabase project

4. **"Callback URL Mismatch" Error**
   - Check that your callback URLs in Google Cloud Console and Twitter Developer Portal match your `.env` file
   - Default URLs: 
     - Google: `http://localhost:3000/auth/google/callback`
     - Twitter: `http://localhost:3000/auth/twitter/callback`

5. **"Image Upload Failed" Error**
   - Ensure image is under 5MB
   - Check that it's a valid image format (JPG, PNG, GIF, etc.)

6. **"Session Expired" Error**
   - Clear your browser cookies and try logging in again
   - Check your `SESSION_SECRET` in `.env`

### Debug Mode

Set `NODE_ENV=development` in your `.env` file for detailed error messages.

## Production Deployment

### Environment Variables

For production, ensure you have:

1. **Secure Session Secret** - Use a strong, random string
2. **HTTPS URLs** - Update callback URLs to use HTTPS
3. **Environment Variables** - Set `NODE_ENV=production`
4. **Domain Configuration** - Update CORS origins

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong session secrets
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues:

1. Check the troubleshooting section
2. Verify your Twitter API setup
3. Check the console for error messages
4. Ensure all environment variables are set correctly

## Disclaimer

This application is for educational and personal use. Make sure to comply with Twitter's Terms of Service and API usage policies. The developers are not responsible for any misuse of this application.
#   s o c i a l - g e n i e 
 
 