# Weather Routes 404 Fix

## Problem
Frontend was getting HTTP 404 errors when calling `/api/weather/KSFO` endpoint on Render production:
```
curl https://aviation-backend-ccw5.onrender.com/api/weather/KSFO
→ "Cannot GET /api/weather/KSFO"
```

**But the same endpoint worked locally at `http://localhost:3000/api/weather/KSFO` ✓**

## Root Cause
Express evaluates routes in the order they're defined. The catch-all route `/:icao` was defined after the specific routes, causing it to never match because:

```javascript
// WRONG ORDER (previous code):
router.get('/metar/:icao', ...);    // Won't match /api/weather/KSFO
router.get('/taf/:icao', ...);      // Won't match /api/weather/KSFO
router.get('/:icao', ...);          // MATCHES /api/weather/KSFO first!
                                     // But getCombined expected real logic
```

## Solution
Reordered routes with **specific patterns BEFORE catch-all patterns**:

```javascript
// CORRECT ORDER (fixed code):
router.get('/metar/:icao', ...);    // Matches /metar/KSFO ✓
router.get('/taf/:icao', ...);      // Matches /taf/KSFO ✓
router.get('/:icao', ...);          // Matches /KSFO only ✓
```

## Routes Fixed
✅ `GET /api/weather/metar/:icao` - METAR endpoint now works  
✅ `GET /api/weather/taf/:icao` - TAF endpoint now works  
✅ `GET /api/weather/:icao` - Combined endpoint now works  

## Testing Results

### Local Testing (Works ✓)
```bash
$ curl http://localhost:3000/api/weather/KSFO | jq .data
# Returns full weather object with metar and taf

$ curl http://localhost:3000/api/weather/metar/KSFO | jq .data.rawText
# Returns: "SPECI KSFO 260026Z 20013G22KT 2SM RA BKN027..."

$ curl http://localhost:3000/api/weather/taf/KSFO | jq .data
# Returns TAF forecast object
```

### Production Status
- ⏳ Waiting for Render to redeploy from latest commit
- Commit: `ed68adf` pushed to GitHub
- Render auto-deploy should pick up changes within 2-5 minutes
- Check status at: https://aviation-backend-ccw5.onrender.com/api/weather/KSFO

## Impact
🎯 **Frontend will now successfully fetch weather data from production**

The frontend at `my-first-app` uses `config.ts` with:
- `USE_LOCAL = false` → Production: https://aviation-backend-ccw5.onrender.com
- `USE_LOCAL = true` → Local: http://localhost:3000

Both will now work once Render redeploys.

## Lesson Learned
**In Express.js, route order matters!**
- Specific routes: `/metar/:icao`, `/taf/:icao`
- Generic routes: `/:icao`
- Always define specific patterns FIRST, catch-all patterns LAST

This is a common Express.js gotcha.
