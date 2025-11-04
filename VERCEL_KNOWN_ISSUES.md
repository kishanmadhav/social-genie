# Known Issues & Solutions for Vercel Deployment

## Session Management in Serverless

⚠️ **Important**: The current session implementation uses `express-session` with in-memory storage, which doesn't work well with Vercel's serverless architecture because each function invocation is stateless.

### Recommended Solutions:

#### Option 1: Use Vercel KV (Redis) for Sessions (Recommended)
```bash
npm install @vercel/kv connect-redis
```

Update `server.js`:
```javascript
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;
const { kv } = require('@vercel/kv');

// Create Redis client using Vercel KV
const redisClient = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

redisClient.connect().catch(console.error);

// Session configuration with Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none'
  }
}));
```

Then add Vercel KV to your project:
1. Go to Vercel Dashboard → Storage
2. Create KV Database
3. Connect to your project

#### Option 2: Use JWT Tokens Instead of Sessions

Replace session-based auth with JWT tokens:
```bash
npm install jsonwebtoken
```

This requires refactoring the auth flow to use tokens instead of sessions.

#### Option 3: Use Supabase Auth (Easiest)

Since you already use Supabase, leverage their auth system:
- Use Supabase's built-in authentication
- Remove Passport.js
- Use Supabase client-side auth

## Current Temporary Workaround

For testing purposes, the app will work but sessions may not persist between requests due to serverless nature. Users may need to re-authenticate frequently.

## Database Connection Pooling

If you experience database connection issues:

```bash
npm install pg
```

Supabase should handle connection pooling, but if issues persist, consider:
- Using Supabase connection pooler
- Implementing connection retry logic
- Setting proper timeout values

## File Upload Issues

Vercel has a 4.5MB limit for serverless function payloads. For larger files:
1. Use direct S3 upload from frontend
2. Implement presigned URLs
3. Use Vercel Edge Functions for larger payloads

## Cold Starts

First request after inactivity may be slow due to cold starts:
- Consider upgrading to Vercel Pro for better cold start performance
- Implement health check endpoint
- Use keep-alive requests

## Environment Variables

Ensure all environment variables are set in Vercel dashboard, not just `.env` file.

## Rate Limiting

Current rate limiting may not work correctly in serverless due to stateless nature. Consider:
- Use Vercel's rate limiting middleware
- Implement rate limiting with Redis/KV
- Use API gateway for rate limiting

## Monitoring

Set up proper monitoring:
- Vercel Analytics
- Error tracking (Sentry)
- Custom logging with external service

## Next Steps for Production

1. **Implement Redis sessions** (Option 1 above)
2. Set up proper error tracking
3. Add health check endpoint
4. Implement proper logging
5. Set up monitoring and alerts
6. Test thoroughly in staging environment

---

For immediate deployment testing, the current setup will work but may have session persistence issues. Implement Redis sessions for production use.
