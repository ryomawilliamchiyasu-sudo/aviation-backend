# Live Data Strategy with Offline Capability

## Architecture Overview

```
Frontend (my-first-app)
├── useWeather() hook → Live weather from /api/weather/:icao
├── useAirports() hook → Live airport data + fallback to cached OurAirports
├── useMap() hook → Live map data (OpenStreetMap/Mapbox)
└── Local SQLite/AsyncStorage → Cache layer for offline
    ├── weather_cache (refreshed every 10 min)
    ├── airports_cache (refreshed daily)
    └── map_cache (offline map tiles)

Backend (aviation-backend)
├── GET /api/weather/:icao → Live METAR/TAF from aviationweather.gov
├── GET /api/airports/:icao → Airport info + runways + frequencies
├── GET /api/airports/search → Search airports
└── POST /ai/ask → AI assistance
```

## Current Status

✅ **Weather** - Live data via aviationweather.gov
- GET /api/weather/:icao returns real-time METAR + TAF
- Frontend: useWeather hook already integrated

✅ **Airports** - Basic data available
- GET /api/airports/:icao returns airport details
- Frontend: Currently uses OurAirports.ts static data
- Can be enhanced with live API calls + caching

❌ **Maps** - Not yet implemented
- Need to add map library (react-native-maps or expo-location + Mapbox)
- Need offline tile caching

---

## Implementation Plan

### 1. Weather (Already Working ✓)

**Backend:** GET /api/weather/:icao
- Returns live METAR/TAF every 10 minutes
- No changes needed

**Frontend:** Enhance useWeather hook
```typescript
const useWeather = (icao: string) => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  
  useEffect(() => {
    // Try live API first
    fetch(`${BACKEND_URL}/api/weather/${icao}`)
      .then(r => r.json())
      .then(data => {
        // Save to AsyncStorage for offline
        AsyncStorage.setItem(`weather_${icao}`, JSON.stringify(data));
        setData(data);
        setFromCache(false);
      })
      .catch(() => {
        // Fall back to cached data
        AsyncStorage.getItem(`weather_${icao}`).then(cached => {
          if (cached) {
            setData(JSON.parse(cached));
            setFromCache(true);
          }
        });
      });
  }, [icao]);
  
  return { data, fromCache, lastUpdate };
};
```

### 2. Airports (Enhanced)

**Backend:** Already has endpoints
- GET /api/airports/:icao
- GET /api/airports/search?q=
- GET /api/airports

**Frontend:** New useAirports hook
```typescript
const useAirports = () => {
  const [cache, setCache] = useState<Airport[]>([]);
  
  useEffect(() => {
    // On app start: download all airports
    fetch(`${BACKEND_URL}/api/airports`)
      .then(r => r.json())
      .then(data => {
        AsyncStorage.setItem('airports_cache', JSON.stringify(data));
        setCache(data);
      })
      .catch(() => {
        // Use cached data
        AsyncStorage.getItem('airports_cache').then(cached => {
          if (cached) setCache(JSON.parse(cached));
        });
      });
  }, []);
  
  const search = (query: string) => {
    return cache.filter(a => 
      a.icao.includes(query.toUpperCase()) ||
      a.name.includes(query)
    );
  };
  
  return { airports: cache, search };
};
```

### 3. Maps (New Implementation)

**Choose a map library:**

Option A: **react-native-maps** (Recommended for Expo)
```bash
npm install react-native-maps
npx expo install react-native-maps
```

Option B: **expo-location** + **Mapbox** (Better for offline)
```bash
npx expo install expo-location expo-maps
```

**Backend:** New map data endpoint (optional)
```typescript
app.get('/api/maps/airports/:bbox', (req, res) => {
  // Return airports within bounding box for map view
  const { minLat, maxLat, minLon, maxLon } = req.query;
  const airports = airportData.filter(a =>
    a.lat >= minLat && a.lat <= maxLat &&
    a.lon >= minLon && a.lon <= maxLon
  );
  res.json(airports);
});
```

**Frontend:** Map component
```typescript
import MapView, { Marker, Region } from 'react-native-maps';

export const AirportMap = ({ selectedIcao }) => {
  const [region, setRegion] = useState<Region>({
    latitude: 43.77,
    longitude: -79.63,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });
  
  const { airports } = useAirports();
  
  return (
    <MapView
      style={{ flex: 1 }}
      region={region}
      onRegionChange={setRegion}
    >
      {airports.map(airport => (
        <Marker
          key={airport.icao}
          coordinate={{ latitude: airport.lat, longitude: airport.lon }}
          title={airport.name}
          description={airport.icao}
        />
      ))}
    </MapView>
  );
};
```

---

## Offline-First Architecture

### AsyncStorage Schema

```typescript
interface CacheData {
  'weather_CYYZ': { metar, taf, errors, timestamp };
  'weather_KJFK': { metar, taf, errors, timestamp };
  'airports_cache': Airport[];
  'airports_sync_time': timestamp;
  'map_bounds_cache': GeoJSON;
}
```

### Sync Strategy

```typescript
const useSyncManager = () => {
  useEffect(() => {
    // Sync on app launch and every 15 minutes
    const interval = setInterval(async () => {
      // Weather: sync every 10 minutes (high frequency)
      const storedAirports = await AsyncStorage.getItem('airports_list');
      if (storedAirports) {
        const airports = JSON.parse(storedAirports);
        for (const airport of airports.slice(0, 5)) {
          // Sync last 5 viewed airports
          fetch(`${BACKEND_URL}/api/weather/${airport.icao}`)
            .then(r => r.json())
            .then(data => {
              AsyncStorage.setItem(`weather_${airport.icao}`, JSON.stringify(data));
            })
            .catch(() => {}); // Silently fail if offline
        }
      }
      
      // Airports: sync daily
      const lastSync = await AsyncStorage.getItem('airports_sync_time');
      if (!lastSync || Date.now() - parseInt(lastSync) > 24 * 60 * 60 * 1000) {
        fetch(`${BACKEND_URL}/api/airports`)
          .then(r => r.json())
          .then(data => {
            AsyncStorage.setItem('airports_cache', JSON.stringify(data));
            AsyncStorage.setItem('airports_sync_time', Date.now().toString());
          })
          .catch(() => {}); // Use cached data if offline
      }
    }, 15 * 60 * 1000); // Every 15 minutes
    
    return () => clearInterval(interval);
  }, []);
};
```

---

## Implementation Checklist

### Phase 1: Weather (Already Done ✓)
- [x] GET /api/weather/:icao working
- [x] useWeather hook in frontend
- [ ] Add offline caching to useWeather
- [ ] Add sync manager for weather

### Phase 2: Airports (Ready)
- [x] GET /api/airports endpoints available
- [ ] Create useAirports hook
- [ ] Download all airports on app start
- [ ] Add offline search capability
- [ ] Add sync manager for airports

### Phase 3: Maps (New)
- [ ] Choose map library
- [ ] Create useMap hook
- [ ] Implement map view component
- [ ] Add airport markers to map
- [ ] Add offline map caching (if using Mapbox)

### Phase 4: UI Integration
- [ ] Update airport-plan.tsx with live data
- [ ] Add weather refresh indicator
- [ ] Add "last updated" timestamp
- [ ] Add "offline mode" indicator
- [ ] Add manual sync button

---

## Data Freshness

| Data Type | Update Frequency | Offline Fallback | Critical? |
|-----------|------------------|------------------|-----------|
| Weather | Real-time (live) | Last cached | Yes |
| Airports | Daily | Cached on startup | No |
| Maps | On-demand (user scrolls) | Cached tiles | No |

---

## Files to Create/Modify

### Frontend (my-first-app/)

New files:
```
hooks/useWeather.ts       ← Already exists, enhance with caching
hooks/useAirports.ts      ← Create new
hooks/useMap.ts           ← Create new
hooks/useSyncManager.ts   ← Create new
components/MapView.tsx    ← Create new
app/(tabs)/maps.tsx       ← Create new screen
```

Modify:
```
app/(tabs)/airport-plan.tsx ← Use live data from useAirports
app/(tabs)/ai-assist.tsx    ← Ensure weather context available
```

### Backend (aviation-backend/) - No changes needed

All endpoints already exist:
- GET /api/weather/:icao ✓
- GET /api/airports/:icao ✓
- GET /api/airports/search ✓
- POST /ai/ask ✓

---

## Testing Strategy

1. **Live Data Test**
   - Fetch weather for CYYZ, verify real-time data
   - Fetch airports, verify complete dataset
   - Verify map displays correctly

2. **Offline Test**
   - Cache data by viewing weather/airports
   - Turn off network (Airplane mode)
   - Verify cached data displays
   - Verify timestamp shows "offline"

3. **Sync Test**
   - Cache weather for KJFK
   - Turn off network
   - Wait 15+ minutes (offline)
   - Turn network back on
   - Verify weather syncs automatically

---

## Recommended Next Steps

1. **Enhance useWeather** with offline caching (5 mins)
2. **Create useAirports** hook (10 mins)
3. **Create useSyncManager** for background sync (15 mins)
4. **Update airport-plan.tsx** to use live data (10 mins)
5. **Add map library** and MapView component (30 mins)

Total: ~70 minutes to full implementation

Ready to proceed?
