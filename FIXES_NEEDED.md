# 🔧 Fixes Needed for Social Genie

## Issue 1: User Name Not Displaying in Dashboard

**Problem:** The frontend is calling `localhost:3000` instead of the production backend.

**Fix:** Update Frontend Environment Variable in Vercel

1. Go to: https://vercel.com/kishan-madhavs-projects-1f348ecf/frontend/settings/environment-variables
2. Edit `NEXT_PUBLIC_API_URL` to:
   ```
   https://sm-genie.vercel.app
   ```
3. Save and redeploy frontend from dashboard

---

## Issue 2: Previous Data Not Showing

**Possible Causes:**
1. Frontend calling wrong backend URL (see Issue 1)
2. Session/cookie not working across domains

**Additional Fix Needed:**
Check if you're logged in with the same Google account that has the data. If you created a new OAuth app, you'll have new user records.

---

## Issue 3: Update OAuth Callback URLs

### A. Twitter/X Callback URLs

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Find your app
3. Go to **Settings** → **User authentication settings**
4. Under **Callback URI / Redirect URL**, add:
   ```
   https://sm-genie.vercel.app/auth/twitter/callback
   http://localhost:3000/auth/twitter/callback
   ```
5. Save

### B. Facebook Callback URLs (for Instagram Graph API)

1. Go to: https://developers.facebook.com/apps
2. Select your app
3. Go to **Facebook Login** → **Settings**
4. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://sm-genie.vercel.app/auth/facebook/callback
   http://localhost:3000/auth/facebook/callback
   ```
5. Go to **Instagram Basic Display** → **Basic Display**
6. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://sm-genie.vercel.app/auth/instagram/callback
   http://localhost:3000/auth/instagram/callback
   ```
7. Save all changes

### C. Update Backend Environment Variables

Go to: https://vercel.com/kishan-madhavs-projects-1f348ecf/sm-genie/settings/environment-variables

**Edit these variables (manually type or paste - no copy from terminal!):**

1. **TWITTER_CALLBACK_URL**
   ```
   https://sm-genie.vercel.app/auth/twitter/callback
   ```

2. **FACEBOOK_CALLBACK_URL**
   ```
   https://sm-genie.vercel.app/auth/facebook/callback
   ```

3. **INSTAGRAM_CALLBACK_URL**
   ```
   https://sm-genie.vercel.app/auth/instagram/callback
   ```

4. **GOOGLE_CALLBACK_URL** (if not already correct)
   ```
   https://sm-genie.vercel.app/auth/google/callback
   ```

5. **FRONTEND_URL** (if not already correct)
   ```
   https://frontend-eight-pied-40.vercel.app
   ```

**CRITICAL:** Make sure there are NO spaces, NO line breaks at the end of each URL!

---

## Step-by-Step Execution Order:

### Step 1: Fix Frontend Environment Variable
1. Update `NEXT_PUBLIC_API_URL` in frontend Vercel settings
2. Redeploy frontend

### Step 2: Fix Backend Environment Variables
1. Update all callback URLs in backend Vercel settings
2. Make sure NO `\r\n` characters at the end
3. Redeploy backend from dashboard (use "Redeploy" button, not CLI)

### Step 3: Update OAuth Provider Consoles
1. Google: Add `https://sm-genie.vercel.app/auth/google/callback`
2. Twitter: Add `https://sm-genie.vercel.app/auth/twitter/callback`
3. Facebook: Add `https://sm-genie.vercel.app/auth/facebook/callback`
4. Instagram: Add `https://sm-genie.vercel.app/auth/instagram/callback`

### Step 4: Test Everything
1. Visit: https://frontend-eight-pied-40.vercel.app
2. Log in with Google - verify your name shows in dashboard
3. Try connecting Twitter/X
4. Try connecting Facebook/Instagram

---

## Troubleshooting

### If name still doesn't show:
- Open browser DevTools (F12)
- Go to Console tab
- Look for API errors
- Check if the frontend is calling the correct backend URL

### If OAuth fails:
- Check the error message
- Verify the redirect URI exactly matches what's in the provider console
- Make sure you're added as a test user (if app is in Testing mode)

### If data is missing:
- You might be using a different Google account
- Or you created new OAuth credentials (which creates new user records)
- Check the database to verify user records exist

---

## Current Stable URLs:

**Frontend:** https://frontend-eight-pied-40.vercel.app
**Backend:** https://sm-genie.vercel.app

These URLs won't change!
