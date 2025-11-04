# Quick Vercel Deployment Guide

## 🚀 Quick Start

### 1. Backend Deployment (5 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `kishanmadhav/social-genie` repository
3. Configure:
   - **Root Directory**: `./` (root)
   - **Framework**: Other
4. Add environment variables (copy from `.env.example`)
5. Deploy!

### 2. Frontend Deployment (3 minutes)

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the same repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```
5. Deploy!

### 3. Update Backend Environment

1. Go to backend project → Settings → Environment Variables
2. Update `FRONTEND_URL` to your frontend URL
3. Redeploy backend

### 4. Update OAuth Providers

Update callback URLs in:
- **Google Cloud Console**
- **Twitter Developer Portal**
- **Facebook Developer Console**

See full details in `VERCEL_DEPLOYMENT.md`

## 📋 Environment Variables Needed

### Backend (23 variables)
✅ All OAuth credentials  
✅ AWS S3 credentials  
✅ OpenAI API key  
✅ Supabase credentials  
✅ Session secret  
✅ FRONTEND_URL  

### Frontend (1 variable)
✅ NEXT_PUBLIC_API_URL

## 🔗 Important URLs to Update

After deployment, update these in OAuth providers:
- Google: `https://your-backend.vercel.app/auth/google/callback`
- Twitter: `https://your-backend.vercel.app/auth/twitter/callback`
- Facebook: `https://your-backend.vercel.app/auth/facebook/callback`

## ⚠️ Common Issues

1. **CORS errors**: Check FRONTEND_URL is set correctly
2. **OAuth fails**: Verify callback URLs in provider dashboards
3. **Session issues**: Ensure SESSION_SECRET is set
4. **Build fails**: Check all dependencies are in package.json

## 📚 Full Documentation

See `VERCEL_DEPLOYMENT.md` for complete step-by-step guide.
