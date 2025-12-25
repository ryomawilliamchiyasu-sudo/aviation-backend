const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Mock weather data endpoint
app.get('/weather', (req, res) => {
  const station = req.query.station || 'CYYZ';
  const mockData = [
    { station, type: 'METAR', report: 'CYYZ 231600Z 28012KT 10SM FEW020 SCT050 BKN100 01/M02 A3012' },
    { station, type: 'TAF', report: 'CYYZ 231120Z 2312/2412 28012KT P6SM SCT050' },
  ];
  res.json(mockData);
});

// Mock airport data endpoint
app.get('/airport', (req, res) => {
  const code = req.query.code || 'CYYZ';
  const mockAirportData = {
    name: 'Toronto Pearson International Airport',
    code,
    location: 'Mississauga, ON, Canada',
    runways: [
      { id: 1, heading: '05/23', length: '11,200 ft', surface: 'Asphalt' },
      { id: 2, heading: '15/33', length: '9,500 ft', surface: 'Asphalt' },
    ],
    frequencies: [
      { type: 'Tower', freq: '118.7 MHz' },
      { type: 'Ground', freq: '121.9 MHz' },
      { type: 'Unicom', freq: '123.0 MHz' },
    ],
  };
  res.json(mockAirportData);
});

// Mock AI transcription endpoint
app.post('/ai/transcribe', (req, res) => {
  const mockTranscription = 'Crosswind component for 20 knots at 30 degrees';
  res.json({ transcription: mockTranscription });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});