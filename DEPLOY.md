# Render Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] package.json has correct start script: `node server.js`
- [x] server.js uses `process.env.PORT || 3000`
- [x] Git repository initialized
- [x] Code committed to git
- [x] .gitignore created (excludes node_modules)
- [x] README.md created

## 🚀 Deployment Steps

### 1. Create GitHub Repository

```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/aviation-backend.git
git push -u origin main
```

### 2. Deploy on Render

1. Go to https://render.com/
2. Sign up/Log in (can use GitHub account)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure the service:

   **Name**: `aviation-backend`  
   **Environment**: `Node`  
   **Build Command**: `npm install`  
   **Start Command**: `node server.js`  
   **Plan**: Free

6. Click **"Create Web Service"**

### 3. Wait for Deployment

- Render will install dependencies and start your server
- You'll get a URL like: `https://aviation-backend-xxxx.onrender.com`
- First deploy takes 2-3 minutes

### 4. Test Your Deployment

```bash
# Test health check
curl https://YOUR-APP.onrender.com/test

# Test weather endpoint
curl https://YOUR-APP.onrender.com/weather?station=CYYZ

# Test airport endpoint
curl https://YOUR-APP.onrender.com/airport?code=KJFK
```

### 5. Update Frontend Config

In `/Users/ryoma/my-first-app/config.ts`:

```typescript
const NGROK_URL = 'https://YOUR-APP.onrender.com';  // Update this!
```

## 🔧 Important Notes

### Free Tier Limitations
- Render free tier **spins down after 15 minutes of inactivity**
- First request after spin-down takes 30-60 seconds (cold start)
- Perfect for development/testing, not for production

### Keeping It Awake (Optional)
Use a service like UptimeRobot to ping your API every 10 minutes:
- Ping endpoint: `https://YOUR-APP.onrender.com/test`
- Interval: Every 10 minutes

### Environment Variables (If Needed)
In Render dashboard → Environment tab:
- Add any API keys or secrets
- They'll be available as `process.env.VARIABLE_NAME`

## 📝 After Deployment

1. ✓ Copy your Render URL
2. ✓ Test all endpoints
3. ✓ Update frontend config.ts with Render URL
4. ✓ Update README.md with live URL
5. ✓ Test frontend connection to deployed backend

## 🐛 Troubleshooting

**Build fails?**
- Check Render logs in dashboard
- Verify package.json is valid
- Ensure all dependencies are listed

**Server won't start?**
- Check start command is `node server.js`
- Verify PORT is using `process.env.PORT`

**404 errors?**
- Check your endpoint URLs
- Verify CORS is enabled in server.js
