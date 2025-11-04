# Quick Start: Deploy Social Genie to Vercel

## What You'll Need
- GitHub repository (already done ✓)
- Vercel account (free)
- Backend server URL (Railway, Render, etc.)

## Option 1: Deploy via Vercel Website (Easiest - 5 minutes)

### Step 1: Sign Up/Login to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"

### Step 2: Import Your Repository
1. Click "Add New..." → "Project"
2. Find `kishanmadhav/social-genie` repository
3. Click "Import"

### Step 3: Configure Project
**Root Directory**: Click "Edit" and set to `frontend`
**Framework Preset**: Next.js (auto-detected)
**Build & Development Settings**: Leave as default
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 4: Add Environment Variable
Click "Environment Variables"
Add:
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `http://localhost:3000` (for now, update after backend deploy)
- Select all environments: Production, Preview, Development

### Step 5: Deploy!
Click "Deploy" button

Your app will be live at: `https://social-genie-[random].vercel.app`

---

## Option 2: Deploy via CLI (Advanced)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy Frontend
```bash
cd frontend
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? **social-genie**
- In which directory? **./** (current)
- Want to modify settings? **N**

### Set Environment Variable
```bash
vercel env add NEXT_PUBLIC_API_URL
```
Enter value: `http://localhost:3000`

### Deploy to Production
```bash
vercel --prod
```

---

## Next Steps After Frontend Deployment

### 1. Deploy Backend
Your Express backend needs to be deployed separately. Options:

**Railway (Recommended)**
- Go to https://railway.app
- Click "Start New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- Set root directory to `.` (root)
- Add all environment variables from `.env`
- Railway will give you a URL like: `https://social-genie-production.up.railway.app`

**Render**
- Go to https://render.com
- Create "Web Service"
- Connect GitHub
- Build Command: `npm install`
- Start Command: `node server.js`
- Add environment variables

### 2. Update Frontend Environment Variable
Once backend is deployed:

**Via Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Update `NEXT_PUBLIC_API_URL` with your backend URL
5. Click "Save"
6. Redeploy (Settings → Deployments → Latest → Redeploy)

**Via CLI:**
```bash
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# Enter your backend URL
vercel --prod
```

### 3. Update Backend CORS
In `server.js`, update CORS origins:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://your-app.vercel.app',  // Your Vercel URL
    'https://social-genie.vercel.app'  // If using custom
  ],
  credentials: true
}));
```

Push changes to GitHub, Vercel will auto-deploy.

### 4. Update OAuth Callbacks
Update redirect URIs in:
- **Google Console**: Add `https://your-backend.railway.app/auth/google/callback`
- **Twitter Developer**: Add `https://your-backend.railway.app/auth/twitter/callback`
- **Facebook Developer**: Add `https://your-backend.railway.app/auth/facebook/callback`

---

## Testing Your Deployment

1. Visit your Vercel URL
2. Click "Get Started" or "Login"
3. Test Google OAuth login
4. Connect social media accounts
5. Try creating a post

---

## Common Issues

### "Failed to fetch" errors
- Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Verify backend is running and accessible
- Check browser console for CORS errors

### OAuth not working
- Verify callback URLs in OAuth providers point to backend
- Check backend environment variables are set
- Ensure session secret is set

### Build fails
- Check build logs in Vercel dashboard
- Run `npm run build` locally first
- Verify all dependencies are in `package.json`

---

## Useful Commands

### Check deployment status
```bash
vercel ls
```

### View deployment logs
```bash
vercel logs [deployment-url]
```

### Remove deployment
```bash
vercel rm [project-name]
```

### View environment variables
```bash
vercel env ls
```

---

## What Gets Deployed?

**Frontend (Vercel)**:
- Next.js application from `/frontend` directory
- Static files, React components, pages
- Environment variables for API connection

**Backend (Railway/Render/etc)**:
- Express server from root directory
- Database connections (Supabase)
- OAuth providers
- S3 storage integration
- OpenAI API integration

---

## Cost Estimate

- **Vercel (Frontend)**: Free tier (unlimited personal projects)
- **Railway (Backend)**: ~$5/month (with usage)
- **Supabase**: Free tier (2 projects)
- **AWS S3**: Pay-as-you-go (~$0.023/GB)
- **OpenAI API**: Pay-as-you-go (track in OpenAI dashboard)

Total: ~$5-10/month for small usage

---

Ready to deploy? Start with **Option 1** above! 🚀
