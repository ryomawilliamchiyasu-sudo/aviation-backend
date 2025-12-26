# Backend API Testing Guide

## Quick Status
✅ **All endpoints working locally** at `http://localhost:3000`  
⏳ **Render production** awaiting redeploy (auto-deploy from GitHub)

## How to Test Locally

### Start the Server
```bash
cd /Users/ryoma/aviation-backend
npm start
# Server will run at http://localhost:3000
```

### Test All Endpoints

#### 1. Health Check
```bash
curl http://localhost:3000/test
# ✓ Returns: {"ok":true,"message":"API alive"}
```

#### 2. API Documentation
```bash
curl http://localhost:3000/
# ✓ Lists all available endpoints
```

#### 3. Weather Endpoints

**Get METAR (current conditions):**
```bash
curl http://localhost:3000/api/weather/metar/KSFO
# ✓ Returns METAR data with wind, visibility, temperature
```

**Get TAF (forecast):**
```bash
curl http://localhost:3000/api/weather/taf/KSFO
# ✓ Returns forecast groups, valid period
```

**Get Combined (METAR + TAF):**
```bash
curl http://localhost:3000/api/weather/KSFO
# ✓ Returns both datasets merged
```

#### 4. Airport Endpoints

**Search airports:**
```bash
curl "http://localhost:3000/api/airports/search?q=toronto"
# ✓ Returns matching airports (ICAO, IATA, name, province)
```

**Get all airports:**
```bash
curl http://localhost:3000/api/airports
# ✓ Returns all Canadian airports in database
```

**Get by ICAO:**
```bash
curl http://localhost:3000/api/airports/CYYZ
# ✓ Returns Toronto Pearson details
```

**Get by province:**
```bash
curl http://localhost:3000/api/airports/province/ON
# ✓ Returns all Ontario airports
```

#### 5. AI Endpoint
```bash
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"message":"What does METAR stand for?"}'
# ✓ Returns OpenAI response
```

## Production Testing

When Render redeploys (replacing `http://localhost:3000` with `https://aviation-backend-ccw5.onrender.com`):

```bash
# Test health
curl https://aviation-backend-ccw5.onrender.com/test

# Test weather
curl https://aviation-backend-ccw5.onrender.com/api/weather/KSFO

# Test airports
curl https://aviation-backend-ccw5.onrender.com/api/airports/search?q=toronto
```

## Expected Responses

### Weather/METAR Response
```json
{
  "status": "ok",
  "type": "METAR",
  "data": {
    "icao": "KSFO",
    "timestamp": "2025-12-26T00:26:00.000Z",
    "rawText": "SPECI KSFO 260026Z ...",
    "wind": { "direction": 200, "speed": 13, "gust": 22, "unit": "knots" },
    "visibility": { "miles": 2, "unit": "statute miles" },
    "temperature": { "celsius": 12.8, "fahrenheit": 55.04 },
    "dewpoint": { "celsius": 10, "fahrenheit": 50 },
    "altimeter": { "inchesHg": 1008.5 }
  }
}
```

### Weather/TAF Response
```json
{
  "status": "ok",
  "type": "TAF",
  "data": {
    "icao": "KSFO",
    "timestamp": "2025-12-25T23:39:00.000Z",
    "validPeriod": { "start": 1766707200, "end": 1766815200 },
    "forecastGroups": []
  }
}
```

### Airport Search Response
```json
{
  "query": "toronto",
  "count": 1,
  "results": [
    {
      "icao": "CYYZ",
      "iata": "YYZ",
      "name": "Toronto Pearson International Airport",
      "city": "Toronto",
      "province": "ON"
    }
  ]
}
```

## Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
npm start
```

### Routes Return 404
Check that routes are ordered correctly in `src/routes/weatherRoutes.js`:
- Specific routes (`/metar/:icao`, `/taf/:icao`) must come BEFORE
- Generic routes (`/:icao`)

### API Key Issues
Verify `.env` file exists in project root:
```bash
cat /Users/ryoma/aviation-backend/.env
# Should contain: OPENAI_API_KEY=sk-...
```

### CORS Issues
If frontend gets CORS errors, verify `server.js` has:
```javascript
const cors = require('cors');
app.use(cors());
```

## Frontend Integration

Frontend at `/Users/ryoma/my-first-app` connects via:
- **config.ts**: `USE_LOCAL = true` for local, `false` for production
- **useWeather hook**: Calls `${BACKEND_URL}/api/weather/${icao}`
- **Airport search**: Calls `${BACKEND_URL}/api/airports/search?q=${query}`

When Render redeploys, simply set `USE_LOCAL = false` in config.ts.
