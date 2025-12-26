# URGENT: Render Environment Configuration

## Critical Issue
The AI endpoint (`POST /ai/ask`) is not available on Render production.

## Root Cause
Render is running OLD CODE that doesn't include the `/ai/ask` endpoint yet.

## Solution Required
### Step 1: Force Render Code Redeploy
The latest code with `/ai/ask` has been pushed to GitHub but Render hasn't pulled it yet.

**Options:**
1. **Manual Redeploy** (FASTEST):
   - Go to https://dashboard.render.com
   - Find "aviation-backend" service
   - Click the "Redeploy" button
   - Choose "Latest Commit"
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

2. **Auto-Deploy** (Already configured):
   - If auto-deploy is enabled, Render should pick up latest code within 5 minutes

### Step 2: Set OPENAI_API_KEY Environment Variable
After redeploy, Render also needs the API key to make AI calls work.

**In Render Dashboard:**
1. Go to https://dashboard.render.com
2. Click "aviation-backend" service
3. Go to "Settings" tab
4. Scroll to "Environment" section
5. Click "Add Environment Variable"
6. **Key:** `OPENAI_API_KEY`
7. **Value:** (see value below)
8. Click "Save Changes"
9. Render will auto-restart

**API Key Value:**
(Copy the value from `.env` file on your local machine - the key starting with `sk-proj-`)
Do not paste it here - enter it directly in the Render dashboard

### Step 3: Verify
Once both steps are done, test:
```bash
curl -X POST https://aviation-backend-ccw5.onrender.com/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is VFR?"}'
```

Expected response:
```json
{
  "response": "VFR stands for Visual Flight Rules..."
}
```

## Verification Checklist
- [ ] Render shows latest commit in logs
- [ ] Render deployment is "Live" (green status)
- [ ] OPENAI_API_KEY is set in Environment variables
- [ ] AI endpoint returns JSON (not HTML error)
- [ ] Frontend can call `/ai/ask` successfully
