# Vercel Deployment Guide for Social Genie

This guide will help you deploy your Social Genie application to Vercel.

## Project Structure

- **Frontend (Next.js)**: Located in `/frontend` - Deploy to Vercel
- **Backend (Express)**: Located in root - Deploy separately (Railway, Render, or your own server)

## Prerequisites

1. GitHub account with your code pushed
2. Vercel account (sign up at https://vercel.com)
3. Backend server deployed and accessible (get the URL)

## Step 1: Deploy Frontend to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to frontend directory:
```bash
cd frontend
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - What's your project's name? **social-genie**
   - In which directory is your code located? **./**
   - Want to modify settings? **N**

6. For production deployment:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard (Easier)

1. Go to https://vercel.com/new

2. Import your GitHub repository:
   - Click "Import Git Repository"
   - Select `kishanmadhav/social-genie`

3. Configure Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. Add Environment Variables (click "Environment Variables"):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

5. Click "Deploy"

## Step 2: Configure Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Note**: Replace `your-backend-url.com` with your actual backend server URL.

## Step 3: Update Backend CORS Settings

In your backend `server.js`, update CORS to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://your-vercel-app.vercel.app',
    'https://social-genie.vercel.app'
  ],
  credentials: true
}));
```

## Step 4: Update OAuth Callback URLs

Update your OAuth provider settings with your new Vercel URL:

### Google OAuth Console
1. Go to https://console.cloud.google.com/
2. Navigate to your project's credentials
3. Add authorized redirect URIs:
   - `https://your-backend-url.com/auth/google/callback`

### Twitter Developer Portal
1. Go to https://developer.twitter.com/
2. Update your app settings
3. Add callback URL:
   - `https://your-backend-url.com/auth/twitter/callback`

### Facebook Developer Console
1. Go to https://developers.facebook.com/
2. Update your app settings
3. Add callback URL:
   - `https://your-backend-url.com/auth/facebook/callback`

## Step 5: Deploy Backend

You'll need to deploy your Express backend separately. Options:

### Railway (Recommended)
1. Go to https://railway.app/
2. Create new project
3. Deploy from GitHub
4. Add all environment variables from `.env`
5. Railway will provide you a URL

### Render
1. Go to https://render.com/
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables

### Heroku
1. Go to https://heroku.com/
2. Create new app
3. Connect GitHub repository
4. Add environment variables
5. Deploy

## Step 6: Update Frontend API URL

Once backend is deployed, update your frontend environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy the frontend

## Step 7: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://social-genie.vercel.app`)
2. Test Google OAuth login
3. Test social media connections
4. Test creating posts

## Troubleshooting

### CORS Errors
- Make sure your backend CORS settings include your Vercel domain
- Check that credentials are set to `true` in CORS config

### OAuth Errors
- Verify all callback URLs are updated in OAuth providers
- Make sure they point to your backend URL, not Vercel

### API Connection Issues
- Confirm `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running and accessible
- Verify backend environment variables are set

### Build Errors
- Run `npm run build` locally first to catch issues
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed by Vercel
4. Update OAuth callback URLs with new domain

## Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

To disable automatic deployments:
1. Go to Project Settings → Git
2. Configure deployment settings

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

## Need Help?

- Vercel Support: https://vercel.com/support
- Check build logs in Vercel Dashboard
- Review Vercel deployment status page
