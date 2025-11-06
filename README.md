# Social Genie# Social Genie



**A product by Agentic Genie****A product by Agentic Genie**



AI-powered social media management platform for scheduling posts, generating content, and managing Twitter, Instagram, and Facebook accounts from a single dashboard.AI-powered social media management platform for scheduling posts, generating content, and managing Twitter, Instagram, and Facebook accounts from a single dashboard.



## Features## Features



- 🔐 Google OAuth Authentication- 🔐 Google OAuth Authentication

- 🐦 Twitter/X Integration- 🐦 Twitter/X Integration

- 📸 Instagram & Facebook Support- 📸 Instagram & Facebook Support

- 🎨 AI Content Generation (DALL-E 3 + GPT-4)- 🎨 AI Content Generation (DALL-E 3 + GPT-4)

- 📅 Smart Post Scheduling- � Smart Post Scheduling

- 📊 Analytics Dashboard- 📊 Analytics Dashboard

- ☁️ AWS S3 Storage- ☁️ AWS S3 Storage

- 🗄️ Supabase Database- 🗄️ Supabase Database



## Quick Start## Quick Start



### Prerequisites### Prerequisites

- Node.js (v18+)- Node.js (v18+)

- Google, Twitter, Facebook developer accounts- Google, Twitter, Facebook developer accounts

- Supabase account- Supabase account

- OpenAI API key- OpenAI API key

- AWS S3 bucket- AWS S3 bucket



### Installation### Installation



```bash```bash

# Clone repository# Clone repository

git clone https://github.com/kishanmadhav/social-genie.gitgit clone https://github.com/kishanmadhav/social-genie.git

cd social-geniecd social-genie



# Install backend dependencies# Install backend dependencies

npm installnpm install



# Install frontend dependencies# Install frontend dependencies

cd frontendcd frontend

npm installnpm install

``````



### Configuration### Configuration



1. Copy `.env.example` to `.env` and fill in your credentials1. Copy `.env.example` to `.env` and fill in your credentials

2. Set up OAuth redirect URIs in provider consoles2. Set up OAuth redirect URIs in provider consoles

3. Configure Supabase database (see `supabase-schema.sql`)3. Configure Supabase database (see `supabase-schema.sql`)



### Run Locally### Run Locally



```bash```bash

# Terminal 1 - Backend# Terminal 1 - Backend

npm startnpm start



# Terminal 2 - Frontend# Terminal 2 - Frontend

cd frontendcd frontend

npm run devnpm run dev

``````



Visit `http://localhost:3001`Visit `http://localhost:3001`



## Deployment## Deployment



### Vercel (Recommended)### Vercel (Recommended)



**Frontend:****Frontend:**

```bash```bash

cd frontendcd frontend

vercel --prodvercel --prod

``````



**Backend:****Backend:**

```bash```bash

vercel --prodvercel --prod

``````



Update environment variables in Vercel dashboard after deployment.Update environment variables in Vercel dashboard after deployment.



## Tech Stack## Tech Stack



**Frontend:****Frontend:**

- Next.js 14 (App Router)- Next.js 14 (App Router)

- TypeScript- TypeScript

- Tailwind CSS- Tailwind CSS

- React Context- React Context



**Backend:****Backend:**

- Express.js- Express.js

- Passport.js (OAuth)- Passport.js (OAuth)

- Twitter API v2- Twitter API v2

- Instagram Graph API- Instagram Graph API

- Facebook Graph API- Facebook Graph API



**Services:****Services:**

- Supabase (Database)- Supabase (Database)

- AWS S3 (Storage)- AWS S3 (Storage)

- OpenAI (DALL-E 3, GPT-4)- OpenAI (DALL-E 3, GPT-4)

- Vercel (Hosting)- Vercel (Hosting)



## Environment Variables## Environment Variables



### Backend (.env)### Backend (.env)

```env```env

# OAuth# OAuth

GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET=

GOOGLE_CALLBACK_URL=GOOGLE_CALLBACK_URL=



TWITTER_API_KEY=TWITTER_API_KEY=

TWITTER_API_SECRET=TWITTER_API_SECRET=

TWITTER_CLIENT_ID=TWITTER_CLIENT_ID=

TWITTER_CLIENT_SECRET=TWITTER_CLIENT_SECRET=

TWITTER_CALLBACK_URL=TWITTER_CALLBACK_URL=



FACEBOOK_APP_ID=FACEBOOK_APP_ID=

FACEBOOK_APP_SECRET=FACEBOOK_APP_SECRET=

FACEBOOK_CALLBACK_URL=FACEBOOK_CALLBACK_URL=



INSTAGRAM_CLIENT_ID=INSTAGRAM_CLIENT_ID=

INSTAGRAM_CLIENT_SECRET=INSTAGRAM_CLIENT_SECRET=

INSTAGRAM_CALLBACK_URL=INSTAGRAM_CALLBACK_URL=



# Database# Database

SUPABASE_URL=SUPABASE_URL=

SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY=



# AI# AI

OPENAI_API_KEY=OPENAI_API_KEY=



# Storage# Storage

AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY=

AWS_REGION=AWS_REGION=

S3_BUCKET_NAME=S3_BUCKET_NAME=



# Config# Config

SESSION_SECRET=SESSION_SECRET=

PORT=3000PORT=3000

NODE_ENV=developmentNODE_ENV=development

``````



### Frontend (.env.local)### Frontend (.env.local)

```env```env

NEXT_PUBLIC_API_URL=http://localhost:3000NEXT_PUBLIC_API_URL=http://localhost:3000

``````



## Project Structure## Project Structure



``````

social-genie/social-genie/

├── frontend/          # Next.js frontend├── frontend/          # Next.js frontend

│   ├── app/          # App router pages│   ├── app/          # App router pages

│   ├── components/   # React components│   ├── components/   # React components

│   └── lib/          # API utilities│   └── lib/          # API utilities

├── public/           # Static assets (legacy)├── public/           # Static assets (legacy)

├── server.js         # Express backend├── server.js         # Express backend

├── database.js       # Supabase integration├── database.js       # Supabase integration

└── package.json      # Backend dependencies└── package.json      # Backend dependencies

``````



## License## License



MIT License - See LICENSE file for detailsMIT License - See LICENSE file for details



## Support## Support



For issues and questions:For issues and questions:

- GitHub: https://github.com/kishanmadhav/social-genie- GitHub: https://github.com/kishanmadhav/social-genie

- Documentation: See LIVE_URLS.md for deployment info- Documentation: See LIVE_URLS.md for deployment info

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