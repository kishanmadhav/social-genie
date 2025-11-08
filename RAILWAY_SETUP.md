# Railway Deployment Setup Guide

## Quick Start

### Step 1: Connect GitHub Repository
1. Go to [railway.app](https://railway.app)
2. Create new project → Import from GitHub
3. Select `kishanmadhav/social-genie`
4. Railway will automatically detect `package.json` and create a service

### Step 2: Update OAuth Callback URLs

Before adding environment variables, update these in their respective consoles:

**Google OAuth** (https://console.cloud.google.com/):
- Add redirect URI: `https://YOUR_RAILWAY_DOMAIN/auth/google/callback`

**Twitter API** (https://developer.twitter.com/):
- Update callback URL: `https://YOUR_RAILWAY_DOMAIN/auth/twitter/callback`

**Facebook** (https://developers.facebook.com/):
- Add to Valid OAuth Redirect URIs: `https://YOUR_RAILWAY_DOMAIN/auth/facebook/callback`

### Step 3: Add Environment Variables to Railway

Go to **Railway Dashboard → Your Project → Settings → Variables**

Copy and paste all these variables:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://YOUR_RAILWAY_DOMAIN/auth/google/callback

TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=https://YOUR_RAILWAY_DOMAIN/auth/twitter/callback

INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_CALLBACK_URL=https://YOUR_RAILWAY_DOMAIN/auth/instagram/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://YOUR_RAILWAY_DOMAIN/auth/facebook/callback

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

SESSION_SECRET=your_session_secret_key

OPENAI_API_KEY=your_openai_api_key

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-north-1
S3_BUCKET_NAME=your_bucket_name

NODE_ENV=production
PORT=3000
```

### Step 4: Configure Build Command

In Railway Dashboard → Your Project → Settings → Build:
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

### Step 5: Get Your Railway Domain

1. Go to Railway Dashboard → Your Project
2. Click on your service (social-genie-api or similar)
3. In **Deployment** tab, find the domain like: `social-genie-api.up.railway.app`
4. Replace `YOUR_RAILWAY_DOMAIN` with this domain in all variables

### Step 6: Redeploy

After adding variables, Railway will auto-redeploy. Check:
- **Deployments tab** for build status
- **Logs** for any errors

---

## Checking Logs

**View logs in Railway:**
1. Dashboard → Project → Service
2. Click **Logs** tab
3. Look for startup messages like:
   ```
   ✓ Supabase client initialized successfully
   ========================================
   🚀 Social Genie Server Starting
   ========================================
   ```

### Health Check Endpoint

Once deployed, test with:
```bash
curl https://YOUR_RAILWAY_DOMAIN/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T...",
  "environment": "production",
  "database": "connected"
}
```

---

## Troubleshooting

### ❌ "Missing Supabase Configuration"

**Solution:**
1. Check Railway Variables are correctly set
2. Verify exact spelling of `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Restart deployment after adding variables

### ❌ "OAuth callback mismatch"

**Solution:**
1. Get exact Railway domain from Deployments tab
2. Update ALL OAuth providers (Google, Twitter, Facebook)
3. Make sure URLs use `https://` (not http)
4. Wait 5-10 mins for OAuth providers to sync

### ❌ "502 Bad Gateway"

**Solution:**
1. Check logs for error messages
2. Verify DATABASE variables are set
3. Verify PORT=3000 is set
4. Restart deployment

### ❌ "S3 upload fails"

**Solution:**
1. Verify AWS credentials are correct
2. Check S3 bucket policy allows public read
3. Verify bucket name is correct

---

## Frontend Deployment

If deploying Next.js frontend separately to Vercel:

1. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN
   ```

2. Deploy to Vercel from GitHub

---

## Monitoring

**Railway provides:**
- Real-time logs
- Deployment history
- Resource usage (CPU, Memory, Network)
- Automatic restart on crash

**To monitor:**
1. Dashboard → Your Project
2. Check **Logs** for errors
3. Check **Metrics** for performance

---

## Support

If you have issues:
1. Check Railway logs for error messages
2. Verify all environment variables are set
3. Check OAuth callback URLs match exactly
4. Restart deployment from Railway dashboard

Good luck! 🚀
