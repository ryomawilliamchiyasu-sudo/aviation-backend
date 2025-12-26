# Backend Debugging Guide - 404 Non-JSON Error

## Issue: "HTTP 404: Backend returned non-JSON"

This error typically occurs when:
1. ❌ The frontend is calling an endpoint that doesn't exist
2. ❌ The endpoint is returning HTML instead of JSON (usually an error page)
3. ❌ There's a middleware issue causing headers to be incorrect
4. ❌ CORS is blocking the request before it reaches the backend

## How to Debug

### Step 1: Enable Request Logging
The backend now logs all requests. Check the server output for:
```
📝 GET /api/weather/cyyz
   → 200 /api/weather/cyyz
```

If you see a different path than expected, the frontend is calling the wrong endpoint.

### Step 2: Test Endpoints Directly
Use curl to test all endpoints. They should ALL return JSON:

```bash
# Health check
curl http://localhost:3000/health

# Weather endpoints
curl http://localhost:3000/api/weather/cyyz
curl http://localhost:3000/api/weather/metar/cyyz
curl http://localhost:3000/api/weather/taf/cyyz

# Airport endpoints
curl http://localhost:3000/api/airports
curl "http://localhost:3000/api/airports/search?q=toronto"
curl http://localhost:3000/api/airports/province/on
curl http://localhost:3000/api/airports/cyyz

# AI endpoint
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is aviation?"}'

# Invalid endpoint (should return 404 JSON)
curl http://localhost:3000/api/invalid
```

### Step 3: Check Response Headers
Verify that ALL responses have `Content-Type: application/json`:

```bash
curl -i http://localhost:3000/health
```

Should show:
```
Content-Type: application/json; charset=utf-8
```

### Step 4: Common 404 Issues

#### Problem: Wrong endpoint path
**Solution:** Check frontend is using correct URLs:
- ✅ `/api/weather/:icao` (combined METAR + TAF)
- ✅ `/api/weather/metar/:icao` (METAR only)
- ✅ `/api/weather/taf/:icao` (TAF only)
- ❌ `/api/weather?icao=CYYZ` (WRONG - uses query param)

#### Problem: Missing required query parameters
**Solution:** Airport search REQUIRES `q` parameter:
- ✅ `/api/airports/search?q=toronto`
- ❌ `/api/airports/search` (MISSING q parameter)

#### Problem: ICAO code format
**Solution:** ICAO codes must be EXACTLY 4 letters:
- ✅ `/api/weather/CYYZ` or `/api/weather/cyyz` (auto-converted to uppercase)
- ❌ `/api/weather/YYZ` (only 3 letters)
- ❌ `/api/weather/CYYZ123` (more than 4 letters)

## Route Order Issue (FIXED)

**CRITICAL:** Route order matters in Express!

Weather routes are now ordered correctly:
```javascript
router.get('/metar/:icao', ...);  // SPECIFIC: /metar/XXXX
router.get('/taf/:icao', ...);    // SPECIFIC: /taf/XXXX
router.get('/:icao', ...);        // CATCH-ALL: /XXXX
```

❌ **WRONG ORDER:** (Would match /health as /:icao)
```javascript
router.get('/:icao', ...);        // Catch-all first
router.get('/metar/:icao', ...);  // Never reached
```

Airport routes also ordered correctly:
```javascript
router.get('/search', ...);       // SPECIFIC
router.get('/province/:province', ...); // SPECIFIC
router.get('/:icao', ...);        // CATCH-ALL
router.get('/', ...);             // ROOT
```

## Recent Changes

### 1. Enhanced Error Logging
- All errors now include timestamp and path info
- 404 errors clearly logged with endpoint info
- Easier to identify which routes are being called

### 2. Improved Headers
- Content-Type explicitly set on all JSON responses
- Override default res.json() to ensure consistency
- CORS headers always present for cross-origin requests

### 3. Request Logging
- All incoming requests logged with method and path
- Response status logged when response finishes
- Makes it easy to see what's being called

## Monitoring Server Output

Watch the terminal where server is running:

```bash
node server.js
```

Look for patterns:
- ✅ `📝 GET /api/weather/cyyz` → `200 /api/weather/cyyz` = OK
- ❌ `📝 GET /health` → `404 /health` = Wrong route order
- ⚠️ No logs = CORS or network issue

## Frontend Integration Checklist

If still getting 404 non-JSON:

- [ ] Verify BACKEND_URL is correct in config
- [ ] Check network tab in browser/device dev tools
- [ ] Verify CORS origin is allowed (should see `Access-Control-Allow-Origin`)
- [ ] Ensure request is using correct HTTP method (GET vs POST)
- [ ] Check that path parameters are 4-letter ICAO codes
- [ ] Verify query parameters (e.g., `?q=` for search)
- [ ] Test endpoint directly with curl first

## Quick Test Script

Save as `test-backend.sh`:

```bash
#!/bin/bash
echo "Testing Aviation Backend..."
echo ""
echo "✓ Health: $(curl -s http://localhost:3000/health)"
echo "✓ Weather: $(curl -s http://localhost:3000/api/weather/cyyz | jq -r '.data.icao')"
echo "✓ Airports: $(curl -s http://localhost:3000/api/airports | jq -r '.count') airports"
echo "✓ Search: $(curl -s 'http://localhost:3000/api/airports/search?q=toronto' | jq -r '.count') results"
echo ""
echo "All tests passed!"
```

Run:
```bash
bash test-backend.sh
```

## Still Having Issues?

1. Stop the server: `pkill -f "node server"`
2. Start fresh: `cd /Users/ryoma/aviation-backend && node server.js`
3. Check for startup errors in console output
4. Try hitting `/health` endpoint first (simplest)
5. Share the exact error message and which endpoint fails

## Summary

The backend is now configured to:
- ✅ Always return JSON (never HTML)
- ✅ Log all requests for debugging
- ✅ Handle 404s properly with JSON
- ✅ Have correct route ordering
- ✅ Support CORS for frontend requests

If the error persists, it's likely a frontend issue (wrong URL, wrong parameter format, etc).
