const { OpenAI } = require('openai');
const AirportService = require('./airportService');
const WeatherService = require('./weatherService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhanced AI service with access to real aviation data
 * Fetches weather, airports, and other relevant data to provide informed answers
 */
class AIEnhancedService {
  /**
   * Process a prompt with real data context
   * @param {string} prompt - User question
   * @param {Object} options - { icao, query, type }
   * @returns {Promise<string>} AI response with real data
   */
  static async processWithContext(prompt, options = {}) {
    try {
      // Validate prompt
      if (!prompt || !prompt.trim()) {
        throw new Error('Prompt is required');
      }

      const promptTrimmed = prompt.trim();

      // Build context from available data
      let context = '';

      // If ICAO is provided, fetch weather data
      if (options.icao) {
        try {
          const weather = await WeatherService.getWeather(options.icao);
          if (weather.metar) {
            context += `\n📊 METAR for ${options.icao}:\n${JSON.stringify(weather.metar, null, 2)}\n`;
          }
          if (weather.taf) {
            context += `\n📊 TAF for ${options.icao}:\n${JSON.stringify(weather.taf, null, 2)}\n`;
          }
        } catch (err) {
          console.warn(`Could not fetch weather for ${options.icao}:`, err.message);
        }
      }

      // If search query provided, fetch airport data
      if (options.query) {
        try {
          const airports = AirportService.search(options.query);
          if (airports.length > 0) {
            context += `\n✈️ Airports matching "${options.query}":\n`;
            airports.slice(0, 5).forEach(airport => {
              context += `- ${airport.icao} (${airport.iata}): ${airport.name}, ${airport.city}, ${airport.province}\n`;
            });
          }
        } catch (err) {
          console.warn('Could not fetch airports:', err.message);
        }
      }

      // Build system prompt with data context
      const systemPrompt = `You are an expert aviation consultant with access to real-time data. 
You provide accurate, safety-critical aviation information based on real data when available.

${context ? `\nREAL DATA AVAILABLE:\n${context}` : ''}

Guidelines:
- Provide specific, data-backed answers when real data is available
- Be precise about weather conditions, airport info, and navigation
- For flight planning, consider actual weather conditions
- Always prioritize safety in your recommendations
- If data is missing, acknowledge it clearly`;

      // Call OpenAI with enhanced context
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: promptTrimmed,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'No response generated';
      return response;

    } catch (error) {
      console.error('Enhanced AI error:', error.message);
      throw error;
    }
  }

  /**
   * Get weather-informed response
   * @param {string} prompt - User question
   * @param {string} icao - Airport ICAO code
   * @returns {Promise<string>} AI response with weather data
   */
  static async getWeatherInformedResponse(prompt, icao) {
    return this.processWithContext(prompt, { icao });
  }

  /**
   * Get airport-informed response
   * @param {string} prompt - User question
   * @param {string} query - Airport search query
   * @returns {Promise<string>} AI response with airport data
   */
  static async getAirportInformedResponse(prompt, query) {
    return this.processWithContext(prompt, { query });
  }

  /**
   * Intelligent routing - detect what data the user is asking about
   * @param {string} prompt - User question
   * @returns {Promise<string>} AI response with appropriate context
   */
  static async intelligentResponse(prompt) {
    // Detect ICAO codes in prompt (4-letter airport codes)
    const icaoMatch = prompt.match(/\b([A-Z]{4})\b/);
    const icao = icaoMatch ? icaoMatch[1] : null;

    // Detect airport/location keywords
    const hasAirportKeywords = /airport|airfield|where|location|city/i.test(prompt);
    const query = hasAirportKeywords 
      ? prompt.match(/(?:airport|airfield|in|at)\s+([A-Za-z\s]+)(?:\?|$)/)?.[1] 
      : null;

    // Detect weather keywords
    const hasWeatherKeywords = /weather|metar|taf|wind|temp|visibility|condition/i.test(prompt);

    // Build options for context
    const options = {};
    if (hasWeatherKeywords && icao) options.icao = icao;
    if (hasAirportKeywords && query) options.query = query;

    return this.processWithContext(prompt, options);
  }
}

module.exports = AIEnhancedService;
