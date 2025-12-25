# Weather Endpoints Documentation

## Overview

Real-time aviation weather endpoints powered by the **FAA/NavCanada Aviation Weather Center** (aviationweather.gov).

Returns current METAR (observational) and TAF (forecast) data with clean JSON formatting, raw text, and decoded fields for easy frontend consumption.

### Data Source

- **API:** aviationweather.gov (official FAA/NavCanada data)
- **Coverage:** All airports worldwide with available data
- **Refresh Rate:** Real-time (updates every 1-5 minutes)
- **Accuracy:** Official aviation reporting standard

---

## Architecture

```
src/
  ├── routes/
  │   └── weatherRoutes.js           (Endpoint definitions)
  ├── controllers/
  │   └── weatherController.js       (Request handling & validation)
  └── services/
      └── weatherService.js          (API integration & data parsing)
```

---

## Endpoints

### 1. Get METAR (Current Conditions)

**GET** `/api/weather/metar/:icao`

Fetch current meteorological aerodrome report (real-time weather observation).

**Path Parameters:**
- `icao` (string, required) - 4-letter ICAO code (e.g., CYYZ, KJFK)

**Response:**
```json
{
  "status": "ok",
  "type": "METAR",
  "data": {
    "icao": "CYYZ",
    "timestamp": "2025-12-25T18:56:00Z",
    "rawText": "METAR CYYZ 251856Z 31008KT 10SM FEW040 OVC100 23/14 A3012 RMK FU8",
    "wind": {
      "direction": 310,
      "speed": 8,
      "gust": null,
      "unit": "knots"
    },
    "visibility": {
      "miles": 10,
      "meters": 16093.4,
      "unit": "miles"
    },
    "temperature": {
      "celsius": 23,
      "fahrenheit": 73.4
    },
    "dewpoint": {
      "celsius": 14,
      "fahrenheit": 57.2
    },
    "altimeter": {
      "inchesHg": 30.12,
      "hectopascals": 1020.6
    },
    "flightCategory": "VFR",
    "ceiling": {
      "altitude": 10000,
      "coverage": "OVC",
      "unit": "feet"
    },
    "clouds": [
      {
        "cover": "FEW",
        "base": {
          "value": 4000,
          "unit": "feet"
        }
      },
      {
        "cover": "OVC",
        "base": {
          "value": 10000,
          "unit": "feet"
        }
      }
    ],
    "remarks": "FU8"
  }
}
```

**Error Response (Invalid ICAO):**
```json
{
  "error": "Invalid ICAO code",
  "message": "ICAO code must be exactly 4 letters (e.g., CYYZ)",
  "received": "YYZ"
}
```

**Error Response (No Data):**
```json
{
  "error": true,
  "message": "No METAR data found for airport XXXX",
  "icao": "XXXX"
}
```

**Examples:**
```bash
# Toronto Pearson
curl "http://localhost:3000/api/weather/metar/CYYZ"

# New York JFK
curl "http://localhost:3000/api/weather/metar/KJFK"

# San Francisco
curl "http://localhost:3000/api/weather/metar/KSFO"
```

---

### 2. Get TAF (Forecast)

**GET** `/api/weather/taf/:icao`

Fetch terminal aerodrome forecast (30-hour forecast from airport weather service).

**Path Parameters:**
- `icao` (string, required) - 4-letter ICAO code

**Response:**
```json
{
  "status": "ok",
  "type": "TAF",
  "data": {
    "icao": "CYYZ",
    "timestamp": "2025-12-25T18:00:00Z",
    "validPeriod": {
      "start": "2025-12-25T18:00:00Z",
      "end": "2025-12-26T24:00:00Z"
    },
    "rawText": "TAF CYYZ 251720Z 2518/2624 31015G25KT P6SM FEW040 OVC100",
    "forecastGroups": [
      {
        "timeRange": {
          "start": "2025-12-25T18:00:00Z",
          "end": "2025-12-25T24:00:00Z"
        },
        "wind": {
          "direction": 310,
          "speed": 15,
          "gust": 25,
          "unit": "knots"
        },
        "visibility": {
          "miles": 6
        },
        "weather": [],
        "clouds": [
          {
            "cover": "FEW",
            "base": {
              "value": 4000
            }
          }
        ],
        "ceiling": {
          "altitude": 10000,
          "coverage": "OVC",
          "unit": "feet"
        },
        "changeIndicator": "BECMG"
      }
    ]
  }
}
```

**Examples:**
```bash
curl "http://localhost:3000/api/weather/taf/CYYZ"
curl "http://localhost:3000/api/weather/taf/KJFK"
```

---

### 3. Get Combined (METAR + TAF)

**GET** `/api/weather/:icao`

Get current conditions and forecast together for complete weather briefing.

**Path Parameters:**
- `icao` (string, required) - 4-letter ICAO code

**Response:**
```json
{
  "status": "ok",
  "data": {
    "icao": "CYYZ",
    "metar": {
      "icao": "CYYZ",
      "timestamp": "2025-12-25T18:56:00Z",
      "rawText": "METAR CYYZ 251856Z...",
      "wind": {...},
      "visibility": {...},
      "temperature": {...},
      "flightCategory": "VFR"
    },
    "taf": {
      "icao": "CYYZ",
      "timestamp": "2025-12-25T18:00:00Z",
      "rawText": "TAF CYYZ 251720Z...",
      "forecastGroups": [...]
    },
    "errors": {
      "metar": null,
      "taf": null
    }
  }
}
```

**Error Response (Both unavailable):**
```json
{
  "error": "No weather data available",
  "icao": "XXXX",
  "message": "Could not retrieve weather for XXXX",
  "details": {
    "metar": "No METAR data found...",
    "taf": "No TAF data found..."
  }
}
```

**Examples:**
```bash
# Complete weather briefing
curl "http://localhost:3000/api/weather/CYYZ"
curl "http://localhost:3000/api/weather/KJFK"
```

---

## Response Fields Explained

### Flight Categories (from METAR)

| Category | Visibility | Ceiling | Meaning |
|----------|-----------|---------|---------|
| **VFR** | > 5 SM | > 3,000 ft | Visual Flight Rules (safe for VFR) |
| **MVFR** | 3-5 SM | 1,000-3,000 ft | Marginal VFR |
| **IFR** | 1-3 SM | 500-1,000 ft | Instrument Flight Rules required |
| **LIFR** | < 1 SM | < 500 ft | Low IFR (hazardous) |

### Ceiling Definition

Ceiling = **lowest cloud layer at or above 5,000 feet** that is **broken (BKN) or overcast (OVC)**

- If no such layer exists, ceiling is reported as `null`
- Pilots use ceiling to determine flight category & route planning

### Cloud Coverage Codes

- `SKC` / `CLR` - Clear (no clouds)
- `FEW` - 1/8 to 2/8 coverage
- `SCT` - Scattered (3/8 to 4/8)
- `BKN` - Broken (5/8 to 7/8) ← contributes to ceiling
- `OVC` - Overcast (8/8) ← contributes to ceiling

### Wind Format

- **direction** - Magnetic compass heading (0-360°)
- **speed** - Wind speed in knots
- **gust** - Wind gust speed (if available)

Example: `31008KT` = from 310° at 8 knots

---

## ICAO Code Validation

All endpoints validate ICAO codes:
- **Must be exactly 4 letters**
- **Must be uppercase** (automatically converted)
- **Examples:** CYYZ, KJFK, KSFO, EGLL, RJTT

Invalid formats return HTTP 400:
```bash
curl "http://localhost:3000/api/weather/metar/YYZ"      # Too short
curl "http://localhost:3000/api/weather/metar/CYYZ1"    # Too long
curl "http://localhost:3000/api/weather/metar/cyyz"     # Lowercase (auto-converted)
```

---

## Frontend Integration

### TypeScript Example

```typescript
import { BACKEND_URL } from '../config';

interface MetarData {
  icao: string;
  timestamp: string;
  rawText: string;
  wind: { direction: number; speed: number };
  temperature: { celsius: number; fahrenheit: number };
  flightCategory: string;
}

// Get current conditions
const getMetar = async (icao: string): Promise<MetarData | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/weather/metar/${icao}`);
    if (!response.ok) throw new Error('Failed to fetch METAR');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('METAR error:', error);
    return null;
  }
};

// Get complete briefing
const getWeatherBriefing = async (icao: string) => {
  const response = await fetch(`${BACKEND_URL}/api/weather/${icao}`);
  const json = await response.json();
  return json.data; // { metar, taf, errors }
};
```

### React Component Example

```tsx
export function WeatherCard({ icao }: { icao: string }) {
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      const data = await getMetar(icao);
      setMetar(data);
      setLoading(false);
    };
    fetchWeather();
  }, [icao]);

  if (loading) return <ActivityIndicator />;
  if (!metar) return <Text>No weather data</Text>;

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        {metar.icao} - {metar.flightCategory}
      </Text>
      <Text>Wind: {metar.wind.direction}° at {metar.wind.speed} knots</Text>
      <Text>Temp: {metar.temperature.celsius}°C</Text>
      <Text>Raw: {metar.rawText}</Text>
    </View>
  );
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Valid weather data returned |
| 400 | Bad Request | Invalid ICAO code format |
| 404 | Not Found | No data for airport |
| 500 | Server Error | API unavailable |

---

## Future Enhancements

- [ ] Caching (1-5 min) to reduce API calls
- [ ] Graphical decoding (SKY CONDITION graphics)
- [ ] Alerts for severe weather (SIGMET, AIRMET)
- [ ] Trend analysis (improving/deteriorating)
- [ ] Multi-airport briefings
- [ ] Historical data archive
- [ ] Weather comparison between airports
- [ ] Route-based weather assessment
