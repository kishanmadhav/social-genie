# Setting Up Environment Variables for Vercel Backend

Your backend is deployed at: **https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app**

## Option 1: Using Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/kishan-madhavs-projects-1f348ecf/sm-genie/settings/environment-variables

2. Add each variable below by clicking "Add" for each one:

### Required Environment Variables:

**Google OAuth:**
- `GOOGLE_CLIENT_ID` = Your Google Client ID
- `GOOGLE_CLIENT_SECRET` = Your Google Client Secret
- `GOOGLE_CALLBACK_URL` = `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/google/callback`

**Twitter OAuth:**
- `TWITTER_API_KEY` = Your Twitter API Key
- `TWITTER_API_SECRET` = Your Twitter API Secret
- `TWITTER_CLIENT_ID` = Your Twitter Client ID
- `TWITTER_CLIENT_SECRET` = Your Twitter Client Secret
- `TWITTER_CALLBACK_URL` = `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/twitter/callback`

**Instagram/Facebook:**
- `INSTAGRAM_CLIENT_ID` = Your Instagram Client ID
- `INSTAGRAM_CLIENT_SECRET` = Your Instagram Client Secret
- `INSTAGRAM_CALLBACK_URL` = `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/instagram/callback`
- `FACEBOOK_APP_ID` = Your Facebook App ID
- `FACEBOOK_APP_SECRET` = Your Facebook App Secret
- `FACEBOOK_CALLBACK_URL` = `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/facebook/callback`

**Supabase:**
- `SUPABASE_URL` = Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase Service Role Key

**OpenAI:**
- `OPENAI_API_KEY` = Your OpenAI API Key

**AWS S3:**
- `AWS_ACCESS_KEY_ID` = Your AWS Access Key
- `AWS_SECRET_ACCESS_KEY` = Your AWS Secret Key
- `AWS_REGION` = Your AWS Region (e.g., eu-north-1)
- `S3_BUCKET_NAME` = Your S3 Bucket Name

**Session & Config:**
- `SESSION_SECRET` = Your session secret (random string)
- `PORT` = `3000`
- `NODE_ENV` = `production`

3. After adding all variables, click "Save"

4. Redeploy your backend:
```bash
cd c:\sm-genie
vercel --prod
```

## Option 2: Using Vercel CLI (Faster)

Run these commands one by one:

```bash
cd c:\sm-genie

# Google OAuth
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_CALLBACK_URL production

# Twitter OAuth
vercel env add TWITTER_API_KEY production
vercel env add TWITTER_API_SECRET production
vercel env add TWITTER_CLIENT_ID production
vercel env add TWITTER_CLIENT_SECRET production
vercel env add TWITTER_CALLBACK_URL production

# Instagram/Facebook
vercel env add INSTAGRAM_CLIENT_ID production
vercel env add INSTAGRAM_CLIENT_SECRET production
vercel env add INSTAGRAM_CALLBACK_URL production
vercel env add FACEBOOK_APP_ID production
vercel env add FACEBOOK_APP_SECRET production
vercel env add FACEBOOK_CALLBACK_URL production

# Supabase
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# OpenAI
vercel env add OPENAI_API_KEY production

# AWS S3
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add S3_BUCKET_NAME production

# Session & Config
vercel env add SESSION_SECRET production
vercel env add PORT production
vercel env add NODE_ENV production
```

For each command, paste the corresponding value from your `.env` file when prompted.

## Next: Update Frontend to Use Backend

```bash
cd c:\sm-genie\frontend
vercel env add NEXT_PUBLIC_API_URL production
```

When prompted, enter: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app`

Then redeploy frontend:
```bash
vercel --prod
```

## Update OAuth Callback URLs

### Google Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add to "Authorized redirect URIs":
   - `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/google/callback`

### Twitter Developer Portal
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Edit your app settings
3. Add to callback URLs:
   - `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/twitter/callback`

### Facebook Developer Console
1. Go to: https://developers.facebook.com/apps
2. Edit your app settings
3. Add to Valid OAuth Redirect URIs:
   - `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/facebook/callback`

### Instagram
1. In Facebook Developer Console
2. Update redirect URI:
   - `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/instagram/callback`

## Update CORS in Backend

The backend needs to allow your frontend domain. This is already handled if you add the frontend URL.

## Testing

1. Visit your frontend: https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app
2. Try logging in with Google
3. Test connecting social media accounts
4. Try generating and posting content

## Troubleshooting

### "Environment variables not found"
- Make sure all variables are added in Vercel dashboard
- Redeploy after adding variables: `vercel --prod`

### OAuth errors
- Verify callback URLs are updated in all OAuth providers
- Check that callback URLs exactly match (no trailing slashes)

### CORS errors
- Frontend URL must be in backend CORS origins
- Both frontend and backend should use HTTPS

### API connection errors
- Check frontend `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is responding at the URL

## Quick Reference

**Backend URL:** https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app
**Frontend URL:** https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app

**Backend Dashboard:** https://vercel.com/kishan-madhavs-projects-1f348ecf/sm-genie
**Frontend Dashboard:** https://vercel.com/kishan-madhavs-projects-1f348ecf/frontend
