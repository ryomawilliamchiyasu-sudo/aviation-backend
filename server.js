require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const airports = [
  { id: 1, code: 'CYYZ', name: 'Toronto Pearson Intl', lat: 43.6777, lon: -79.6248 },
  { id: 2, code: 'CYVR', name: 'Vancouver Intl', lat: 49.1951, lon: -123.1779 },
  { id: 3, code: 'CYYC', name: 'Calgary Intl', lat: 51.1225, lon: -114.0136 },
];

app.get('/test', (_req, res) => {
  res.json({ ok: true, message: 'API alive' });
});

app.get('/airports', (_req, res) => {
  res.json(airports);
});

app.get('/airports/:id', (req, res) => {
  const id = Number(req.params.id);
  const airport = airports.find((a) => a.id === id);
  if (!airport) {
    return res.status(404).json({ error: 'Airport not found' });
  }
  res.json(airport);
});

app.get('/weather', (req, res) => {
  const station = (req.query.station || 'CYYZ').toString().toUpperCase();
  const now = new Date().toISOString();

  // Mock METAR-like payload for local testing
  res.json({
    station,
    raw_text: `METAR ${station} 121200Z 24005KT 10SM FEW020 SCT080 20/12 A2992 RMK AO2`,
    issued_at: now,
    wind_kt: 5,
    visibility_sm: 10,
    temp_c: 20,
  });
});

// AI endpoint - secure server-side processing
app.post('/ai/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: openaiKey });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const message = completion.choices[0]?.message?.content || 'No response';
    res.json({ response: message });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('AI error:', message);
    res.status(500).json({ error: `AI processing failed: ${message}` });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
