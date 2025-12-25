# Airport Endpoints Documentation

## Overview

The backend now provides modular, RESTful airport search and detail endpoints with a comprehensive Canadian airports dataset.

### Architecture

```
src/
  ├── routes/
  │   └── airportRoutes.js          (Route definitions)
  ├── controllers/
  │   └── airportController.js      (Request handling & validation)
  ├── services/
  │   └── airportService.js         (Business logic & queries)
  └── data/
      └── airports.json             (Airport dataset)
```

---

## Endpoints

### 1. Search Airports

**GET** `/api/airports/search?q=query`

Search airports by name, city, ICAO code, or IATA code.

**Query Parameters:**
- `q` (string, required) - Search term (minimum 2 characters)

**Response:**
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

**Error Responses:**
```json
// Missing or too short query
{
  "error": "Missing search query parameter \"q\"",
  "example": "/api/airports/search?q=toronto"
}

// No results
{
  "query": "xyz",
  "count": 0,
  "results": []
}
```

**Examples:**
```bash
# Search by city
curl "http://localhost:3000/api/airports/search?q=vancouver"

# Search by ICAO
curl "http://localhost:3000/api/airports/search?q=CYYZ"

# Search by IATA
curl "http://localhost:3000/api/airports/search?q=YYZ"
```

---

### 2. Get Airport Details

**GET** `/api/airports/:icao`

Get complete details for an airport by ICAO code.

**Path Parameters:**
- `icao` (string, required) - ICAO code (e.g., CYYZ, CYVR)

**Response:**
```json
{
  "status": "ok",
  "data": {
    "icao": "CYYZ",
    "iata": "YYZ",
    "name": "Toronto Pearson International Airport",
    "city": "Toronto",
    "province": "ON",
    "country": "CA",
    "latitude": 43.6772,
    "longitude": -79.6306,
    "elevation": 567,
    "elevationFeet": 1860,
    "timezone": "EST",
    "type": "public",
    "runways": [
      {
        "designation": "06L/24R",
        "length": 4002,
        "width": 61,
        "surface": "Asphalt"
      },
      {
        "designation": "06R/24L",
        "length": 3352,
        "width": 61,
        "surface": "Asphalt"
      }
    ],
    "frequencies": [
      {
        "type": "ATIS",
        "frequency": "128.75"
      },
      {
        "type": "Tower",
        "frequency": "118.10"
      }
    ],
    "services": [
      "FBO",
      "Fuel",
      "Maintenance",
      "Hangar",
      "Restaurant",
      "Hotel"
    ]
  }
}
```

**Error Response:**
```json
{
  "error": "Airport with ICAO code \"XXXX\" not found",
  "suggestion": "Try searching first: /api/airports/search?q=toronto"
}
```

**Examples:**
```bash
curl "http://localhost:3000/api/airports/CYYZ"
curl "http://localhost:3000/api/airports/CYVR"
curl "http://localhost:3000/api/airports/CYYC"
```

---

### 3. Get All Airports (Summary)

**GET** `/api/airports`

Get a summary list of all airports in the database.

**Response:**
```json
{
  "count": 6,
  "airports": [
    {
      "icao": "CYYZ",
      "iata": "YYZ",
      "name": "Toronto Pearson International Airport",
      "city": "Toronto",
      "province": "ON",
      "elevation": 1860
    },
    {
      "icao": "CYVR",
      "iata": "YVR",
      "name": "Vancouver International Airport",
      "city": "Vancouver",
      "province": "BC",
      "elevation": 16
    }
  ]
}
```

---

### 4. Get Airports by Province

**GET** `/api/airports/province/:province`

Get all airports in a specific province.

**Path Parameters:**
- `province` (string, required) - 2-letter province code (ON, BC, AB, QC, etc.)

**Response:**
```json
{
  "province": "ON",
  "count": 2,
  "airports": [
    {
      "icao": "CYYZ",
      "iata": "YYZ",
      "name": "Toronto Pearson International Airport",
      "city": "Toronto"
    },
    {
      "icao": "CYOW",
      "iata": "YOW",
      "name": "Ottawa Macdonald-Cartier International Airport",
      "city": "Ottawa"
    }
  ]
}
```

**Examples:**
```bash
curl "http://localhost:3000/api/airports/province/ON"
curl "http://localhost:3000/api/airports/province/BC"
curl "http://localhost:3000/api/airports/province/AB"
```

---

## Current Dataset

The system includes **6 major Canadian airports**:

| ICAO | IATA | City       | Province |
|------|------|------------|----------|
| CYYZ | YYZ  | Toronto    | ON       |
| CYVR | YVR  | Vancouver  | BC       |
| CYYC | YYC  | Calgary    | AB       |
| CYUL | YUL  | Montreal   | QC       |
| CYEG | YEG  | Edmonton   | AB       |
| CYOW | YOW  | Ottawa     | ON       |

Each airport includes:
- ✓ Basic info (ICAO, IATA, name, city, province)
- ✓ Coordinates & elevation
- ✓ Runway details (designation, length, width, surface)
- ✓ Radio frequencies (ATIS, Ground, Tower, Approach)
- ✓ Available services (FBO, Fuel, Maintenance, etc.)

---

## Frontend Integration

### TypeScript Example

```typescript
import { BACKEND_URL } from '../config';

// Search airports
const searchAirports = async (query: string) => {
  const response = await fetch(
    `${BACKEND_URL}/api/airports/search?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results; // Array of matching airports
};

// Get airport details
const getAirportDetails = async (icao: string) => {
  const response = await fetch(`${BACKEND_URL}/api/airports/${icao}`);
  const data = await response.json();
  return data.data; // Complete airport object
};
```

---

## Future Enhancements

- [ ] Real METAR/TAF data integration
- [ ] Weather for each airport
- [ ] Runway surface conditions
- [ ] NOTAMs by airport
- [ ] Fuel availability & prices
- [ ] FBO contact information
- [ ] Approach chart metadata
- [ ] Add more Canadian airports
- [ ] Add US/international airports
