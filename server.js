require('dotenv').config();
const express = require('express');
const cors = require('cors');
const airportRoutes = require('./src/routes/airportRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Ensure JSON responses only
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Mount routes
app.use('/api/airports', airportRoutes);
app.use('/api/weather', weatherRoutes);

// Root route - API info
app.get('/', (_req, res) => {
  res.json({
    name: 'Aviation Backend API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      airports: {
        search: 'GET /api/airports/search?q=query',
        byICAO: 'GET /api/airports/:icao',
        byProvince: 'GET /api/airports/province/:code',
        all: 'GET /api/airports'
      },
      weather: {
        metar: 'GET /api/weather/metar/:icao',
        taf: 'GET /api/weather/taf/:icao',
        combined: 'GET /api/weather/:icao'
      },
      ai: 'POST /ai/ask',
      health: 'GET /health'
    }
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Legacy test endpoint (deprecated, use /health)
app.get('/test', (_req, res) => {
  res.json({ ok: true, message: 'API alive' });
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
