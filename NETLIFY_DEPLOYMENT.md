# 🚀 Social Genie - Complete Netlify Deployment Guide

## Overview
This guide walks you through deploying Social Genie entirely on Netlify using:
- **Frontend**: Next.js on Netlify
- **Backend**: Netlify Functions (Serverless)
- **Database**: Supabase PostgreSQL
- **Storage**: AWS S3

---

## 📋 Prerequisites

1. **GitHub Account** - Already have this ✅
2. **Netlify Account** - Free tier available
3. **Supabase Account** - Already configured ✅
4. **AWS Account** - Already configured ✅
5. **OAuth Credentials**:
   - Google OAuth
   - Twitter API v2
   - Facebook App
   - Instagram (via Facebook)

---

## 🔧 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

```powershell
cd c:\sm-genie

# Ensure you're on development or main branch
git checkout development

# Create netlify.toml (already created)
# Create netlify/functions/api.js (already created)

# Commit changes
git add netlify.toml netlify/functions/
git commit -m "Add Netlify configuration and serverless API"
git push origin development
```

---

### **Step 2: Create Netlify Account & Connect GitHub**

1. Go to https://netlify.com
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Netlify to access your repositories
5. Click **"New site from Git"**

---

### **Step 3: Configure Site Settings**

1. **Connect Repository**:
   - Repository: `social-genie`
   - Branch: `development` (for testing) or `main` (for production)

2. **Build Settings** (auto-detected, verify):
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`

3. **Functions**:
   - **Functions directory**: `netlify/functions`

---

### **Step 4: Configure Environment Variables**

In Netlify Dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"**
3. Add all these variables:

```
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-site.netlify.app/api/auth/google/callback

# Twitter API
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=https://your-site.netlify.app/api/auth/twitter/callback

# Facebook/Instagram
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://your-site.netlify.app/api/auth/facebook/callback
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_CALLBACK_URL=https://your-site.netlify.app/api/auth/instagram/callback

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name

# Session
SESSION_SECRET=your_session_secret_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Node
NODE_ENV=production
```

---

### **Step 5: Update OAuth Providers**

Update callback URLs in each OAuth provider:

**Google Console** (https://console.cloud.google.com):
- Add: `https://your-site.netlify.app/api/auth/google/callback`

**Twitter Developer** (https://developer.twitter.com):
- Add: `https://your-site.netlify.app/api/auth/twitter/callback`

**Facebook App** (https://developers.facebook.com):
- Add: `https://your-site.netlify.app/api/auth/facebook/callback`

**Instagram** (via Facebook):
- Add: `https://your-site.netlify.app/api/auth/instagram/callback`

---

### **Step 6: Deploy**

1. **Trigger Deploy**:
   - Push to your `development` or `main` branch
   - Netlify automatically builds and deploys

2. **Monitor Build**:
   - Go to **Deploys** tab
   - Watch build progress
   - Check build logs for errors

3. **Get Your Netlify URL**:
   - Format: `https://your-project-name.netlify.app`

---

### **Step 7: Test Your Deployment**

```bash
# Visit your site
https://your-site.netlify.app

# Test API health check
https://your-site.netlify.app/api/health

# Try signing in with Google
# Try posting content
# Check browser console for errors
```

---

## 🔍 Troubleshooting

### **Build Fails with "npm not found"**
- Add Node version to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18.17.0"
  NPM_VERSION = "9.6.7"
```

### **API Routes Not Working**
- Ensure `netlify/functions/api.js` exists
- Check function logs in Netlify dashboard
- Verify environment variables are set

### **OAuth Redirects Failing**
- Confirm callback URLs match in:
  - OAuth provider console
  - Environment variables
  - Frontend code

### **Database Connection Issues**
- Test Supabase connection with: `https://your-site.netlify.app/api/health`
- Check Supabase service role key is correct
- Verify IP allowlist in Supabase (should allow Netlify IPs)

---

## 📊 Monitor Your Deployment

1. **Netlify Dashboard**:
   - Real-time build status
   - Function performance
   - Environment variables
   - Deployment history

2. **Supabase Dashboard**:
   - Database logs
   - Query performance
   - Real-time subscriptions

3. **Browser DevTools**:
   - Console for errors
   - Network tab to see API calls
   - Storage for tokens/sessions

---

## 🚀 Production Deployment

Once testing is complete on `development` branch:

1. Merge `development` into `main`
2. Update OAuth callback URLs to production URL
3. Create production environment in Netlify
4. Deploy from `main` branch

---

## 📚 Additional Resources

- Netlify Functions: https://docs.netlify.com/functions/overview/
- Next.js on Netlify: https://www.netlify.com/with/nextjs/
- Supabase Docs: https://supabase.com/docs
- Serverless Functions: https://www.netlify.com/products/functions/

---

## ✅ Deployment Checklist

- [ ] GitHub repository ready
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] `development` branch selected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] netlify.toml in root
- [ ] netlify/functions/api.js created
- [ ] OAuth callback URLs updated
- [ ] First deployment triggered
- [ ] Site accessible
- [ ] API health check working
- [ ] OAuth sign-in tested
- [ ] Database connection verified
- [ ] Frontend loads correctly

---

Good luck with your deployment! 🎉
