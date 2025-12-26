# Aviation Backend API

**Backend Only** - Node.js/Express server providing aviation data and AI integration.

## Quick Start

```bash
# Install dependencies
npm install

# Start backend server
npm start
# Backend runs on http://localhost:3000
```

## Environment Setup

Create `.env` file in this directory:
```
OPENAI_API_KEY=your_key_here
PORT=3000
```

## Project Structure

```
aviation-backend/
├── server.js              ← Main Express app entry point
├── package.json           ← Dependencies
├── .env                   ← Environment variables (NOT in git)
├── src/
│   ├── routes/            ← API endpoint routes
│   ├── controllers/       ← Request handlers
│   ├── services/          ← Business logic & external API calls
│   └── data/              ← Local data (airports, etc.)
├── API_WEATHER.md         ← Weather endpoint documentation
├── API_AIRPORTS.md        ← Airport endpoint documentation
└── EAB_SPECIFICATION.md   ← Full app spec
```

## API Endpoints

### Root
- `GET /` - API documentation and endpoint listing
- `GET /test` - Health check

### Weather (Real Data from aviationweather.gov)
- `GET /api/weather/metar/:icao` - Current METAR
- `GET /api/weather/taf/:icao` - Terminal Aerodrome Forecast
- `GET /api/weather/:icao` - Combined METAR + TAF

### Airports (Local Data)
- `GET /api/airports/search?q=query` - Search airports
- `GET /api/airports/:icao` - Get airport details
- `GET /api/airports/province/:code` - Filter by province
- `GET /api/airports` - Get all airports

### AI (Server-Side Processing)
- `POST /ai/ask` - Send prompt to OpenAI (API key protected on backend)

## Integration with Frontend

**Frontend Repository**: `/Users/ryoma/my-first-app` (separate Expo project)

**Connection**:
- Frontend uses `config.ts` with `BACKEND_URL`
- Frontend points to this backend API
- All API calls go through Node.js (secure - API keys never exposed)

**Frontend Configuration** (in my-first-app):
```typescript
// config.ts
const USE_LOCAL = true;  // Set to true for local dev
const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://aviation-backend-ccw5.onrender.com';
export const BACKEND_URL = USE_LOCAL ? LOCAL_URL : PRODUCTION_URL;
```

## Deployment

**Platform**: Render Cloud  
**URL**: https://aviation-backend-ccw5.onrender.com  
**Auto-Deploy**: On git push to main branch

## Security

✅ **API Keys Protected**
- OPENAI_API_KEY stored in `.env` on backend only
- Never exposed to frontend
- Frontend makes requests to backend endpoint `/ai/ask`
- Backend processes securely server-side

✅ **CORS Enabled**
- Allows requests from frontend domain

✅ **Input Validation**
- All endpoints validate ICAO codes and queries
- Error handling for invalid requests

## Testing

```bash
# Test backend health
curl http://localhost:3000/test

# Test METAR endpoint
curl http://localhost:3000/api/weather/metar/CYYZ

# Test airport search
curl "http://localhost:3000/api/airports/search?q=Toronto"

# Test AI endpoint
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is density altitude?"}'
```

## Architecture

```
Frontend (my-first-app)
    ↓ (fetch with BACKEND_URL)
Backend API (this server)
    ├─→ aviationweather.gov (real METAR/TAF)
    ├─→ OpenAI API (AI responses)
    └─→ Local data (airports)
```

## Frontend Commands (From my-first-app folder)

```bash
cd /Users/ryoma/my-first-app

# Start frontend on http://localhost:8081
npm run web

# Make sure backend is running first!
# cd /Users/ryoma/aviation-backend && npm start
```

## Documentation

- [EAB_SPECIFICATION.md](EAB_SPECIFICATION.md) - Full app specification
- [API_WEATHER.md](API_WEATHER.md) - Detailed weather endpoint docs
- [API_AIRPORTS.md](API_AIRPORTS.md) - Detailed airport endpoint docs

---

**Status**: ✅ Production Ready  
**Last Updated**: December 25, 2025
