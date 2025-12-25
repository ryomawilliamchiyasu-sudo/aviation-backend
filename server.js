require('dotenv').config();
const express = require('express');
const cors = require('cors');
const airportRoutes = require('./src/routes/airportRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/airports', airportRoutes);
app.use('/api/weather', weatherRoutes);

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
