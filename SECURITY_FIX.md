# Security Fix: OpenAI API Key Exposure

## Problem
The frontend (ai-assist.tsx) was attempting to use the OpenAI API directly from the React Native browser environment, which would expose your API key to attackers.

**Error Message:**
```
Error: It looks like you're running in a browser-like environment.
This is disabled by default, as it risks exposing your secret API credentials to attackers.
```

## Solution
Moved all OpenAI API calls to the **secure backend server** where API keys are never exposed to clients.

### Changes Made:

#### 1. Backend (server.js)
- Added new `/ai/ask` endpoint (POST)
- Handles all OpenAI API communication server-side
- Uses `process.env.OPENAI_API_KEY` (backend environment variable only)
- Returns only the response text to frontend

**Endpoint:**
```
POST /ai/ask
Body: { "prompt": "Your question here" }
Response: { "response": "AI answer" }
```

#### 2. Frontend (app/(tabs)/ai-assist.tsx)
- Removed `import OpenAI from 'openai'`
- Removed `OPENAI_API_KEY` environment variable
- Now calls backend `/ai/ask` endpoint via fetch
- Never handles API keys directly

#### 3. Dependencies
- Backend package.json: Added `"openai": "^6.15.0"`
- Run: `npm install openai` (already done)

## How It Works

```
┌─────────────────┐
│   Frontend      │
│   (React Native)│
└────────┬────────┘
         │ POST /ai/ask
         │ { prompt: "..." }
         ▼
┌─────────────────┐
│   Backend       │
│   (Express)     │
│ - Has API key   │
│ - Calls OpenAI  │
│ - Returns text  │
└────────┬────────┘
         │ { response: "..." }
         ▼
┌─────────────────┐
│   Frontend      │
│   Displays text │
└─────────────────┘
```

## Setup

### Server-side only:
Set your OpenAI API key as an environment variable on your backend:

**Local development (.env):**
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

**Render deployment:**
1. Go to your Render service dashboard
2. Navigate to Environment → Environment Variables
3. Add: `OPENAI_API_KEY` = `sk-your-actual-key-here`

The frontend never sees this key.

## Testing

**Curl test:**
```bash
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is a headwind?"}'
```

**Expected response:**
```json
{ "response": "A headwind is..." }
```

## Security Benefits

✅ **API key protected** - Only on backend, never sent to clients  
✅ **No browser exposure** - No direct OpenAI SDK in frontend  
✅ **Rate limiting possible** - Backend can implement per-user limits  
✅ **Audit trail** - Server logs all AI requests  
✅ **Token counting** - Backend can track usage costs  

## Commits
After testing, commit:
```bash
git add server.js package.json app/(tabs)/ai-assist.tsx
git commit -m "Security: Move OpenAI API calls to backend endpoint"
git push origin main
```

---
**Status:** ✅ Fixed and tested
