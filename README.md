# Aviation Backend API

A Node.js/Express API backend for the Electronic Aviation Book (EAB) application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
cd /Users/ryoma/aviation-backend
npm install
```

### Running Locally

```bash
npm start
```

Backend runs on `http://localhost:3000`

### Environment Variables

Create a `.env` file:

```env
PORT=3000
OPENAI_API_KEY=your_key_here
```

## 📁 Project Structure

```
aviation-backend/
├── server.js              # Main Express app
├── src/
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   └── services/         # Business logic
├── package.json          # Backend dependencies ONLY
├── .env                  # Environment variables (NOT in git)
└── API_*.md             # Endpoint documentation
```

## 🔌 API Endpoints

### Health Check
```
GET /test                                    → {"ok":true,"message":"API alive"}
GET /                                        → API documentation
```

### Weather
```
GET /api/weather/metar/:icao                 → Current conditions (METAR)
GET /api/weather/taf/:icao                   → Forecast (TAF)
GET /api/weather/:icao                       → Combined weather
```

### Airports
```
GET /api/airports/search?q=query             → Search airports
GET /api/airports/:icao                      → Airport details
GET /api/airports/province/:code             → Filter by province
GET /api/airports                            → All airports
```

### AI
```
POST /ai/ask                                 → AI prompt processing
```

See [API_WEATHER.md](API_WEATHER.md) and [API_AIRPORTS.md](API_AIRPORTS.md) for details.

## 📦 Dependencies (Backend Only)

- **express** - Web framework
- **cors** - Cross-Origin Resource Sharing
- **body-parser** - Request parsing
- **dotenv** - Environment management
- **openai** - AI integration

## 🔗 Frontend Connection

This is a **backend-only** repository. The frontend is at `/Users/ryoma/my-first-app`

### How Frontend Connects

The frontend's `config.ts` specifies this backend's URL:

```typescript
// my-first-app/config.ts
const USE_LOCAL = false;  // true = localhost:3000, false = production
const PRODUCTION_URL = 'https://aviation-backend-ccw5.onrender.com';
const LOCAL_URL = 'http://localhost:3000';
export const BACKEND_URL = USE_LOCAL ? LOCAL_URL : PRODUCTION_URL;
```

### Development Workflow

**Terminal 1 - Start Backend:**
```bash
cd /Users/ryoma/aviation-backend
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - Start Frontend:**
```bash
cd /Users/ryoma/my-first-app
npm run web
# Runs on http://localhost:8081
# Set USE_LOCAL = true in config.ts to use local backend
```

## 🌐 Deployment

**Production Backend**: https://aviation-backend-ccw5.onrender.com (auto-deployed on git push)

## 🏗️ Architecture

```
Frontend (my-first-app) → HTTP Requests → Backend (aviation-backend) → External APIs
   :8081                    CORS enabled      :3000 (local)           aviationweather.gov
                          JSON responses                               OpenAI API
```

## 📚 Documentation

- [EAB_SPECIFICATION.md](EAB_SPECIFICATION.md) - Complete project specification
- [API_WEATHER.md](API_WEATHER.md) - Weather endpoints documentation
- [API_AIRPORTS.md](API_AIRPORTS.md) - Airport endpoints documentation
- [SETUP.md](SETUP.md) - Initial setup instructions
- [DEPLOY.md](DEPLOY.md) - Deployment guide

## 🔧 Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Start the backend server |
| `npm run dev` | Start with watch mode |
| `npm test` | Run tests |

## 🛡️ Security

- ✅ API keys in `.env` (never committed)
- ✅ CORS configured for frontend
- ✅ Server-side AI processing (keys protected)
- ✅ Input validation on endpoints

## 🐛 Troubleshooting

**Backend won't start?**
```bash
lsof -i :3000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
npm start
```

**Frontend can't reach backend?**
1. Verify `config.ts` in my-first-app has correct URL
2. Set `USE_LOCAL = true` for local dev
3. Check backend is running: `curl http://localhost:3000/test`

**Weather API not working?**
```bash
curl http://localhost:3000/api/weather/metar/CYYZ
```

## 📝 License

ISC
