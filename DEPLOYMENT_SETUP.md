# Deployment Setup Guide

## Current Deployment URLs

- **Frontend**: https://recall-ai-prod.vercel.app
- **Backend**: https://recall-ai.up.railway.app

## Required Environment Variables

### Vercel (Frontend)

You **MUST** set the following environment variable in your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following:

```
Name: EXPO_PUBLIC_API_URL
Value: https://recall-ai.up.railway.app
```

**Important Notes:**
- The variable name must be exactly `EXPO_PUBLIC_API_URL` (with `EXPO_PUBLIC_` prefix)
- After adding, you need to **redeploy** your application for the change to take effect
- This variable is used at build time, so a new build is required

### Railway (Backend)

You **MUST** set the following environment variable in your Railway project:

1. Go to your Railway project dashboard
2. Navigate to **Variables** tab
3. Add the following:

```
Name: FRONTEND_URL
Value: https://recall-ai-prod.vercel.app
```

**Important Notes:**
- This is required for CORS (Cross-Origin Resource Sharing) to work properly
- Without this, your frontend will get CORS errors when trying to make API calls
- After adding, Railway will automatically redeploy your backend

## Troubleshooting

### Issue: API calls are not working

**Check 1: Environment Variable in Vercel**
- Open browser console (F12) and look for the log message: `🔗 API Base URL: ...`
- If it shows `http://localhost:5000`, the environment variable is not set correctly in Vercel
- Solution: Add `EXPO_PUBLIC_API_URL` in Vercel and redeploy

**Check 2: CORS Errors**
- If you see `🚫 CORS Error` in the browser console
- Solution: Ensure `FRONTEND_URL=https://recall-ai-prod.vercel.app` is set in Railway

**Check 3: Network Errors**
- If you see `❌ Network Error` in the browser console
- Check that the backend URL is correct and accessible
- Test the backend health endpoint: https://recall-ai.up.railway.app/health

### Testing the Backend

You can test if the backend is accessible by visiting:
```
https://recall-ai.up.railway.app/health
```

This should return a JSON response with status "OK".

### Verifying Environment Variables

**Frontend (Vercel):**
1. After redeploying, check the browser console
2. You should see: `🔗 API Base URL: https://recall-ai.up.railway.app`

**Backend (Railway):**
1. Check Railway logs after setting `FRONTEND_URL`
2. The backend should start without CORS-related warnings

## Quick Fix Checklist

If API calls aren't working, follow these steps:

- [ ] Set `EXPO_PUBLIC_API_URL=https://recall-ai.up.railway.app` in Vercel
- [ ] Redeploy frontend on Vercel
- [ ] Set `FRONTEND_URL=https://recall-ai-prod.vercel.app` in Railway
- [ ] Wait for Railway to redeploy
- [ ] Clear browser cache and test again
- [ ] Check browser console for error messages

## Additional Backend Environment Variables

Based on your backend .env, make sure these are also set in Railway:

```
NODE_ENV=production
PORT=5000 (or let Railway auto-assign)
HOST=0.0.0.0
FRONTEND_URL=https://recall-ai-prod.vercel.app
DATABASE_URL=... (your Supabase connection string)
DIRECT_URL=... (your Supabase direct connection string)
JWT_SECRET=... (your JWT secret)
... (all other required variables)
```

