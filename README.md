# Aviation Backend API

Backend server for aviation weather and airport information.

## Features

- **Weather Data**: Fetches live METAR data from aviationweather.gov
- **Airport Information**: Mock airport details, runways, and frequencies
- **AI Transcription**: Mock endpoint for future implementation
- **CORS Enabled**: Ready for frontend integration

## API Endpoints

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/test` | GET | - | Health check |
| `/weather` | GET | `?station=CYYZ` | Live METAR data |
| `/airport` | GET | `?code=CYYZ` | Airport info (mock) |
| `/ai/transcribe` | POST | JSON body | AI transcription (mock) |

## Local Development

```bash
npm install
npm run dev      # Mock server (index.js)
npm start        # Production server (server.js)
```

## Deployment

Deployed on Render: [Your URL will be here]

## Environment Variables

- `PORT`: Server port (default: 3000)

## Tech Stack

- Node.js
- Express
- node-fetch (for API calls)
- CORS enabled
