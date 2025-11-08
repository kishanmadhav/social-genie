# Railway Deployment Troubleshooting

## Issue: "Missing Supabase Configuration" Error

### Common Causes:

#### 1. **Variables Not Applied**
- Variables added but deployment hasn't restarted
- Variables saved but service not redeployed

**Fix:**
1. Go to Railway Dashboard → Your Project → Settings → Variables
2. **Delete** a variable and re-add it (this triggers a refresh)
3. OR click the **Restart** button on the deployment

#### 2. **Variable Names Wrong**
Double-check exact spelling:
- `SUPABASE_URL` (not `supabase_url` or `Supabase_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (not `supabase_service_role_key`)

**Fix:**
1. Delete the incorrectly named variable
2. Re-add with EXACT capitalization

#### 3. **Environment File Not Loading**
Railway doesn't load `.env` files - it uses Dashboard Variables only

**Fix:**
1. Don't rely on `.env` file
2. Add ALL variables in Railway Dashboard → Variables tab

#### 4. **Variables Showing but Not Being Read**
Check if Railway is actually passing variables to the container

**Fix - Check Logs:**
1. Go to **Deployments** → Click on latest deployment
2. Click **Logs** tab
3. Look for the debug output showing all environment variables
4. You should see your `SUPABASE_URL` listed

---

## Step-by-Step Fix:

### **1. Verify Variables in Railway Dashboard**

Go to: **Your Project → Service (social-genie-api) → Settings → Variables**

You should see:
```
SUPABASE_URL = https://pyetahwllhpmmobasayw.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIs...
NODE_ENV = production
PORT = 3000
... (and others)
```

✅ All variables present?

### **2. Check Exact Capitalization**

These MUST be exact:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ `supabase_url` (wrong)
- ❌ `Supabase_Url` (wrong)

### **3. Trigger Redeployment**

**Option A - Auto Redeploy:**
1. Push code changes to GitHub
2. Railway will auto-redeploy

**Option B - Manual Restart:**
1. Go to **Deployments** tab
2. Click the **⋯** menu on latest deployment
3. Select **Restart**

**Option C - Modify Variable:**
1. Go to Variables
2. Edit any variable (add space, then remove it)
3. Save - this triggers redeploy

### **4. Check Logs**

After deployment:
1. Go to **Deployments** → Latest
2. Click **Logs** tab
3. Scroll to top to see startup output
4. You should see:
```
========================================
🚀 Social Genie Backend Starting...
========================================
Node.js v22.11.0
Environment: production
========================================
DEBUG: All environment variables:
  - SUPABASE_URL=https://pyetahwllh...
  - SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
  ...
========================================
```

✅ Do you see your variables listed?

---

## Advanced Troubleshooting:

### **Check Railway CLI Connection**

If you want to check Railway from command line:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Select project
railway init

# View environment variables
railway variables

# View logs
railway logs
```

### **Check if Variables are Actually Set**

In Railway Logs, if you see all variables are empty, then:

1. Go to Variables tab
2. **Delete all**
3. **Re-add from scratch**
4. Click Save after each one
5. Restart deployment

### **Nuclear Option - Start Fresh**

1. Go to **Settings → Danger Zone → Delete Service**
2. Re-add service from GitHub
3. Add variables fresh
4. Deploy

---

## Success Indicator

When it works, logs should show:
```
✓ Supabase client initialized successfully
========================================
🚀 Social Genie Server Starting
========================================
✓ Database: connected
```

And you should be able to:
```bash
curl https://YOUR_RAILWAY_DOMAIN/health
```

Response:
```json
{
  "status": "ok",
  "environment": "production",
  "database": "connected"
}
```

---

## Still Not Working?

Share these from your Railway logs:
1. All the DEBUG environment variables output
2. The exact error message
3. Screenshot of Variables tab

Then I can help identify what's missing!
