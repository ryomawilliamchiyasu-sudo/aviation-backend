# Aviation Backend - Quick Setup Guide

## ✅ Current Status
- ✓ Backend: Running on http://localhost:3000
- ✓ ngrok: https://quadrangled-jacelyn-boyish.ngrok-free.dev
- ✓ Frontend config: Updated at /Users/ryoma/my-first-app/config.ts

## 🚀 Quick Start

### Start Backend (Choose One)
```bash
cd /Users/ryoma/aviation-backend
npm start              # Mock server (recommended for development)
# OR
node server.js         # Live API with real aviation data
```

### Start ngrok (For Physical Devices)
```bash
ngrok http 3000
# Copy the HTTPS URL and update frontend config.ts NGROK_URL
```

### Start Frontend
```bash
cd /Users/ryoma/my-first-app
npm start
```

## 📱 Testing Modes

### Simulator/Emulator (Default)
In `my-first-app/config.ts`:
```typescript
const USE_NGROK = false;  // Uses localhost:3000
```

### Physical Device
In `my-first-app/config.ts`:
```typescript
const USE_NGROK = true;   // Uses ngrok URL
const NGROK_URL = 'https://your-new-url.ngrok-free.dev';  // Update this!
```

## 🧪 Test Endpoints

### Local
```bash
curl http://localhost:3000/test
curl http://localhost:3000/weather?station=CYYZ
curl http://localhost:3000/airport?code=KJFK
curl -X POST http://localhost:3000/ai/transcribe -H "Content-Type: application/json" -d '{}'
```

### ngrok
```bash
curl https://quadrangled-jacelyn-boyish.ngrok-free.dev/test
curl https://quadrangled-jacelyn-boyish.ngrok-free.dev/weather?station=KJFK
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9
```

### Find Running Processes
```bash
ps aux | grep -E "(node|ngrok)" | grep -v grep
```

### Get Current ngrok URL
```bash
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'])"
```

## 📚 API Endpoints

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/test` | GET | - | Health check |
| `/weather` | GET | `?station=CYYZ` | METAR/TAF data |
| `/airport` | GET | `?code=CYYZ` | Airport info (mock only) |
| `/ai/transcribe` | POST | JSON body | AI transcription (mock only) |

## 🔄 When ngrok URL Changes

1. Get new URL: `curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*'`
2. Update `/Users/ryoma/my-first-app/config.ts` → `NGROK_URL`
3. Restart your frontend app
