# ✅ Vercel Deployment Checklist

## Files Created
- ✅ `vercel.json` - Backend Vercel configuration
- ✅ `frontend/vercel.json` - Frontend Vercel configuration
- ✅ `.vercelignore` - Backend ignore patterns
- ✅ `frontend/.vercelignore` - Frontend ignore patterns
- ✅ `frontend/.env.example` - Frontend environment variables template
- ✅ `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- ✅ `QUICK_DEPLOY.md` - Quick start guide

## Code Changes
- ✅ Updated `server.js` CORS to use `FRONTEND_URL` environment variable
- ✅ Updated all OAuth callback redirects to use `FRONTEND_URL`
- ✅ Added `sameSite: 'none'` for production cookies (cross-origin)
- ✅ Frontend already uses `NEXT_PUBLIC_API_URL` environment variable
- ✅ Updated `.env.example` with production notes

## What You Need to Do

### 1. Deploy Backend to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set Root Directory: `./` (root)
4. Framework: Other
5. Add ALL environment variables from `.env.example`:
   - All OAuth credentials (Google, Twitter, Facebook, Instagram)
   - AWS S3 credentials
   - OpenAI API key
   - Supabase credentials
   - SESSION_SECRET
   - FRONTEND_URL (set after frontend deployment)
   - NODE_ENV=production
6. Deploy
7. Note your backend URL: `https://your-backend.vercel.app`

### 2. Deploy Frontend to Vercel
1. Go to https://vercel.com/new (again)
2. Import the same repository
3. Set Root Directory: `frontend`
4. Framework: Next.js (auto-detected)
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```
   (Use your actual backend URL from step 1)
6. Deploy
7. Note your frontend URL: `https://your-frontend.vercel.app`

### 3. Update Backend Environment
1. Go to backend project in Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to `https://your-frontend.vercel.app`
4. Deployments → Latest → ... → Redeploy

### 4. Update OAuth Provider Settings

#### Google Cloud Console
- Go to https://console.cloud.google.com
- Credentials → Your OAuth 2.0 Client
- Authorized redirect URIs → Add:
  - `https://your-backend.vercel.app/auth/google/callback`
- Authorized JavaScript origins → Add:
  - `https://your-backend.vercel.app`
  - `https://your-frontend.vercel.app`

#### Twitter Developer Portal
- Go to https://developer.twitter.com/en/portal
- Your App → Settings
- Callback URLs → Add:
  - `https://your-backend.vercel.app/auth/twitter/callback`
- Website URL → Update:
  - `https://your-frontend.vercel.app`

#### Facebook Developer Console
- Go to https://developers.facebook.com/apps
- Your App → Settings → Basic
- App Domains → Add:
  - `your-backend.vercel.app`
  - `your-frontend.vercel.app`
- Go to Facebook Login → Settings
- Valid OAuth Redirect URIs → Add:
  - `https://your-backend.vercel.app/auth/facebook/callback`

#### Instagram (if separate OAuth)
- Update redirect URI to:
  - `https://your-backend.vercel.app/auth/instagram/callback`

### 5. Test Your Deployment
- [ ] Visit frontend URL
- [ ] Test Google login
- [ ] Test Twitter connection
- [ ] Test Facebook/Instagram connection
- [ ] Test posting to Twitter
- [ ] Test posting to Instagram
- [ ] Test AI content generation
- [ ] Test scheduled posts
- [ ] Check analytics

## Environment Variables Required

### Backend (23 variables)
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
TWITTER_API_KEY
TWITTER_API_SECRET
TWITTER_BEARER_TOKEN
TWITTER_CALLBACK_URL
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
FACEBOOK_CALLBACK_URL
INSTAGRAM_CLIENT_ID
INSTAGRAM_CLIENT_SECRET
INSTAGRAM_CALLBACK_URL
SESSION_SECRET
OPENAI_API_KEY
S3_BUCKET_NAME
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SUPABASE_URL
SUPABASE_KEY
FRONTEND_URL
NODE_ENV=production
```

### Frontend (1 variable)
```
NEXT_PUBLIC_API_URL
```

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` is set correctly in backend
- Check browser console for exact error
- Ensure cookies are enabled

### OAuth Fails
- Double-check all callback URLs match exactly
- Ensure you're using HTTPS (not HTTP)
- Clear browser cookies and try again

### Session Not Persisting
- Verify `SESSION_SECRET` is set
- Check that `sameSite: 'none'` is set for production
- Ensure `secure: true` for HTTPS

### 404 Errors
- Frontend: Check `NEXT_PUBLIC_API_URL` is correct
- Backend: Verify Vercel deployment logs

### Build Fails
- Check Vercel build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## Post-Deployment

### Monitor
- Check Vercel logs for any errors
- Monitor API usage (OpenAI, AWS S3)
- Check Supabase connections

### Optional Enhancements
- Add custom domain
- Set up monitoring/alerts
- Configure CDN for static assets
- Add rate limiting per IP
- Set up error tracking (Sentry)

## Support Documentation
- Read `VERCEL_DEPLOYMENT.md` for detailed guide
- Read `QUICK_DEPLOY.md` for quick reference
- Check Vercel docs: https://vercel.com/docs

---

**Ready to deploy? Start with Step 1 above! 🚀**
