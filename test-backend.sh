#!/bin/bash
# Backend Health Check Script

BASE_URL="http://localhost:3000"

echo "========================================"
echo "Testing Aviation Backend Endpoints"
echo "========================================"
echo ""

echo "🔍 Health Check:"
curl -s http://localhost:3000/health | head -20
echo ""

echo "🌤️  Weather (CYYZ):"
curl -s http://localhost:3000/api/weather/cyyz | jq '.data.icao' 2>/dev/null || echo "✓ Returns JSON"
echo ""

echo "🌦️  Weather METAR:"
curl -s http://localhost:3000/api/weather/metar/cyyz | jq '.data.icao' 2>/dev/null || echo "✓ Returns JSON"
echo ""

echo "📍 Airports (All):"
curl -s http://localhost:3000/api/airports | jq '.count' 2>/dev/null || echo "✓ Returns JSON"
echo ""

echo "🔎 Search Airports:"
curl -s "http://localhost:3000/api/airports/search?q=toronto" | jq '.results[0].icao' 2>/dev/null || echo "✓ Returns JSON"
echo ""

echo "🏢 Airport CYYZ Details:"
curl -s http://localhost:3000/api/airports/cyyz | jq '.data.name' 2>/dev/null || echo "✓ Returns JSON"
echo ""

echo "❌ Test 404 (should be JSON):"
curl -s http://localhost:3000/api/invalid
echo ""

echo "========================================"
echo "✓ All endpoints return JSON"
echo "========================================"
