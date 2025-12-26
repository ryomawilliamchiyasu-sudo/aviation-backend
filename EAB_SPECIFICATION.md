# Electronic Aviation Book (EAB) - Full Specification

**Version**: 1.0  
**Last Updated**: December 25, 2025  
**Status**: In Development

---

## 1. Project Overview

This is a fully AI-integrated **Electronic Aviation Book (EAB)** designed for pilots, combining and expanding upon features offered by Garmin Pilot and ForeFlight, while introducing advanced AI-driven automation and transcription.

The app supports:
- ✅ Comprehensive flight planning
- ✅ Interactive moving maps
- ✅ Airport diagrams and detailed airport data
- ✅ Live aviation weather and briefings
- ✅ Deeply integrated AI assistant
- ✅ Integration with custom external aviation audio device
- ✅ Pilot, aircraft, and logbook management

The app is intended to function as a full-featured **EFB (Electronic Flight Bag)** suitable for both VFR and IFR operations.

---

## 2. Technology Stack

### Frontend
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Platforms**: iOS, Android, Web
- **Routing**: expo-router (file-based)
- **Styling**: React Native StyleSheet (dark aviation theme)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (CommonJS)
- **Deployment**: Render (auto-deploy from Git)
- **Port**: 3000 (local) / Production: `aviation-backend-ccw5.onrender.com`

### External APIs
- **Aviation Weather**: aviationweather.gov (METAR, TAF, SIGMETs, AIRMETs)
- **AI Integration**: OpenAI GPT-4o-mini (server-side for security)
- **Hardware**: Custom Bluetooth/USB-C audio device (planned)

### Project Structure
```
aviation-backend/
├── Backend Code (Node.js)
│   ├── server.js (main entry point)
│   ├── src/
│   │   ├── routes/ (API endpoints)
│   │   ├── controllers/ (request handlers)
│   │   └── services/ (business logic)
│   ├── .env (credentials - NOT in git)
│   └── API_*.md (endpoint documentation)
│
├── Frontend Code (React Native)
│   ├── app/ (expo-router file structure)
│   │   ├── (tabs)/ (tabbed interface)
│   │   ├── _layout.tsx (root navigation)
│   │   └── modal.tsx
│   ├── components/ (reusable UI components)
│   ├── hooks/ (custom React hooks)
│   ├── config.ts (backend URL configuration)
│   └── package.json
│
├── Shared Files
│   ├── metro.config.js (Expo bundler config)
│   ├── tsconfig.json (TypeScript config)
│   └── .gitignore
```

---

## 3. Deployment Architecture

### Development Environment
- **Backend**: `npm start` → runs on `http://localhost:3000`
- **Frontend**: `npm run web` → runs on `http://localhost:8081`
- **Config**: Set `USE_LOCAL = true` in `config.ts` for local development

### Production Environment
- **Frontend**: Expo (native iOS/Android apps + web deployment)
- **Backend**: Render Cloud (auto-deploys on git push)
- **Frontend URL**: Configurable in `config.ts` (currently production Render URL)
- **Backend URL**: `https://aviation-backend-ccw5.onrender.com`

---

## 4. Core Modules (MVP to Full Feature)

### ✅ Module 1: Weather (COMPLETE)
Display live aviation weather with real-time data.

**Features**:
- Display live METAR, TAF, SIGMET, AIRMET data
- UI with four separate, user-configurable weather panels
- Each panel displays a different location (fully customizable)
- Route-based weather summary along active flight plan
- Weather Data Includes:
  - NAV CANADA / FAA weather data
  - METARs (current conditions)
  - TAFs (term forecast)
  - NOTAMs (notices to airmen)
  - SIGMETs / AIRMETs (significant meteorological information)
  - Winds aloft
  - Radar and satellite imagery
  - Icing and turbulence forecasts
  - Temporary Flight Restrictions (TFRs)

**Advanced Features**:
- Graphical NOTAMs displayed on maps
- AI-generated weather briefing summaries
- Automatic alerts when weather changes affect planned route

**Current Status**: Core METAR/TAF display implemented. Displaying real data from aviationweather.gov.

**API Endpoints**:
- `GET /api/weather/metar/:icao` - Get current METAR
- `GET /api/weather/taf/:icao` - Get Terminal Aerodrome Forecast
- `GET /api/weather/:icao` - Get combined weather (METAR + TAF)

---

### 🔄 Module 2: Airport Plan (IN PROGRESS)
Search and display detailed airport information.

**Features**:
- Search all airports in North America
- Customizable quick-access airport buttons
- Save favorite or frequently used airports
- Display airport information:
  - Airport details and elevation
  - Runways and dimensions
  - Frequencies
  - Airport diagrams (geo-referenced where possible)
  - NOTAMs specific to airport
  - Fuel and services information
  - Other relevant aviation data

**Database**: Currently 6 Canadian airports (CYYZ, CYVR, CYUL, CYAZ, CYGM, CYQB)

**Planned**: Expand to full North American airport database

**API Endpoints**:
- `GET /api/airports/search?q=query` - Search by name or code
- `GET /api/airports/:icao` - Get airport details
- `GET /api/airports/province/:code` - Filter by province
- `GET /api/airports` - Get all airports

---

### 🔄 Module 3: Maps (PLANNED)
Interactive aeronautical map with navigation and planning.

**Features**:
- Show all airports in North America
- Interactive aeronautical map with selectable layers:
  - Airspace (Class A-E airspace)
  - Terrain
  - Obstacles
  - Traffic (future ADS-B integration)
  - Weather overlays
  - NOTAMs visualization
- Airport Markers showing:
  - Aerodrome type (CTAF, Class D, etc.)
  - Elevation
  - Key identifying information
- Map Interactions:
  - Tap airport → opens Airport Plan module
  - Drop multiple pins/waypoints
  - Calculate distance between points
  - Estimated flight time calculation
  - Fuel usage calculations (using aircraft profile & winds)
  - Direct-To and Nearest Airport functions
  - Emergency mode highlighting suitable alternates

**Integration**: All calculations reference Aircraft Profile data from "Other" module

**Status**: Not yet started

---

### 🔄 Module 4: Flight Planning (PLANNED)
Build, store, and manage flight plans.

**Features**:
- Build VFR and IFR flight plans
- Store multiple flight plans
- Suggested routing (historical/preferred routes)
- Flight plan filing (future integration)
- Route weather visualization
- Alternate airport planning
- Performance-based planning using aircraft data
- Integration with Maps module

**Status**: Not yet started

---

### ⭐ Module 5: AI Assist (CORE FEATURE - PLANNED)
AI-powered intelligence layer providing automation and decision support.

**Audio & Transcription**:
- Automatically transcribes audio from external device
- Real-time transcription of radio calls
- Continuous listening during flight

**Structured Information Panel**:
AI extracts and highlights critical data:
- Altimeter settings
- Assigned altitudes
- Headings
- Frequencies
- Clearances
- Squawk codes
- Runway assignments

**AI Capabilities**:
- Perform aviation calculations:
  - Fuel burn
  - Time en route
  - Distance
  - Weight & balance
- Answer aviation-related questions
- Summarize:
  - Weather briefings
  - NOTAMs
  - ATC instructions
- Provide smart alerts for:
  - Weather deterioration
  - Terrain conflicts
  - Airspace concerns
- Seamlessly reference and use data from:
  - Flight plans
  - Aircraft profile
  - Maps
  - Weather
  - Logbook
- Work across all app modules without requiring duplicate input

**API Endpoint**:
- `POST /ai/ask` - Send prompt to AI assistant (server-side processing)

**Status**: Backend endpoint created. Frontend UI not yet started.

---

### 🔄 Module 6: Other (Profile & Settings)

#### Pilot Profile
- Pilot profile information
- Certificates and currency tracking (future)
- Rating management

#### Aircraft Profile
- Aircraft performance data
- Fuel burn profiles
- Weight & balance calculations
- Custom checklists
- Performance tables for planning

#### Settings
- Units (metric / imperial)
- App preferences
- Data refresh intervals
- Notification preferences
- App updates
- General user settings

#### Logbook (Inspired by Garmin & ForeFlight)
- Electronic logbook
- Automatic flight detection using GPS
- Flight time tracking
- Route and aircraft association
- Export logs (PDF / CSV)
- Cloud sync across devices (future)

**Status**: Not yet started

---

### 📝 Module 7: Index Page (Multi-Purpose Workspace)

**Functions**:
- Write notes
- Build and edit flight plans
- Draft clearances or briefings
- AI-assisted planning notes
- Export/send via:
  - Email
  - Text message
  - Cloud storage

**Status**: Not yet started

---

## 5. Custom Hardware Device (Planned Integration)

### Device Overview
Custom aviation audio interface device with integrated AI capabilities.

### Device Capabilities
- **Connectivity**: Bluetooth or USB-C
- **Audio Integration**: Plugs into aircraft audio/microphone system
- **Power**: Independent power source
- **Functionality**: Streams live aircraft radio audio directly to app (ATC, CTAF, etc.)

### Purpose
1. Provide live radio audio to app
2. Enable real-time AI transcription
3. Allow AI to identify, extract, and highlight critical ATC information
4. Support hands-free operation during flight

### Integration Points
- App communicates with device via Bluetooth or USB-C
- Receives continuous audio stream
- Streams to AI module for real-time transcription
- Extracted data feeds into AI Assist module

**Status**: Hardware specification drafted. Integration planned for Q2 2026.

---

## 6. Data Flow Architecture

### Weather Data Flow
```
Frontend Weather Screen
    ↓
useWeather Hook (fetch)
    ↓
config.ts (BACKEND_URL)
    ↓
Backend: GET /api/weather/:icao
    ↓
weatherController
    ↓
weatherService
    ↓
aviationweather.gov API
    ↓
Real-time METAR/TAF data
    ↓
MetarDisplay & TafDisplay Components
```

### AI Processing Flow (Future)
```
Custom Audio Device
    ↓ (Bluetooth/USB-C)
App Audio Stream
    ↓
AI Assist Module
    ↓
OpenAI GPT-4o-mini (server-side)
    ↓
Transcribed + Extracted Data
    ↓
Structured Information Panel
    ↓
Smart Alerts & Suggestions
```

### Flight Planning Flow (Future)
```
Index Page (notes/planning)
    ↓
Maps Module (route drawing)
    ↓
Aircraft Profile (performance data)
    ↓
Weather Module (route briefing)
    ↓
AI Assist (flight plan optimization)
    ↓
Flight Plan Export (email/cloud)
```

---

## 7. Current Implementation Status

### ✅ COMPLETED
- [x] Backend Express.js server with CORS
- [x] Real-time weather API integration (aviationweather.gov)
- [x] METAR endpoint: `GET /api/weather/metar/:icao`
- [x] TAF endpoint: `GET /api/weather/taf/:icao`
- [x] Combined weather endpoint: `GET /api/weather/:icao`
- [x] Airport API endpoints (search, details, filtering)
- [x] Root endpoint with API documentation
- [x] AI endpoint stub: `POST /ai/ask`
- [x] Frontend Expo project setup
- [x] expo-router file-based routing
- [x] Tab-based navigation structure
- [x] TypeScript throughout
- [x] Custom `useWeather` hook
- [x] `MetarDisplay` component (beautifully styled)
- [x] `TafDisplay` component
- [x] Weather screen UI (search, quick buttons, real data)
- [x] Dark aviation theme
- [x] Git integration with auto-deploy to Render
- [x] Environment variables management (.env)

### 🔄 IN PROGRESS
- 🔄 Airport Plan module (UI partially started)
- 🔄 Testing weather data with real airports

### 📋 PLANNED (Next Priority)
1. **Maps Module** - Interactive map with airports and layers
2. **Flight Planning** - Build and store flight plans
3. **AI Assist UI** - Audio interface and transcription display
4. **Other Module** - Pilot/Aircraft profiles, logbook

### ⏳ FUTURE
- Hardware device integration (Q2 2026)
- Cloud sync and cross-device support
- Flight plan filing integration
- ADS-B traffic integration
- Advanced weather radar/satellite
- Professional features (IFR briefings, NOTAM management)

---

## 8. API Documentation Reference

### Base URLs
- **Local Development**: `http://localhost:3000`
- **Production**: `https://aviation-backend-ccw5.onrender.com`

### Weather Endpoints
See [API_WEATHER.md](API_WEATHER.md) for detailed weather API documentation.

### Airport Endpoints
See [API_AIRPORTS.md](API_AIRPORTS.md) for detailed airport API documentation.

### Health Check
```
GET /test
Response: { "ok": true, "message": "API alive" }
```

### API Root Documentation
```
GET /
Response: Complete API endpoint listing with descriptions
```

---

## 9. Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd /Users/ryoma/aviation-backend
npm start
# Backend runs on http://localhost:3000

# Terminal 2: Frontend
npm run web
# Frontend runs on http://localhost:8081
```

### Configuration
- Edit `config.ts` to toggle between local (`USE_LOCAL = true`) and production (`USE_LOCAL = false`)

### Git Workflow
```bash
git add .
git commit -m "feat: description"
git push origin main
# Auto-deploys to Render
```

### Testing
- Backend: Test endpoints with curl or Postman
- Frontend: Test in browser at http://localhost:8081
- Both: Monitor browser console and terminal logs

---

## 10. Architecture Principles

### Security
- ✅ API keys stored in backend `.env` file (never exposed to frontend)
- ✅ AI requests processed server-side (OpenAI key protected)
- ✅ CORS enabled only for frontend URL
- ✅ Input validation on all endpoints

### Scalability
- ✅ Modular backend (routes → controllers → services)
- ✅ Real external APIs (not mocked data after MVP)
- ✅ Cloud deployment (Render auto-scaling)
- ✅ TypeScript for type safety

### User Experience
- ✅ Dark aviation theme (reduces eye strain at night)
- ✅ Offline support (future - local data caching)
- ✅ Real-time data (live weather, radio audio)
- ✅ Intuitive navigation (tabs + modals)

### Maintainability
- ✅ Clear file structure
- ✅ Comprehensive API documentation
- ✅ Git history tracking all changes
- ✅ Environment-based configuration
- ✅ TypeScript for code clarity

---

## 11. Performance Targets

- **Weather Data**: < 2 seconds (real API calls)
- **Airport Search**: < 1 second (local data)
- **Map Rendering**: 60 FPS (React Native optimized)
- **AI Response**: < 5 seconds (OpenAI API latency)
- **App Load Time**: < 3 seconds (Expo optimized)

---

## 12. Future Roadmap

### Phase 1: MVP (Current - Q1 2026)
- ✅ Weather module
- 🔄 Airport module
- 📋 Basic Maps (read-only)

### Phase 2: Core Features (Q2 2026)
- Flight Planning module
- AI Assist (with basic audio)
- Logbook (manual entry)

### Phase 3: Advanced Features (Q3 2026)
- Hardware audio device integration
- Real-time transcription
- Advanced ATC extraction

### Phase 4: Professional Features (Q4 2026+)
- IFR briefings
- Advanced NOTAM management
- Cloud sync
- Professional analytics

---

## 13. Support & Contact

**Backend Deployment**: Render (auto-deployed)  
**Frontend Deployment**: Expo (native apps)  
**Git Repository**: GitHub (Main branch auto-deploys)  
**Status**: Active Development

---

**Last Updated**: December 25, 2025  
**Maintained By**: Aviation Backend Team
