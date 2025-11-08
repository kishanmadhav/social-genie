# Railway Deployment Guide

## Status: ✅ Backend Deployed | ⏳ Frontend Ready

### Backend Status
- **Service**: social-genie
- **Status**: ✅ Running
- **URL**: https://social-genie-production.up.railway.app
- **Database**: ✅ Connected (Supabase)
- **Health**: https://social-genie-production.up.railway.app/health

### Frontend Status
- **Docker Image**: ✅ Built and tested locally
- **Status**: ⏳ Ready for deployment to Railway
- **Next Steps**: Add frontend service to Railway project

## Deploying Frontend to Railway

The frontend is ready to deploy but requires manual setup in the Railway dashboard since CLI doesn't easily support adding multiple services.

### Option 1: Deploy via Railway Dashboard (Recommended)

1. Go to https://railway.com/project/c67fd0cc-4b80-474a-ae70-12efef775a5d
2. Click "+ New" button
3. Select "GitHub Repo" 
4. Connect your GitHub repository (social-genie)
5. Configure build settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://social-genie-production.up.railway.app`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
7. Deploy

### Option 2: Deploy via Docker Image

The Docker image has been built and tested locally. You can push it to Railway's registry:

```bash
docker tag social-genie-frontend:latest registry.railway.app/social-genie-frontend:latest
docker push registry.railway.app/social-genie-frontend:latest
```

Then in Railway dashboard, add a new service pointing to this image.

### Option 3: Deploy via Railway CLI (Advanced)

```bash
cd frontend
railway service add
# Select "successful-purpose" project
# Select "production" environment
# Wait for deployment
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    End Users                        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │   Frontend (Next.js)       │
    │ https://<frontend-url>     │
    └────────────┬───────────────┘
                 │ NEXT_PUBLIC_API_URL
                 ▼
    ┌────────────────────────────────────────────────┐
    │   Backend (Express)                             │
    │   https://social-genie-production.up.railway.app│
    │   ├─ /health
    │   ├─ /auth/*
    │   ├─ /api/posts
    │   ├─ /api/schedule
    │   └─ ... other endpoints
    └────────────┬───────────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │   Supabase Database        │
    │ PostgreSQL at             │
    │ pyetahwllhpmmobasayw      │
    │ .supabase.co               │
    └────────────────────────────┘
```

## Deployment Timeline

- ✅ Backend deployed and running
- ✅ Database connected and verified
- ✅ Health check endpoint working
- ✅ Frontend Docker image built and tested
- ⏳ Frontend deployment to Railway (needs manual setup)
- ⏳ OAuth URLs need updating for production
- ⏳ End-to-end testing

## Environment Variables

### Backend (Already Set)
```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://pyetahwllhpmmobasayw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<set in Railway>
# OAuth and API keys all configured
```

### Frontend (To Be Set)
```
NEXT_PUBLIC_API_URL=https://social-genie-production.up.railway.app
NODE_ENV=production
PORT=3000
```

## Testing

### Test Backend Health
```bash
curl https://social-genie-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T06:58:50.660Z",
  "environment": "production",
  "database": "connected"
}
```

### Test Frontend (After Deployment)
Navigate to the frontend URL and verify:
1. Landing page loads
2. "Connect" button redirects to OAuth
3. Dashboard loads after auth
4. Can connect social media accounts

## Troubleshooting

### Frontend Build Fails
- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify `NODE_ENV=production`
- Check build logs in Railway dashboard

### API Connection Issues
- Ensure `NEXT_PUBLIC_API_URL` matches the backend URL exactly
- Check backend health endpoint is responding
- Verify CORS settings in backend

### Database Connection Issues
- Check `SUPABASE_SERVICE_ROLE_KEY` is set in Railway
- Verify Supabase project is active
- Check Railway logs for initialization messages

## Next Steps

1. **Add Frontend Service**: Follow "Deploying Frontend to Railway" section above
2. **Update OAuth URLs**: Update all OAuth provider callback URLs to production URLs
3. **Test End-to-End**: Test the complete flow from frontend → backend → database
4. **Monitor Logs**: Set up monitoring and alerts for production

## Useful Links

- Railway Dashboard: https://railway.com/dashboard
- Social Genie Project: https://railway.com/project/c67fd0cc-4b80-474a-ae70-12efef775a5d
- Backend Service: https://railway.com/project/c67fd0cc-4b80-474a-ae70-12efef775a5d/service/ff27d0eb-fdd3-4161-8a9c-bd41ef7cebe6
- GitHub Repository: https://github.com/kishanmadhav/social-genie
