# AI Feature Setup Guide

## What's Working ✅

- Backend `/ai/ask` endpoint is implemented and working
- OpenAI SDK is installed on the backend
- Endpoint correctly validates the API key

## What You Need to Do 📋

### 1. Set Your OpenAI API Key

**For Local Development:**

Create a `.env` file in `/Users/ryoma/aviation-backend/`:

```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

Then restart your backend:
```bash
cd /Users/ryoma/aviation-backend
npm start
```

**For Render Deployment:**

1. Go to https://dashboard.render.com
2. Click on your `aviation-backend` service
3. Go to **Settings** → **Environment**
4. Add a new environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-openai-key-here`
5. Deploy (Render will auto-redeploy)

### 2. Get Your OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy it (you can only see it once)
4. Save it in your `.env` file

### 3. Test the Endpoint

Once your API key is set, test locally:

```bash
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is a METAR?"}'
```

Expected response:
```json
{"response": "A METAR is a standardized format for reporting weather information..."}
```

## How the Frontend Uses It

The frontend (`my-first-app`) makes requests like:

```typescript
const response = await fetch(`${BACKEND_URL}/ai/ask`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: userQuestion })
});

const data = await response.json();
console.log(data.response); // AI answer
```

## Endpoint Reference

**POST** `/ai/ask`

**Request:**
```json
{
  "prompt": "Your question here"
}
```

**Response (Success):**
```json
{
  "response": "AI's answer to your question"
}
```

**Response (Error - No API Key):**
```json
{
  "error": "OpenAI API key not configured on server"
}
```

**Response (Error - Empty Prompt):**
```json
{
  "error": "Prompt is required"
}
```

## Current Status

- ✅ Backend endpoint: `/ai/ask` is ready
- ❌ API key: Not set yet (need to add to `.env` or Render)
- ✅ Frontend: Ready to use the endpoint

---

**Next Step:** Set your `OPENAI_API_KEY` environment variable, then the feature will work!
