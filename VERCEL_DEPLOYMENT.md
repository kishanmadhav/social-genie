# Vercel Deployment Guide for Social Genie

This guide will help you deploy Social Genie to Vercel with both backend and frontend.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed (optional but recommended)
3. All API keys and credentials ready (Google, Twitter, Facebook, OpenAI, AWS S3, Supabase)

## Project Structure

Social Genie consists of two deployments:
- **Backend**: Express.js API (root directory)
- **Frontend**: Next.js application (frontend directory)

## Deployment Steps

### Step 1: Deploy Backend (Express API)

1. **Push your code to GitHub** (already done)

2. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your `social-genie` repository
   - Select the **root directory** for deployment

3. **Configure Backend Project**
   - **Project Name**: `social-genie-api` (or your preferred name)
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: Leave empty or use `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables** (CRITICAL)
   
   Go to Project Settings → Environment Variables and add:

   ```
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/auth/google/callback

   # Twitter OAuth
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   TWITTER_CALLBACK_URL=https://your-backend.vercel.app/auth/twitter/callback

   # Facebook OAuth
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_CALLBACK_URL=https://your-backend.vercel.app/auth/facebook/callback

   # Instagram OAuth
   INSTAGRAM_CLIENT_ID=your_instagram_client_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
   INSTAGRAM_CALLBACK_URL=https://your-backend.vercel.app/auth/instagram/callback

   # Session
   SESSION_SECRET=your_random_session_secret

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # AWS S3
   S3_BUCKET_NAME=your_s3_bucket_name
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   
   # Frontend URL (will be updated after frontend deployment)
   FRONTEND_URL=https://your-frontend.vercel.app

   # Server
   PORT=3000
   NODE_ENV=production
   ```

5. **Deploy Backend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-backend.vercel.app`

### Step 2: Deploy Frontend (Next.js)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import the same `social-genie` repository again

2. **Configure Frontend Project**
   - **Project Name**: `social-genie` (or your preferred name)
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   
   Go to Project Settings → Environment Variables:

   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```
   
   Replace `https://your-backend.vercel.app` with your actual backend URL from Step 1.

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL: `https://your-frontend.vercel.app`

### Step 3: Update Backend Environment Variables

1. Go to your **Backend** project on Vercel
2. Go to Settings → Environment Variables
3. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
4. Redeploy the backend (Deployments → ... → Redeploy)

### Step 4: Update OAuth Callback URLs

You need to update callback URLs in all your OAuth provider dashboards:

#### Google Cloud Console
- **Authorized redirect URIs**:
  - `https://your-backend.vercel.app/auth/google/callback`
- **Authorized JavaScript origins**:
  - `https://your-backend.vercel.app`
  - `https://your-frontend.vercel.app`

#### Twitter Developer Portal
- **Callback URLs**:
  - `https://your-backend.vercel.app/auth/twitter/callback`
- **Website URL**:
  - `https://your-frontend.vercel.app`

#### Facebook Developer Console
- **Valid OAuth Redirect URIs**:
  - `https://your-backend.vercel.app/auth/facebook/callback`
- **App Domains**:
  - `your-backend.vercel.app`
  - `your-frontend.vercel.app`

#### Instagram (if using separate OAuth)
- **Valid OAuth Redirect URIs**:
  - `https://your-backend.vercel.app/auth/instagram/callback`

### Step 5: Update Frontend API Calls

The frontend is already configured to use `NEXT_PUBLIC_API_URL` environment variable, but verify that all API calls in the frontend use this variable instead of hardcoded localhost URLs.

### Step 6: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Test Google OAuth login
3. Test linking Twitter, Facebook, Instagram accounts
4. Test creating posts
5. Test AI content generation
6. Test scheduling posts

## Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Update `server.js` CORS configuration to include your Vercel frontend URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

### Issue: OAuth Callbacks Fail
**Solution**: 
- Double-check all callback URLs in OAuth providers match your Vercel URLs exactly
- Ensure HTTPS is used (not HTTP)
- Check that environment variables are set correctly

### Issue: Session Not Persisting
**Solution**: 
- Ensure `SESSION_SECRET` is set
- Verify that cookies are allowed for your domain
- Check that `credentials: true` is set in CORS

### Issue: Database Connection Fails
**Solution**:
- Verify Supabase URL and key in environment variables
- Check Supabase project is active and accessible

### Issue: S3 Upload Fails
**Solution**:
- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure bucket policy allows public read access

### Issue: Build Fails
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## Environment Variables Checklist

Backend (17 variables):
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ GOOGLE_CALLBACK_URL
- ✅ TWITTER_API_KEY
- ✅ TWITTER_API_SECRET
- ✅ TWITTER_BEARER_TOKEN
- ✅ TWITTER_CALLBACK_URL
- ✅ FACEBOOK_APP_ID
- ✅ FACEBOOK_APP_SECRET
- ✅ FACEBOOK_CALLBACK_URL
- ✅ INSTAGRAM_CLIENT_ID
- ✅ INSTAGRAM_CLIENT_SECRET
- ✅ INSTAGRAM_CALLBACK_URL
- ✅ SESSION_SECRET
- ✅ OPENAI_API_KEY
- ✅ S3_BUCKET_NAME
- ✅ AWS_REGION
- ✅ AWS_ACCESS_KEY_ID
- ✅ AWS_SECRET_ACCESS_KEY
- ✅ SUPABASE_URL
- ✅ SUPABASE_KEY
- ✅ FRONTEND_URL
- ✅ NODE_ENV

Frontend (1 variable):
- ✅ NEXT_PUBLIC_API_URL

## Using Vercel CLI (Alternative Method)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd /path/to/social-genie
vercel --prod

# Deploy frontend
cd frontend
vercel --prod
```

## Custom Domains (Optional)

1. Go to your Vercel project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update all OAuth callback URLs to use custom domain

## Monitoring & Logs

- **View Logs**: Vercel Dashboard → Your Project → Deployments → View Function Logs
- **Analytics**: Vercel Dashboard → Analytics
- **Performance**: Vercel Dashboard → Speed Insights

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Check OAuth provider settings

## Production Checklist

Before going live:
- ✅ All environment variables configured
- ✅ OAuth providers updated with production URLs
- ✅ Database accessible from Vercel
- ✅ S3 bucket configured and accessible
- ✅ Test all authentication flows
- ✅ Test content creation and posting
- ✅ Test AI generation
- ✅ Monitor error logs for 24 hours
- ✅ Set up custom domain (optional)
- ✅ Configure rate limiting appropriately
- ✅ Review and update CORS settings

## Security Notes

1. Never commit `.env` files
2. Use strong `SESSION_SECRET`
3. Regularly rotate API keys
4. Monitor usage and costs (AWS, OpenAI)
5. Set up Vercel's IP restrictions if needed
6. Enable 2FA on all service accounts
7. Review and update security headers in Helmet.js

## Scaling Considerations

- Vercel automatically scales serverless functions
- Monitor AWS S3 costs
- Monitor OpenAI API usage
- Consider implementing request queuing for high load
- Use Vercel's Edge Functions for critical paths (optional)

---

**Need Help?** 
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
