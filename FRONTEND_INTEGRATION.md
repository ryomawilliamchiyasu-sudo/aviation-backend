# Frontend Integration Guide - Live Data + Offline

## 📦 Installation

### Step 1: Install Dependencies

```bash
cd /Users/ryoma/my-first-app

# Install maps library
npx expo install react-native-maps

# Install offline storage
npx expo install @react-native-async-storage/async-storage

# Install app lifecycle tracking
npx expo install expo-app-state
```

### Step 2: Copy Hook and Component Files

Copy these files from `/Users/ryoma/aviation-backend/frontend-hooks/` to your project:

```bash
cp /Users/ryoma/aviation-backend/frontend-hooks/*.ts hooks/
cp /Users/ryoma/aviation-backend/frontend-components/*.tsx components/
```

Your structure should be:
```
my-first-app/
├── hooks/
│   ├── useWeather.ts       (new - with offline caching)
│   ├── useAirports.ts      (new - download & cache all airports)
│   ├── useSyncManager.ts   (new - auto-sync background)
├── components/
│   ├── AirportMapView.tsx  (new - map display)
│   ├── MetarDisplay.tsx    (existing)
│   ├── TafDisplay.tsx      (existing)
├── app/
│   └── (tabs)/
│       ├── weather.tsx     (update - use enhanced useWeather)
│       ├── airport-plan.tsx (update - use useAirports)
│       ├── maps.tsx        (create new - use AirportMapView)
│       └── ai-assist.tsx   (existing)
```

---

## 🔧 Integration Steps

### Step 1: Update `weather.tsx`

Replace the weather tab implementation to use the enhanced hook:

```typescript
// app/(tabs)/weather.tsx
import { useWeather } from '../../hooks/useWeather';
import { BACKEND_URL } from '../../config';

export default function WeatherScreen() {
  const [icao, setIcao] = useState('CYYZ');
  const { data, loading, error, fromCache, lastUpdate, fetchWeather } = useWeather(icao, BACKEND_URL);

  useEffect(() => {
    fetchWeather();
  }, [icao]);

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Enter ICAO (e.g., CYYZ)"
        value={icao}
        onChangeText={setIcao}
        style={styles.input}
      />
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {fromCache ? '⚠️' : '❌'} {error}
          </Text>
        </View>
      )}

      {data && (
        <>
          {data.metar && <MetarDisplay metar={data.metar} />}
          {data.taf && <TafDisplay taf={data.taf} />}
        </>
      )}

      {loading && <ActivityIndicator />}
      {lastUpdate && (
        <Text style={styles.timestamp}>
          Last updated: {lastUpdate.toLocaleTimeString()}
          {fromCache ? ' (offline)' : ''}
        </Text>
      )}
    </ScrollView>
  );
}
```

### Step 2: Update `airport-plan.tsx`

Replace with live airport data:

```typescript
// app/(tabs)/airport-plan.tsx
import { useAirports } from '../../hooks/useAirports';
import { useSyncManager } from '../../hooks/useSyncManager';
import { BACKEND_URL } from '../../config';

export default function AirportPlanScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { airports, search, loading, fromCache, lastSync, totalCount } = useAirports(BACKEND_URL);
  const { trackAirportView } = useSyncManager(BACKEND_URL);

  const results = searchQuery ? search(searchQuery) : airports.slice(0, 20);

  const handleAirportSelect = (airport: Airport) => {
    trackAirportView(airport.icao);
    // Navigate to airport details or update map
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search airports by name, ICAO, or city"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {fromCache && (
        <Text style={styles.cacheNotice}>
          📦 Using cached data ({totalCount} airports available offline)
        </Text>
      )}

      {lastSync && (
        <Text style={styles.syncTime}>
          Synced: {lastSync.toLocaleString()}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.icao}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleAirportSelect(item)}>
            <View style={styles.airportItem}>
              <Text style={styles.airportName}>{item.name}</Text>
              <Text style={styles.airportCode}>{item.icao} • {item.city}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
```

### Step 3: Create `maps.tsx`

Create a new maps screen:

```typescript
// app/(tabs)/maps.tsx
import { AirportMapView } from '../../components/AirportMapView';
import { BACKEND_URL } from '../../config';
import { useState } from 'react';

export default function MapsScreen() {
  const [selectedIcao, setSelectedIcao] = useState<string>();

  return (
    <AirportMapView
      backendUrl={BACKEND_URL}
      selectedIcao={selectedIcao}
      onAirportSelect={setSelectedIcao}
    />
  );
}
```

### Step 4: Setup App Initialization

Update your root layout to initialize sync manager on app start:

```typescript
// app/_layout.tsx or app.tsx
import { useSyncManager } from '../hooks/useSyncManager';
import { BACKEND_URL } from '../config';

export default function RootLayout() {
  // Initialize background sync
  useSyncManager(BACKEND_URL, {
    weatherSyncInterval: 10,     // Every 10 minutes
    airportSyncInterval: 24,     // Every 24 hours
    onSyncStart: () => console.log('Syncing data...'),
    onSyncComplete: () => console.log('Sync complete'),
    onSyncError: (err) => console.error('Sync error:', err)
  });

  return (
    // ... your layout code
  );
}
```

---

## 🔄 How It Works

### Weather Flow
```
User opens app
  ↓
useWeather hook called
  ↓
Tries to fetch from /api/weather/:icao
  ↓
Success? → Display live data + save to AsyncStorage
Fail? → Load from AsyncStorage, show "offline" indicator
  ↓
Background sync every 10 minutes when online
```

### Airports Flow
```
App starts
  ↓
useAirports hook loads cached data (instant)
  ↓
Check if cache is >24 hours old
  ↓
If stale → Sync all airports from /api/airports
  ↓
Save to AsyncStorage (works offline)
  ↓
Search/filter works instantly from cache
```

### Maps Flow
```
Maps screen loads
  ↓
useAirports provides airport coordinates
  ↓
MapView renders markers for visible airports
  ↓
User scrolls/zooms
  ↓
Map updates visible airports dynamically
```

### Background Sync
```
useSyncManager starts on app launch
  ↓
Every 10 minutes: Sync last 5 viewed airports' weather
  ↓
Every 24 hours: Sync all airports
  ↓
When app comes to foreground: Trigger immediate sync
  ↓
If offline: Skip silently, use cached data
```

---

## 📊 Data Storage

### AsyncStorage Keys
```typescript
// Weather cache
'weather_CYYZ' → { data: {...}, timestamp: 1234567890 }
'weather_KJFK' → { data: {...}, timestamp: 1234567890 }

// Airports cache
'airports_cache' → [...] // All airports
'airports_sync_time' → 1234567890

// Tracking
'viewed_airports' → ['CYYZ', 'KJFK', 'CYVR'] // Last 20 viewed
```

---

## ✅ Testing Checklist

- [ ] Install all dependencies without errors
- [ ] Weather hook loads live data
- [ ] Weather caches to AsyncStorage
- [ ] Turn off network → Weather shows cached data
- [ ] Turn on network → Weather updates automatically
- [ ] Airports load all 1000+ airports on first sync
- [ ] Airport search works offline
- [ ] Map renders airport markers
- [ ] Clicking marker on map selects it
- [ ] Background sync runs every 10 minutes
- [ ] Check AsyncStorage contains cached data

---

## 🐛 Debugging

### Check if sync is working:
```typescript
// In any component
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
  AsyncStorage.getAllKeys().then(keys => {
    console.log('Cached keys:', keys);
    keys.forEach(key => {
      AsyncStorage.getItem(key).then(value => {
        console.log(`${key}:`, value?.substring(0, 100));
      });
    });
  });
}, []);
```

### Check network status:
```typescript
import NetInfo from '@react-native-community/netinfo';

useEffect(() => {
  NetInfo.fetch().then(state => {
    console.log('Is connected:', state.isConnected);
    console.log('Type:', state.type);
  });
}, []);
```

---

## 🚀 Performance Tips

1. **Lazy load map** - Only render map component when tab is selected
2. **Debounce search** - Add 300ms delay to airport search input
3. **Pagination** - Show 20 airports at a time, load more on scroll
4. **Background sync** - Adjust intervals based on your needs
5. **Cache size** - Monitor AsyncStorage usage, clean old weather after 7 days

---

## 📱 Required Packages Summary

```json
{
  "dependencies": {
    "react-native-maps": "^1.4.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-app-state": "^2.5.0"
  }
}
```

All done! Your app now has:
✅ Live weather with offline fallback
✅ All airports cached locally
✅ Interactive map with airport markers
✅ Automatic background sync
✅ Works completely offline
