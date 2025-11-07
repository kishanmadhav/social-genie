# Migration to Unified Next.js Deployment - Setup Guide

## ✅ What's Been Done

### 1. **API Routes Created**
All backend functionality has been migrated to Next.js API routes in `frontend/app/api/`:

- ✅ `/api/auth/[...nextauth]/route.ts` - NextAuth.js OAuth (Google, Twitter, Facebook)
- ✅ `/api/user/route.ts` - Get current user info
- ✅ `/api/generate-content/route.ts` - AI image generation with DALL-E + GPT captions
- ✅ `/api/posts/route.ts` - Get user posts
- ✅ `/api/stats/route.ts` - Get dashboard stats
- ✅ `/api/usage/route.ts` - Get usage statistics
- ✅ `/api/scheduled-posts/route.ts` - Create, get, delete scheduled posts
- ✅ `/api/tweet/route.ts` - Post tweets with images

### 2. **Dependencies Installed**
```bash
- next-auth (OAuth management)
- @supabase/supabase-js (Database)
- twitter-api-v2 (Twitter posting)
- @aws-sdk/client-s3 (S3 uploads)
```

### 3. **Database Integration**
- ✅ Copied `database.js` to `frontend/lib/database.js`
- ✅ All API routes use the same Supabase client

### 4. **Frontend API Client Updated**
- ✅ Updated `frontend/lib/api.ts` to use local API routes (no more cross-origin requests!)
- ✅ OAuth redirects updated to use NextAuth

---

## 🔧 Setup Steps Required

### Step 1: Set Environment Variables in Vercel (Frontend Project)

Go to: https://vercel.com/kishan-madhavs-projects-1f348ecf/frontend/settings/environment-variables

Add these variables (copy values from your backend `.env.check` file):

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://frontend-eight-pied-40.vercel.app
NEXTAUTH_SECRET=TNUDh3MFiWBdEO419XS1v8upoS9zI7Ovv/DTDtS1AVA=

# Google OAuth
GOOGLE_CLIENT_ID=<copy from backend>
GOOGLE_CLIENT_SECRET=<copy from backend>

# Twitter OAuth 2.0
TWITTER_CLIENT_ID=<copy from backend>
TWITTER_CLIENT_SECRET=<copy from backend>

# Twitter API (for posting tweets)
TWITTER_API_KEY=<copy from backend>
TWITTER_API_SECRET=<copy from backend>
TWITTER_BEARER_TOKEN=<copy from backend>

# Facebook OAuth
FACEBOOK_APP_ID=<copy from backend>
FACEBOOK_APP_SECRET=<copy from backend>

# OpenAI API
OPENAI_API_KEY=<copy from backend>

# AWS S3
S3_BUCKET_NAME=<copy from backend>
AWS_REGION=<copy from backend>
AWS_ACCESS_KEY_ID=<copy from backend>
AWS_SECRET_ACCESS_KEY=<copy from backend>

# Supabase
SUPABASE_URL=<copy from backend>
SUPABASE_SERVICE_ROLE_KEY=<copy from backend>
DATABASE_URL=<copy from backend>
```

**Quick Copy Command** (Run this in your project root to see all values):
```powershell
Get-Content .env.check | Select-String "GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|TWITTER_CLIENT_ID|TWITTER_CLIENT_SECRET|TWITTER_API_KEY|TWITTER_API_SECRET|TWITTER_BEARER_TOKEN|FACEBOOK_APP_ID|FACEBOOK_APP_SECRET|OPENAI_API_KEY|S3_BUCKET_NAME|AWS_REGION|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL"
```

### Step 2: Update OAuth Callback URLs

#### Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. **Update Authorized redirect URIs** to:
   ```
   https://frontend-eight-pied-40.vercel.app/api/auth/callback/google
   ```
4. Save

#### Twitter Developer Portal
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Select your app → Settings → User authentication settings → Edit
3. **Update Callback URI / Redirect URL** to:
   ```
   https://frontend-eight-pied-40.vercel.app/api/auth/callback/twitter
   ```
4. **Update Website URL** to:
   ```
   https://frontend-eight-pied-40.vercel.app
   ```
5. Save

#### Facebook for Developers
1. Go to: https://developers.facebook.com/apps
2. Select your app → Facebook Login → Settings
3. **Update Valid OAuth Redirect URIs** to:
   ```
   https://frontend-eight-pied-40.vercel.app/api/auth/callback/facebook
   ```
4. Save

### Step 3: Deploy Frontend

```powershell
cd frontend
git add .
git commit -m "Migrate backend to Next.js API routes"
vercel --prod
```

Or push to GitHub and let Vercel auto-deploy:
```powershell
cd ..
git add .
git commit -m "Complete migration: unified Next.js deployment"
git push
```

---

## 🎯 Benefits of This Migration

### Before (Two Deployments):
- ❌ Frontend: `frontend-eight-pied-40.vercel.app`
- ❌ Backend: `sm-genie.vercel.app`
- ❌ CORS issues
- ❌ Cookie/session problems across domains
- ❌ 401 errors on API calls
- ❌ Complex OAuth callback management

### After (Single Deployment):
- ✅ **One domain**: `frontend-eight-pied-40.vercel.app`
- ✅ **No CORS issues** - everything on same origin
- ✅ **No session problems** - NextAuth handles it perfectly
- ✅ **No 401 errors** - proper authentication
- ✅ **Simple OAuth** - NextAuth manages all providers
- ✅ **Easier maintenance** - one codebase, one deployment

---

## 🧪 Testing After Deployment

1. **Test Login**:
   - Visit: https://frontend-eight-pied-40.vercel.app/connect
   - Click "Sign in with Google"
   - Should redirect to Google, then back to dashboard

2. **Test Image Generation**:
   - Go to: https://frontend-eight-pied-40.vercel.app/generator
   - Enter a prompt
   - Click "Generate"
   - Should work WITHOUT 401 errors!

3. **Test Twitter Connection**:
   - Go to dashboard → Connect Twitter
   - Should redirect to Twitter OAuth
   - After authorization, should link account

4. **Test API Endpoints**:
   ```powershell
   # Test user endpoint (should work when logged in)
   Invoke-RestMethod -Uri "https://frontend-eight-pied-40.vercel.app/api/user" -Method GET
   ```

---

## 📝 Next Steps After Deployment

1. ✅ Verify all OAuth providers work
2. ✅ Test image generation (no more 401!)
3. ✅ Test Twitter posting
4. ✅ Test scheduled posts
5. ⚠️ **IMPORTANT**: You can deprecate/delete the old backend deployment (`sm-genie.vercel.app`) once everything works

---

## 🆘 Troubleshooting

### If OAuth fails:
- Check callback URLs are exactly correct (including `/api/auth/callback/[provider]`)
- Verify environment variables are set in Vercel
- Check `NEXTAUTH_URL` matches your domain exactly
- Clear browser cookies and try again

### If image generation fails:
- Verify `OPENAI_API_KEY` is set
- Check AWS S3 credentials are correct
- Look at Vercel function logs for errors

### If "Not authenticated" errors:
- Make sure `NEXTAUTH_SECRET` is set
- Clear cookies and log in again
- Check that NextAuth is properly configured

---

## 🎉 Summary

You now have a **unified Next.js application** with:
- ✅ Frontend UI (React/Next.js)
- ✅ Backend API (Next.js API Routes)
- ✅ OAuth Authentication (NextAuth.js)
- ✅ Database (Supabase)
- ✅ AI Generation (OpenAI)
- ✅ Social Media Posting (Twitter, Instagram, Facebook)

**All on one domain, no CORS, no session issues!**
