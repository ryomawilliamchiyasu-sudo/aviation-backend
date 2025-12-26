require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const airportRoutes = require('./src/routes/airportRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');
const { setupWebSocket } = require('./src/websocket');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// CORS configuration - allow localhost:8082 (Expo web dev) and any HTTPS origin
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:8084',      // Expo dev (main)
      'http://localhost:8082',      // Expo web dev
      'http://localhost:8081',      // Expo web fallback
      'http://localhost:3000',      // Local backend
      'http://127.0.0.1:8084',
      'http://127.0.0.1:8082',
      'http://127.0.0.1:8081',
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.onrender\.com$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  
  // Log response when it finishes
  res.on('finish', () => {
    console.log(`   → ${res.statusCode} ${req.path}`);
  });
  
  next();
});

// Ensure JSON responses only
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  
  // Override default error handler to always return JSON
  const originalJson = res.json;
  res.json = function(data) {
    // Make sure Content-Type is set
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, data);
  };
  
  next();
});

// Simple in-memory rate limiting for AI endpoint
const requestCounts = new Map();
function checkRateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }
  
  let times = requestCounts.get(key);
  times = times.filter(t => now - t < windowMs);
  
  if (times.length >= limit) {
    return false;
  }
  
  times.push(now);
  requestCounts.set(key, times);
  return true;
}

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
    
    // Validate prompt
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const promptTrimmed = prompt.trim();
    
    // Cap prompt length (2-4k characters)
    const MAX_PROMPT_LENGTH = 4000;
    if (promptTrimmed.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({ 
        error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
        received: promptTrimmed.length
      });
    }
    
    // Rate limiting - 10 requests per 60 seconds per IP
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp, 10, 60000)) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a moment.' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: openaiKey });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: promptTrimmed }],
      max_tokens: 500,
    });

    const message = completion.choices[0]?.message?.content || 'No response';
    res.json({ response: message });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('AI error:', message);
    
    // Handle rate limit errors from OpenAI
    if (message.includes('rate_limit')) {
      return res.status(429).json({ error: 'OpenAI API rate limited. Please try again shortly.' });
    }
    
    res.status(500).json({ error: `AI processing failed: ${message}` });
  }
});

// Global error handler (must be before 404 handler)
app.use((err, _req, res, _next) => {
  console.error('🔴 Server Error:', {
    message: err.message,
    status: err.status || 500,
    path: _req.path,
    method: _req.method
  });
  
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - return JSON instead of HTML
app.use((req, res) => {
  console.warn('⚠️  404 Not Found:', req.method, req.path);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Setup WebSocket for audio transcription
setupWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`Health check: GET /health`);
  console.log(`Weather: GET /api/weather/:icao`);
  console.log(`AI: POST /ai/ask`);
  console.log(`WebSocket: ws://localhost:${PORT} (audio transcription)`);
});
