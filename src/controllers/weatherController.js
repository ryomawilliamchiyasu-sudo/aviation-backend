const WeatherService = require('../services/weatherService');

class WeatherController {
  /**
   * Get METAR data
   * GET /api/weather/metar/:icao
   */
  static async getMetar(req, res) {
    try {
      const { icao } = req.params;

      // Validate ICAO format
      if (!WeatherService.validateIcao(icao)) {
        return res.status(400).json({
          error: 'Invalid ICAO code',
          message: 'ICAO code must be exactly 4 letters (e.g., CYYZ)',
          received: icao
        });
      }

      const data = await WeatherService.getMetar(icao);

      // Handle service errors
      if (data.error) {
        const statusCode = data.status === 404 ? 404 : 500;
        return res.status(statusCode).json(data);
      }

      return res.json({
        status: 'ok',
        type: 'METAR',
        data
      });
    } catch (error) {
      console.error('METAR controller error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve METAR data'
      });
    }
  }

  /**
   * Get TAF data
   * GET /api/weather/taf/:icao
   */
  static async getTaf(req, res) {
    try {
      const { icao } = req.params;

      // Validate ICAO format
      if (!WeatherService.validateIcao(icao)) {
        return res.status(400).json({
          error: 'Invalid ICAO code',
          message: 'ICAO code must be exactly 4 letters (e.g., CYYZ)',
          received: icao
        });
      }

      const data = await WeatherService.getTaf(icao);

      // Handle service errors
      if (data.error) {
        const statusCode = data.status === 404 ? 404 : 500;
        return res.status(statusCode).json(data);
      }

      return res.json({
        status: 'ok',
        type: 'TAF',
        data
      });
    } catch (error) {
      console.error('TAF controller error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve TAF data'
      });
    }
  }

  /**
   * Get combined METAR and TAF
   * GET /api/weather/:icao
   */
  static async getCombined(req, res) {
    try {
      const { icao } = req.params;

      // Validate ICAO format
      if (!WeatherService.validateIcao(icao)) {
        return res.status(400).json({
          error: 'Invalid ICAO code',
          message: 'ICAO code must be exactly 4 letters (e.g., CYYZ)',
          received: icao
        });
      }

      const data = await WeatherService.getCombined(icao);

      // Check if both data sources failed
      if (data.metar === null && data.taf === null) {
        return res.status(404).json({
          error: 'No weather data available',
          icao: icao.toUpperCase(),
          message: `Could not retrieve weather for ${icao.toUpperCase()}`,
          details: data.errors
        });
      }

      return res.json({
        status: 'ok',
        data
      });
    } catch (error) {
      console.error('Combined weather controller error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve weather data'
      });
    }
  }
}

module.exports = WeatherController;
