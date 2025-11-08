# Railway Frontend Deployment Guide

## Current Status ✅

- **Backend**: Deployed to Railway at `https://social-genie-production.up.railway.app`
- **Database**: Connected and working ✅
- **Frontend**: Ready to deploy (Dockerfile configured and tested)

## Frontend Deployment Steps

### Option 1: Auto-Deploy via Railway Dashboard (RECOMMENDED)

1. **Go to Railway Dashboard**
   - URL: `https://railway.com/project/c67fd0cc-4b80-474a-ae70-12efef775a5d`

2. **Add New Service**
   - Click "+ Add Service" button
   - Select "GitHub Repo"
   - Search for `social-genie` repository
   - Click "Deploy Now"

3. **Configure Service**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   - Go to Variables tab
   - Add: `NEXT_PUBLIC_API_URL` = `https://social-genie-production.up.railway.app`
   - Add: `NODE_ENV` = `production`
   - Add: `PORT` = `3000`

5. **Deploy**
   - Click "Deploy" button
   - Wait for build to complete (~2-3 minutes)
   - Once deployed, Railway will provide a URL like `https://frontend-xxxx.up.railway.app`

### Option 2: Deploy via Railway CLI

```bash
cd c:\sm-genie\frontend

# Link to the existing Railway project
railway link

# Select workspace: "Kishan Madhav Ag's Projects"
# Select project: "successful-purpose"

# Set environment variable
railway variables add NEXT_PUBLIC_API_URL https://social-genie-production.up.railway.app

# Deploy
railway up --detach
```

### Option 3: Update OAuth Callback URLs

Once the frontend is deployed, update OAuth providers with new production URLs:

**Google OAuth:**
- Add redirect URI: `https://frontend-[YOUR-ID].up.railway.app/auth/google/callback`

**Twitter:**
- Add callback URL: `https://frontend-[YOUR-ID].up.railway.app/auth/twitter/callback`

**Facebook:**
- Add to Valid OAuth Redirect URIs: `https://frontend-[YOUR-ID].up.railway.app/auth/facebook/callback`

**Instagram:**
- Add callback: `https://frontend-[YOUR-ID].up.railway.app/auth/instagram/callback`

## Verify Deployment

Once deployed, test the frontend:

```bash
# Test health endpoint
curl https://social-genie-production.up.railway.app/health

# Should see:
# {"status":"ok","timestamp":"...","environment":"production","database":"connected"}

# Access frontend
# https://frontend-[YOUR-ID].up.railway.app
```

## Troubleshooting

### Build Fails
- Check that `package.json` exists in frontend directory
- Verify Node.js version compatibility (v18+)
- Check build logs in Railway dashboard

### Environment Variable Not Set
- Verify `NEXT_PUBLIC_API_URL` is set in Railway Variables
- Rebuild the service for changes to take effect

### Frontend Can't Connect to Backend
- Verify backend is running: `https://social-genie-production.up.railway.app/health`
- Check that `NEXT_PUBLIC_API_URL` points to correct backend URL
- Check browser console for CORS errors

## Architecture

```
User Browser
    ↓
Frontend (Next.js) - https://frontend-xxxx.up.railway.app
    ↓
Backend (Express) - https://social-genie-production.up.railway.app
    ↓
Database (Supabase) - https://pyetahwllhpmmobasayw.supabase.co
    ↓
Social Media APIs (Twitter, Instagram, Facebook, OpenAI)
```

## Next Steps

1. Deploy frontend using Option 1 or 2 above
2. Update OAuth provider callback URLs
3. Test end-to-end authentication flow
4. Monitor logs in Railway dashboard
