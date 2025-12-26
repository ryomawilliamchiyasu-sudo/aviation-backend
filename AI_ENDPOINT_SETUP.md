# AI Endpoint Setup & Troubleshooting

## Issue Summary
Frontend is getting HTML 404 errors when calling the AI endpoint because:
1. ❌ Render was running stale code without the `/ai/ask` endpoint
2. ❌ Render environment variables don't have OPENAI_API_KEY set

## Status
✅ **Endpoint is fully implemented** - Works locally at `http://localhost:3000/ai/ask`  
✅ **Code is committed** - Latest code has `/ai/ask` endpoint  
⏳ **Render redeploy triggered** - Just pushed empty commit to force rebuild  
❌ **Environment variable missing** - Need to set OPENAI_API_KEY in Render dashboard  

## Local Testing (Works ✓)

```bash
# Test the AI endpoint locally
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is VFR in aviation?"}'

# ✓ Returns: {"response":"VFR stands for Visual Flight Rules..."}
```

## How to Fix on Render

### Step 1: Get Your OpenAI API Key
Your API key is already in the local `.env` file:
```
OPENAI_API_KEY=sk-proj-...
```

### Step 2: Set Environment Variable in Render

**Go to Render Dashboard:**

1. Visit: https://dashboard.render.com
2. Find the "aviation-backend" service
3. Click the service name
4. Go to **Settings** tab
5. Scroll down to **Environment**
6. Click **Add Environment Variable**

**Add the variable:**
- **Key:** `OPENAI_API_KEY`
- **Value:** Copy the full key from `.env` (the `sk-proj-...` value)
- Click **Save Changes**

7. Render will **automatically restart** the service

### Step 3: Wait for Redeploy
- Render auto-deploys when environment variables change
- Should take 2-5 minutes
- Check deployment logs in Render dashboard

### Step 4: Test on Production

```bash
# Test the AI endpoint on Render
curl -X POST https://aviation-backend-ccw5.onrender.com/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is the weather forecast?"}'

# ✓ Should return: {"response":"...AI answer..."}
```

## Expected Response Format

**Success (200):**
```json
{
  "response": "VFR stands for Visual Flight Rules in aviation..."
}
```

**Error - Missing API Key (500):**
```json
{
  "error": "OpenAI API key not configured on server"
}
```

**Error - Missing Prompt (400):**
```json
{
  "error": "Prompt is required"
}
```

**Error - API Failure (500):**
```json
{
  "error": "AI processing failed: {detailed error}"
}
```

## Frontend Integration

Frontend at `my-first-app/app/(tabs)/ai.tsx` calls:

```typescript
const response = await fetch(`${BACKEND_URL}/ai/ask`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: userMessage })
});

const data = await response.json();
console.log(data.response); // AI response text
```

## Endpoint Details

**Endpoint:** `POST /ai/ask`  
**Base URL:** `https://aviation-backend-ccw5.onrender.com` (production)  
**Headers:** `Content-Type: application/json`  

**Request Body:**
```json
{
  "prompt": "Your question here"
}
```

**Response:**
```json
{
  "response": "AI response here"
}
```

## Model Configuration

- **Model:** `gpt-4o-mini` (faster, more cost-effective)
- **Max Tokens:** 500 (reasonable limit for aviation Q&A)
- **Timeout:** 30 seconds (default)

## Troubleshooting

### 404 Error with "Cannot POST /ai/ask"
- Render is running old code
- Solution: Just pushed a commit to force redeploy
- Wait 2-5 minutes for Render to rebuild

### "OpenAI API key not configured" Error
- Environment variable not set in Render
- Solution: Follow Step 2 above to add OPENAI_API_KEY
- Render will restart after variable is saved

### "AI processing failed: Invalid API key"
- The API key value is wrong or invalid
- Solution: Double-check the key in Render dashboard
- Make sure it starts with `sk-proj-`
- No extra quotes or spaces

### "AI processing failed: Rate limit exceeded"
- OpenAI API rate limit hit
- Solution: Wait a minute and try again
- Consider implementing request queuing for production

### Timeout or No Response
- OpenAI API slow or unreachable
- Solution: Try again (usually temporary)
- Check OpenAI status: https://status.openai.com

## Verification Checklist

- [ ] Render shows OPENAI_API_KEY in Environment Variables
- [ ] Render deployment completed (green status)
- [ ] Local test works: `curl http://localhost:3000/ai/ask`
- [ ] Production test works: `curl https://aviation-backend-ccw5.onrender.com/ai/ask`
- [ ] Frontend can fetch and parse response
- [ ] No "Cannot POST" or "not valid JSON" errors

## Code Reference

**File:** `/Users/ryoma/aviation-backend/server.js` (Lines 46-76)

```javascript
app.post('/ai/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: openaiKey });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const message = completion.choices[0]?.message?.content || 'No response';
    res.json({ response: message });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('AI error:', message);
    res.status(500).json({ error: `AI processing failed: ${message}` });
  }
});
```

## Next Steps

1. Set OPENAI_API_KEY in Render environment variables
2. Wait for Render to restart (check dashboard)
3. Test with: `curl -X POST https://aviation-backend-ccw5.onrender.com/ai/ask -H "Content-Type: application/json" -d '{"prompt":"test"}'`
4. Switch frontend to production: `USE_LOCAL = false` in `config.ts`
5. Test AI Assist tab in app
