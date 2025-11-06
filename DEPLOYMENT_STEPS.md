# 🚀 Quick Deploy Guide

## ✅ What's Deployed

- **Frontend:** https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app
- **Backend:** https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app

## 📝 Setup Steps (In Order):

### 1. Add Backend Environment Variables

**Go to:** https://vercel.com/kishan-madhavs-projects-1f348ecf/sm-genie/settings/environment-variables

Click "Add" and add these variables **one by one** from your local `.env` file:

**List of Variables to Add:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` → Use: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/google/callback`
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `TWITTER_CALLBACK_URL` → Use: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/twitter/callback`
- `INSTAGRAM_CLIENT_ID`
- `INSTAGRAM_CLIENT_SECRET`
- `INSTAGRAM_CALLBACK_URL` → Use: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/instagram/callback`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_CALLBACK_URL` → Use: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/facebook/callback`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `OPENAI_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `PORT` → Value: `3000`
- `NODE_ENV` → Value: `production`

**Important:** 
- Select **"Production"** environment for each variable
- Copy values from your local `.env` file
- Update callback URLs to use the Vercel backend URL above

After adding all variables, go to Deployments tab and click **"Redeploy"**.

### 2. Add Frontend Environment Variable

**Go to:** https://vercel.com/kishan-madhavs-projects-1f348ecf/frontend/settings/environment-variables

Add ONE variable:
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app`
- Environment: **Production**

Then go to Deployments and click **"Redeploy"**.

### 3. Update OAuth Callback URLs

Update these in your OAuth provider dashboards:

**Google Console:** https://console.cloud.google.com/apis/credentials
- Add: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/google/callback`

**Twitter Developer:** https://developer.twitter.com/en/portal/dashboard
- Add: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/twitter/callback`

**Facebook Developer:** https://developers.facebook.com/apps
- Add: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/facebook/callback`
- Add: `https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app/auth/instagram/callback`

### 4. Test Your App! 🎉

**Visit:** https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app

Test:
- ✅ Login with Google
- ✅ Connect social media accounts
- ✅ Generate AI content
- ✅ Post to platforms

## 🔧 Troubleshooting

**Check Logs:**
- Backend: https://vercel.com/kishan-madhavs-projects-1f348ecf/sm-genie
- Frontend: https://vercel.com/kishan-madhavs-projects-1f348ecf/frontend

**Common Issues:**
1. **OAuth errors** → Check callback URLs match exactly
2. **API errors** → Verify all environment variables are added
3. **CORS errors** → Make sure frontend URL is set in backend
4. **"Not found" errors** → Click "Redeploy" after adding env vars

## ⚡ Quick Redeploy Commands

```bash
# Redeploy backend
cd c:\sm-genie
vercel --prod

# Redeploy frontend
cd c:\sm-genie\frontend
vercel --prod
```

## 📌 Important URLs

- **Your App:** https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app
- **Backend API:** https://sm-genie-baip7xbmw-kishan-madhavs-projects-1f348ecf.vercel.app
- **Backend Dashboard:** https://vercel.com/kishan-madhavs-projects-1f348ecf/sm-genie/settings/environment-variables
- **Frontend Dashboard:** https://vercel.com/kishan-madhavs-projects-1f348ecf/frontend/settings/environment-variables

---

**Start with Step 1** - Add backend environment variables first! 👆
