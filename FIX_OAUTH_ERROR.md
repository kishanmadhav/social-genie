# 🔧 Fix OAuth Error - Quick Steps

## Current Error: "redirect_uri_mismatch"

Your backend URL has changed to: **https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app**

## Step 1: Update Google Console ⚠️ REQUIRED

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Find** the OAuth 2.0 Client with ID: `448388470879-ghid16l10ahtuckqb7936s6e1gm8195q.apps.googleusercontent.com`

3. **Click Edit** (pencil icon)

4. **Under "Authorized redirect URIs"**, make sure these are added:
   ```
   http://localhost:3000/auth/google/callback
   https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app/auth/google/callback
   ```

5. **Click Save** (bottom of page)

⚠️ **Wait 1-2 minutes** after saving for Google to propagate changes

## Step 2: Verify Backend Environment Variables

Go to: https://vercel.com/kishan-madhavs-projects-1f348ecf/sm-genie/settings/environment-variables

Make sure these are set:

- `GOOGLE_CALLBACK_URL` = `https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app/auth/google/callback`
- All other Google, Twitter, Facebook, Supabase, OpenAI, AWS variables

If `GOOGLE_CALLBACK_URL` is wrong, update it and redeploy.

## Step 3: Update Frontend Environment Variable

Go to: https://vercel.com/kishan-madhavs-projects-1f348ecf/frontend/settings/environment-variables

Update or add:
- `NEXT_PUBLIC_API_URL` = `https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app`

Then **Redeploy** the frontend:
```bash
cd c:\sm-genie\frontend
vercel --prod
```

## Step 4: Test Again

Visit: https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app

Click "Sign in with Google" - it should work now!

## Also Update (After Google works):

### Twitter Developer Portal
https://developer.twitter.com/en/portal/dashboard
- Add: `https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app/auth/twitter/callback`

### Facebook Developer Console
https://developers.facebook.com/apps
- Add: `https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app/auth/facebook/callback`
- Add: `https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app/auth/instagram/callback`

## Current URLs

- **Frontend:** https://frontend-7t5u541xf-kishan-madhavs-projects-1f348ecf.vercel.app
- **Backend:** https://sm-genie-cdd2onizk-kishan-madhavs-projects-1f348ecf.vercel.app

## Troubleshooting

If still getting error:
1. Clear browser cache/cookies
2. Try incognito/private window
3. Wait 2-3 minutes after saving Google Console changes
4. Double-check the callback URL has NO trailing slash
5. Make sure you're using the correct Google account
