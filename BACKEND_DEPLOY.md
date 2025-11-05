# Backend Deployment Guide - Social Genie

## Option 1: Railway (Recommended - Easiest)

### Step 1: Sign Up for Railway
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `kishanmadhav/social-genie`
4. Railway will detect it's a Node.js app

### Step 3: Configure Root Directory
Railway will automatically use the root directory (where `server.js` is located)

### Step 4: Add Environment Variables
Click on your service → "Variables" tab → "Add Variables"

**Copy these from your `.env` file:**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.up.railway.app/auth/google/callback

# Twitter API
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=https://your-app.up.railway.app/auth/twitter/callback

# Facebook/Instagram
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://your-app.up.railway.app/auth/facebook/callback
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_CALLBACK_URL=https://your-app.up.railway.app/auth/instagram/callback

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name

# Session
SESSION_SECRET=your_session_secret_here

# Server
PORT=3000
NODE_ENV=production
```

**Important:** Replace `https://your-app.up.railway.app` with your actual Railway URL (you'll get this after deployment)

### Step 5: Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete (usually 2-3 minutes)
3. Your backend URL will be: `https://your-app-name.up.railway.app`

### Step 6: Get Your Railway URL
1. In your Railway dashboard, click on your service
2. Go to "Settings" tab
3. Under "Domains", you'll see your Railway URL
4. Copy this URL

### Step 7: Update Callback URLs
Now update the callback URLs in your environment variables:
1. Go back to "Variables" tab
2. Update these variables with your actual Railway URL:
   - `GOOGLE_CALLBACK_URL`
   - `TWITTER_CALLBACK_URL`
   - `FACEBOOK_CALLBACK_URL`
   - `INSTAGRAM_CALLBACK_URL`
3. Railway will automatically redeploy

### Step 8: Update OAuth Providers
Update callback URLs in all OAuth provider consoles:

**Google Console:**
- Go to https://console.cloud.google.com/
- APIs & Services → Credentials
- Edit your OAuth 2.0 Client ID
- Add: `https://your-app.up.railway.app/auth/google/callback`

**Twitter Developer Portal:**
- Go to https://developer.twitter.com/
- Your app → Settings
- Add: `https://your-app.up.railway.app/auth/twitter/callback`

**Facebook Developer Console:**
- Go to https://developers.facebook.com/
- Your app → Settings → Basic
- Add: `https://your-app.up.railway.app/auth/facebook/callback`

---

## Option 2: Render

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `kishanmadhav/social-genie`

### Step 3: Configure Service
- **Name:** social-genie-backend
- **Region:** Choose closest to you
- **Branch:** main
- **Root Directory:** Leave blank (uses root)
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** Free

### Step 4: Add Environment Variables
Click "Advanced" → Add all environment variables from above

### Step 5: Deploy
Click "Create Web Service"

Your backend will be at: `https://social-genie-backend.onrender.com`

---

## Option 3: Heroku

### Step 1: Install Heroku CLI
```bash
npm install -g heroku
```

### Step 2: Login
```bash
heroku login
```

### Step 3: Create App
```bash
cd c:\sm-genie
heroku create social-genie-backend
```

### Step 4: Set Environment Variables
```bash
heroku config:set GOOGLE_CLIENT_ID=your_value
heroku config:set GOOGLE_CLIENT_SECRET=your_value
# ... add all other environment variables
```

### Step 5: Deploy
```bash
git push heroku main
```

Your backend will be at: `https://social-genie-backend.herokuapp.com`

---

## After Backend Deployment

### Update Frontend Environment Variable

Once you have your backend URL, update your Vercel frontend:

```bash
cd c:\sm-genie\frontend
vercel env add NEXT_PUBLIC_API_URL production
# Enter your backend URL: https://your-app.up.railway.app
vercel --prod
```

### Update Backend CORS

Your backend `server.js` already has CORS configured, but make sure it includes your Vercel URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app',
    'https://your-custom-domain.com'  // if you have one
  ],
  credentials: true
}));
```

Push the update:
```bash
git add server.js
git commit -m "Update CORS for production"
git push origin main
```

Railway/Render will auto-redeploy.

---

## Testing Your Deployment

1. Visit your Vercel frontend URL
2. Click "Get Started" or "Login"
3. Try Google OAuth login
4. Connect social media accounts
5. Test creating a post

---

## Troubleshooting

### "Failed to fetch" errors
- Check `NEXT_PUBLIC_API_URL` in Vercel is correct
- Verify backend is running (visit backend URL in browser)
- Check browser console for CORS errors

### OAuth redirect errors
- Verify all callback URLs match your backend URL
- Check OAuth provider settings
- Ensure callback URLs have `/auth/[provider]/callback`

### Database connection errors
- Verify Supabase credentials are correct
- Check Supabase URL is accessible
- Ensure service role key is set

### Build errors
- Check Railway/Render build logs
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (14+)

---

## Cost Estimates

**Railway:**
- Free tier: $5 credit/month
- After free tier: ~$5-10/month for small usage
- Includes 500 hours of runtime

**Render:**
- Free tier available (spins down after inactivity)
- Paid: $7/month for always-on

**Heroku:**
- No free tier anymore
- Eco: $5/month
- Basic: $7/month

**Recommended:** Start with Railway free tier!

---

## Quick Deploy Commands

After everything is set up, deploy updates with:

```bash
# Commit changes
git add .
git commit -m "Update backend"
git push origin main

# Railway/Render auto-deploys from GitHub
# Or for Heroku:
git push heroku main
```

---

Ready to deploy? Start with **Railway** - it's the easiest! 🚀
