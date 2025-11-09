# ✅ FRONTEND DEPLOYMENT - STEP BY STEP

## Current Status
- ✅ Backend: Running at https://social-genie-production.up.railway.app
- ✅ Database: Connected
- ✅ Frontend: Dockerized and ready
- ⏳ Frontend Deployment: **IN PROGRESS**

## 🚀 DEPLOY FRONTEND TO RAILWAY - MANUAL STEPS

### Step 1: Open Railway Dashboard
Go to: https://railway.com/project/c67fd0cc-4b80-474a-ae70-12efef775a5d

### Step 2: Add New Service
1. Click the **"+ Add"** button in the top right
2. Select **"GitHub Repo"**
3. Search for: **`kishanmadhav/social-genie`**
4. Click on the repository when it appears

### Step 3: Configure GitHub Repo
1. **Repository**: kishanmadhav/social-genie
2. **Branch**: main
3. **Root Directory**: `frontend` ← **IMPORTANT: Type this**
4. Click **"Deploy"**

### Step 4: Set Environment Variables
Once the service is created:
1. Click on the new service (named "frontend" or similar)
2. Go to the **"Variables"** tab
3. Add the following variables:

```
NEXT_PUBLIC_API_URL = https://social-genie-production.up.railway.app
NODE_ENV = production
PORT = 3000
```

4. Click "Save"

### Step 5: Wait for Deployment
- The deployment will start automatically
- Watch the build logs (should take 2-3 minutes)
- Once complete, you'll see a URL like: `https://frontend-xxxx.up.railway.app`

### Step 6: Verify Deployment
Once deployed, open the frontend URL in your browser:
```
https://frontend-[YOUR-ID].up.railway.app
```

You should see the Social Genie landing page with:
- Header: "Social Genie"
- Features list
- Login buttons

## ✅ VERIFICATION CHECKLIST

```bash
# Backend health check
curl https://social-genie-production.up.railway.app/health

# Expected response:
# {"status":"ok","database":"connected"}

# Frontend accessibility
# Open in browser: https://frontend-[YOUR-ID].up.railway.app
# Expected: Landing page loads successfully
```

## 🔧 TROUBLESHOOTING

### Build Fails
- Check Root Directory is set to `frontend` (not `.`)
- Verify `package.json` exists in frontend directory
- Check build logs in Railway dashboard

### 404 Error on Frontend
- Verify deployment is complete (green checkmark in Railway)
- Check that PORT environment variable is set to 3000
- Check that NODE_ENV is set to production

### Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` is correctly set to `https://social-genie-production.up.railway.app`
- Check backend is running: https://social-genie-production.up.railway.app/health
- Browser console should show if there are CORS errors

## 📝 NEXT STEPS AFTER DEPLOYMENT

Once frontend is deployed:

1. **Update OAuth Callback URLs**
   - Replace all `http://localhost:3000` with your frontend URL
   - Update in Google Cloud Console
   - Update in Twitter Developer Portal
   - Update in Facebook App Dashboard

2. **Test Authentication Flow**
   - Click "Sign in with Google"
   - Verify redirect works
   - Connect social media accounts

3. **Monitor Logs**
   - Check Railway dashboard for any errors
   - Watch browser console for frontend issues

## 🎯 EXPECTED RESULT

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────────────────────────┐
│  Frontend (Next.js)              │
│ https://frontend-xxxx.up.railway.app │
└──────────┬───────────────────────┘
           │ HTTPS
           ▼
┌──────────────────────────────────┐
│  Backend (Express)               │
│ https://social-genie-production  │
│   .up.railway.app                │
└──────────┬───────────────────────┘
           │ SQL
           ▼
┌──────────────────────────────────┐
│  Database (Supabase)             │
│ https://pyetahwllhpmmobasayw.    │
│   supabase.co                    │
└──────────────────────────────────┘
```

## 📊 DEPLOYMENT CHECKLIST

- [ ] Frontend service created in Railway
- [ ] Root Directory set to `frontend`
- [ ] Build completed successfully
- [ ] Environment variables set
- [ ] Frontend URL accessible
- [ ] Backend health check passing
- [ ] Frontend can load (no 404)
- [ ] Browser console has no errors
- [ ] Login page appears
- [ ] OAuth URLs updated in provider consoles
